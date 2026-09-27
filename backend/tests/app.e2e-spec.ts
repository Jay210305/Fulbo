import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';

const here = resolve(fileURLToPath(import.meta.url), '../..');

const devUrl = readFileSync(resolve(here, '.env'), 'utf8')
  .match(/^DATABASE_URL=(.*)$/m)![1]
  .trim()
  .replace(/^["']|["']$/g, '');
const E2E_DATABASE_URL = devUrl.replace(/\/[^/?]+(\?|$)/, '/fulbo_e2e$1');

process.env.DATABASE_URL = E2E_DATABASE_URL;

const { AppModule } = await import('../src/app.module.js');
const { configureApp } = await import('../src/app.bootstrap.js');

const DEV_OTP = '123456';

let app: INestApplication;

function exec(command: string, env: NodeJS.ProcessEnv = process.env) {
  execSync(command, { cwd: here, env, stdio: 'pipe' });
}

async function registerVerifiedUser(email: string) {
  const register = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ email, password: 'Passw0rd!123', firstName: 'Elena', lastName: 'Vega' });
  const token = register.body.token;
  await request(app.getHttpServer())
    .post('/api/auth/send-otp')
    .set('Authorization', `Bearer ${token}`)
    .send({ phone: '987654321', countryCode: '+51' });
  await request(app.getHttpServer())
    .post('/api/auth/verify-otp')
    .set('Authorization', `Bearer ${token}`)
    .send({ phone: '987654321', countryCode: '+51', code: DEV_OTP });
  return token;
}

beforeAll(async () => {
  exec(
    `docker compose exec -T postgres psql -U fulbo -d fulbo_dev -c "DROP DATABASE IF EXISTS fulbo_e2e;" -c "CREATE DATABASE fulbo_e2e;"`,
  );
  exec('npx prisma migrate deploy', {
    ...process.env,
    DATABASE_URL: E2E_DATABASE_URL,
  });

  app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);
  await app.init();
}, 180_000);

afterAll(async () => {
  await app?.close();
  exec(
    `docker compose exec -T postgres psql -U fulbo -d fulbo_dev -c "DROP DATABASE IF EXISTS fulbo_e2e;"`,
  );
});

describe('Fulbo e2e (disposable fulbo_e2e database)', () => {
  const server = () => app.getHttpServer();

  let playerToken: string;
  let verifiedPlayerToken: string;
  let managerToken: string;
  let fieldId: string;
  let productId: string;
  let bookingId: string;
  const bookingWindow = {
    startTime: '2026-10-17T20:00:00',
    endTime: '2026-10-17T22:00:00',
  };

  it('registers a player and returns a token (snake_case user)', async () => {
    const res = await request(server())
      .post('/api/auth/register')
      .send({
        email: 'player.e2e@fulbo.test',
        password: 'Passw0rd!123',
        firstName: 'Pedro',
        lastName: 'Quispe',
      });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({
      email: 'player.e2e@fulbo.test',
      role: 'player',
    });
    playerToken = res.body.token;
  });

  it('logs in and returns the profile', async () => {
    const login = await request(server())
      .post('/api/auth/login')
      .send({ email: 'player.e2e@fulbo.test', password: 'Passw0rd!123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const profile = await request(server())
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(profile.status).toBe(200);
    expect(profile.body).toMatchObject({
      first_name: 'Pedro',
      email: 'player.e2e@fulbo.test',
      role: 'player',
    });
  });

  it('rejects wrong credentials', async () => {
    const res = await request(server())
      .post('/api/auth/login')
      .send({ email: 'player.e2e@fulbo.test', password: 'wrongPassword' });
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated profile access', async () => {
    const res = await request(server()).get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  it('rejects unknown DTO fields (forbidNonWhitelisted)', async () => {
    const res = await request(server())
      .post('/api/auth/register')
      .send({
        email: 'hacker@fulbo.test',
        password: 'Passw0rd!123',
        firstName: 'H',
        lastName: 'K',
        role: 'manager',
      });
    expect(res.status).toBe(400);
  });

  it('lists public fields as empty before any manager registers one', async () => {
    const res = await request(server()).get('/api/fields');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('forbids players from manager field routes', async () => {
    const res = await request(server())
      .post('/api/manager/fields')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({
        name: 'Hackers Field',
        address: 'Somewhere',
        basePricePerHour: 50,
      });
    expect(res.status).toBe(403);
  });

  it('promotes a verified user to manager and lets them create a field', async () => {
    const token = await registerVerifiedUser('manager.e2e@fulbo.test');

    const promote = await request(server())
      .post('/api/users/promote-to-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({ businessName: 'E2E Canchas', ruc: '20999888777' });
    expect(promote.status).toBe(200);
    expect(promote.body.user.role).toBe('manager');

    // The old token still carries role=player; re-login for the manager role.
    const relogin = await request(server())
      .post('/api/auth/login')
      .send({ email: 'manager.e2e@fulbo.test', password: 'Passw0rd!123' });
    managerToken = relogin.body.token;

    const create = await request(server())
      .post('/api/manager/fields')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'E2E Arena',
        address: 'Av. Testing 123',
        type: '7v7',
        basePricePerHour: 100,
      });
    expect(create.status).toBe(201);
    expect(create.body.field).toMatchObject({
      name: 'E2E Arena',
      basePricePerHour: 100,
      status: 'active',
    });
    fieldId = create.body.field.id;

    const list = await request(server()).get('/api/fields');
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toMatchObject({ name: 'E2E Arena' });
  });

  it('creates a FulVaso product for the field', async () => {
    const res = await request(server())
      .post(`/api/manager/fields/${fieldId}/products`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ name: 'Agua E2E', price: 4, category: 'bebida' });
    expect(res.status).toBe(201);
    productId = res.body.product.id;
  });

  it('forbids booking without a verified phone', async () => {
    const res = await request(server())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ fieldId, ...bookingWindow });
    expect(res.status).toBe(403);
  });

  it('books a Saturday night slot with an exact server-side price', async () => {
    verifiedPlayerToken = await registerVerifiedUser('verified.e2e@fulbo.test');

    const res = await request(server())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${verifiedPlayerToken}`)
      .send({
        fieldId,
        ...bookingWindow,
        products: [{ productId, quantity: 2 }],
        paymentMethod: 'yape',
        matchName: 'E2E pichanga',
        totalPrice: 999,
      });
    expect(res.status).toBe(201);
    // 100 base x 2h + product 4x2 + service fee 2 = 210 (surcharges default to 0)
    expect(res.body.total_price).toBe(210);
    expect(res.body.status).toBe('pending');
    expect(res.body.fields.name).toBe('E2E Arena');
    bookingId = res.body.booking_id;
  });

  it('returns a player-safe 409 for overlapping bookings', async () => {
    const res = await request(server())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${verifiedPlayerToken}`)
      .send({
        fieldId,
        startTime: '2026-10-17T21:00:00',
        endTime: '2026-10-17T23:00:00',
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('not available');
    expect(res.body.conflicts).toEqual([
      {
        type: 'booking',
        startTime: '2026-10-18T01:00:00.000Z',
        endTime: '2026-10-18T03:00:00.000Z',
      },
    ]);
  });

  it('rejects schedule blocks that overlap existing bookings', async () => {
    const res = await request(server())
      .post('/api/manager/schedule/block')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        fieldId,
        startTime: '2026-10-17T20:30:00',
        endTime: '2026-10-17T21:30:00',
        reason: 'maintenance',
      });
    expect(res.status).toBe(409);
    expect(res.body.conflicts[0]).toMatchObject({
      bookingId,
      customerName: 'Elena Vega',
    });
  });

  it('hides one player booking from another player', async () => {
    const res = await request(server())
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${playerToken}`);
    expect(res.status).toBe(403);
  });

  it('shows the manager the booking with customer contact info', async () => {
    const res = await request(server())
      .get(`/api/bookings/field/${fieldId}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    const booking = res.body.find(
      (b: { booking_id: string }) => b.booking_id === bookingId,
    );
    expect(booking.users.phone_number).toContain('987654321');
  });

  it('cancels the booking once and rejects a second cancel', async () => {
    const cancel = await request(server())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${verifiedPlayerToken}`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.booking.status).toBe('cancelled');

    const again = await request(server())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${verifiedPlayerToken}`);
    expect(again.status).toBe(409);
  });

  it('blocks reviews without a completed booking', async () => {
    const res = await request(server())
      .post(`/api/reviews/${fieldId}`)
      .set('Authorization', `Bearer ${verifiedPlayerToken}`)
      .send({ rating: 5, comment: 'nice' });
    expect(res.status).toBe(403);
  });

  it('serves public reviews for the field', async () => {
    const res = await request(server()).get(`/api/reviews/${fieldId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ reviews: [], totalCount: 0 });
  });

  it('keeps manager stats private to managers', async () => {
    const res = await request(server())
      .get('/api/manager/stats')
      .set('Authorization', `Bearer ${verifiedPlayerToken}`);
    expect(res.status).toBe(403);
  });

  it('reports manager stats excluding cancelled revenue', async () => {
    const res = await request(server())
      .get('/api/manager/stats?period=all')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalBookings: 1,
      cancelledBookings: 1,
      totalRevenue: 0,
      uniqueCustomers: 1,
    });
  });
});
