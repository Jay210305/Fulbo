import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthApi } from './auth.api';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  fetchMock.mockReset();
  localStorage.clear();
});

describe('AuthApi', () => {
  it('POSTs login without auth and returns token + user', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        token: 't',
        user: { first_name: 'A', last_name: 'B', email: 'a@b.com', phone_number: null, phone_verified: false, role: 'player' },
      }),
    );

    const res = await AuthApi.login('a@b.com', 'secret123');

    expect(res.token).toBe('t');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/auth/login');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.com', password: 'secret123' });
  });

  it('POSTs register with the full payload', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { token: 't', user: {} }));

    await AuthApi.register({ email: 'x@y.com', password: 'pw12345', firstName: 'X', lastName: 'Y' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/auth/register');
    expect(JSON.parse(init.body)).toMatchObject({ email: 'x@y.com', firstName: 'X', lastName: 'Y' });
  });

  it('attaches the stored token and OTP payload for verify-otp', async () => {
    localStorage.setItem('token', 'tok');
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, verified: true, user: {} }));

    await AuthApi.verifyOtp('987654321', '+51', '123456');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toEqual({ phone: '987654321', countryCode: '+51', code: '123456' });
  });

  it('GETs the profile with the stored token', async () => {
    localStorage.setItem('token', 'tok');
    fetchMock.mockResolvedValue(jsonResponse(200, { email: 'a@b.com' }));

    await AuthApi.getProfile();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/users/profile');
    expect(init.method).toBe('GET');
    expect(init.headers['Authorization']).toBe('Bearer tok');
  });

  it('POSTs promote-to-manager with the business payload', async () => {
    localStorage.setItem('token', 'tok');
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, user: {} }));

    await AuthApi.promoteToManager('Canchas X', '20123456789');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/users/promote-to-manager');
    expect(JSON.parse(init.body)).toEqual({ businessName: 'Canchas X', ruc: '20123456789' });
  });
});
