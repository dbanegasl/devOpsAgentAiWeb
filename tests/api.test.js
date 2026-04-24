import { fetchUsers, fetchUserById } from '../src/api.js';

const validUser = {
  id: 1,
  name: 'Leanne',
  email: 'leanne@example.com',
  address: {
    city: 'Gwenborough',
    geo: { lat: '-37.3', lng: '81.1' },
  },
};

const invalidUser = {
  id: 2,
  name: '',
  email: 'nope',
  address: { city: '', geo: {} },
};

function mockFetchOnce({ ok = true, status = 200, statusText = 'OK', body = '' } = {}) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    statusText,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  });
}

function mockFetchReject(err) {
  global.fetch = jest.fn().mockRejectedValueOnce(err);
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('fetchUsers', () => {
  test('7. network failure throws descriptive network error', async () => {
    mockFetchReject(new TypeError('Failed to fetch'));
    await expect(fetchUsers()).rejects.toThrow(/network error/i);
  });

  test('8. HTTP 500 throws server error', async () => {
    mockFetchOnce({ ok: false, status: 500, statusText: 'Internal Server Error', body: '' });
    await expect(fetchUsers()).rejects.toThrow(/status 500/i);
  });

  test('9a. empty response body throws parsing error', async () => {
    mockFetchOnce({ ok: true, body: '' });
    await expect(fetchUsers()).rejects.toThrow(/empty response/i);
  });

  test('9b. malformed JSON throws parsing error', async () => {
    mockFetchOnce({ ok: true, body: '{not-json' });
    await expect(fetchUsers()).rejects.toThrow(/malformed json/i);
  });

  test('10a. mixed valid/invalid users: returns only the valid ones', async () => {
    mockFetchOnce({ ok: true, body: [validUser, invalidUser] });
    const result = await fetchUsers();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  test('10b. all invalid users: throws validation error', async () => {
    mockFetchOnce({ ok: true, body: [invalidUser] });
    await expect(fetchUsers()).rejects.toThrow(/validation/i);
  });

  test('response is not an array: throws', async () => {
    mockFetchOnce({ ok: true, body: { foo: 'bar' } });
    await expect(fetchUsers()).rejects.toThrow(/expected an array/i);
  });
});

describe('fetchUserById', () => {
  test('rejects when id is missing', async () => {
    await expect(fetchUserById('')).rejects.toThrow(/id is required/i);
  });

  test('returns the user when response is valid', async () => {
    mockFetchOnce({ ok: true, body: validUser });
    const u = await fetchUserById(1);
    expect(u.id).toBe(1);
  });

  test('throws on invalid user payload', async () => {
    mockFetchOnce({ ok: true, body: invalidUser });
    await expect(fetchUserById(2)).rejects.toThrow(/invalid user data/i);
  });

  test('throws on HTTP 404', async () => {
    mockFetchOnce({ ok: false, status: 404, statusText: 'Not Found', body: '' });
    await expect(fetchUserById(999)).rejects.toThrow(/status 404/i);
  });

  test('throws on network error', async () => {
    mockFetchReject(new TypeError('offline'));
    await expect(fetchUserById(1)).rejects.toThrow(/network error/i);
  });
});
