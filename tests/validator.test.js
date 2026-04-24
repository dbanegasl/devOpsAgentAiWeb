import { validateUser } from '../src/validator.js';

const validUser = {
  id: 1,
  name: 'Leanne Graham',
  email: 'leanne@example.com',
  address: {
    city: 'Gwenborough',
    geo: { lat: '-37.3159', lng: '81.1496' },
  },
};

describe('validateUser', () => {
  test('1. valid user returns { valid: true }', () => {
    const result = validateUser(validUser);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('2. invalid email format produces specific error', () => {
    const result = validateUser({ ...validUser, email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/email format is invalid/i)])
    );
  });

  test('3a. empty name produces specific error', () => {
    const result = validateUser({ ...validUser, name: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/name is required/i)])
    );
  });

  test('3b. missing name produces specific error', () => {
    const { name, ...rest } = validUser;
    const result = validateUser(rest);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/name is required/i)])
    );
  });

  test('4a. empty address.city produces specific error', () => {
    const result = validateUser({
      ...validUser,
      address: { ...validUser.address, city: '' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/address\.city is required/i)])
    );
  });

  test('4b. missing address.city produces specific error', () => {
    const result = validateUser({
      ...validUser,
      address: { geo: validUser.address.geo },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/address\.city is required/i)])
    );
  });

  test('5a. missing address.geo produces specific error', () => {
    const result = validateUser({
      ...validUser,
      address: { city: 'X' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/address\.geo is required/i)])
    );
  });

  test('5b. incomplete address.geo (missing lng) produces specific error', () => {
    const result = validateUser({
      ...validUser,
      address: { city: 'X', geo: { lat: '1' } },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/address\.geo\.lng is required/i)])
    );
  });

  test('6a. null user returns controlled error', () => {
    const result = validateUser(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/null or undefined/i);
  });

  test('6b. undefined user returns controlled error', () => {
    const result = validateUser(undefined);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/null or undefined/i);
  });
});
