import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

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

describe('api client', () => {
  it('sends JSON with the auth header when a token is stored', async () => {
    localStorage.setItem('token', 'tok123');
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    const data = await api.get('/ping');

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/ping');
    expect(init.headers['Authorization']).toBe('Bearer tok123');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.method).toBe('GET');
  });

  it('omits Authorization for public requests', async () => {
    localStorage.setItem('token', 'tok123');
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await api.get('/fields', { requiresAuth: false });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['Authorization']).toBeUndefined();
  });

  it('serializes the body as JSON on post', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: '1' }));

    await api.post('/bookings', { fieldId: 'f' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/bookings');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"fieldId":"f"}');
  });

  it('throws with the server message and status on error', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, { message: 'The requested time is not available', conflicts: [] }),
    );

    const error = await api.post('/bookings', {}).catch((e) => e);

    expect(error.status).toBe(409);
    expect(error.message).toContain('not available');
    expect(error.name).toBe('ApiError');
  });

  it('falls back to a status message when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
    );

    const error = await api.get('/x').catch((e) => e);

    expect(error.status).toBe(500);
    expect(error.message).toBe('Error 500: Internal Server Error');
  });
});
