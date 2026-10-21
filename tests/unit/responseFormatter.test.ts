import { sanitizeForJson, getDefaultSuccessMessage } from '../../src/utils/responseFormatter';

describe('Response Formatter Utilities', () => {
  describe('sanitizeForJson', () => {
    it('should convert BigInt to string', () => {
      const input = { id: 1, largeNumber: BigInt(9007199254740991) };
      const output = sanitizeForJson(input);
      expect(output.largeNumber).toBe('9007199254740991');
    });

    it('should convert Date to ISO string', () => {
      const date = new Date('2026-10-21T00:00:00.000Z');
      const input = { createdAt: date };
      const output = sanitizeForJson(input);
      expect(output.createdAt).toBe('2026-10-21T00:00:00.000Z');
    });

    it('should convert Buffer to base64 string', () => {
      const buf = Buffer.from('hello world');
      const input = { data: buf };
      const output = sanitizeForJson(input);
      expect(output.data).toBe(buf.toString('base64'));
    });

    it('should handle null and primitives correctly', () => {
      expect(sanitizeForJson(null)).toBeNull();
      expect(sanitizeForJson(undefined)).toBeUndefined();
      expect(sanitizeForJson('test')).toBe('test');
      expect(sanitizeForJson(123)).toBe(123);
      expect(sanitizeForJson(true)).toBe(true);
    });

    it('should sanitize nested objects and arrays', () => {
      const input = {
        users: [
          { id: 1, count: BigInt(100) },
          { id: 2, date: new Date('2026-01-01T00:00:00.000Z') },
        ],
      };
      const output = sanitizeForJson(input);
      expect(output.users[0].count).toBe('100');
      expect(output.users[1].date).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('getDefaultSuccessMessage', () => {
    it('should return appropriate verbs for standard HTTP methods', () => {
      expect(getDefaultSuccessMessage('GET')).toBe('Success');
      expect(getDefaultSuccessMessage('POST')).toBe('Created');
      expect(getDefaultSuccessMessage('PUT')).toBe('Updated');
      expect(getDefaultSuccessMessage('PATCH')).toBe('Updated');
      expect(getDefaultSuccessMessage('DELETE')).toBe('Deleted');
      expect(getDefaultSuccessMessage('OPTIONS')).toBe('Success');
    });
  });
});
