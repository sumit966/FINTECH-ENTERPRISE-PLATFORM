import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication utilities', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-do-not-use-in-production';

  test('bcrypt hashes and verifies a password', async () => {
    const password = 'Nexus@2024!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    const ok = await bcrypt.compare(password, hash);
    expect(ok).toBe(true);
    const bad = await bcrypt.compare('WrongPassword', hash);
    expect(bad).toBe(false);
  });

  test('JWT signs and verifies a payload', () => {
    const payload = { sub: 'user-123', email: 'test@example.in', roles: ['ENGINEER'] };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    expect(typeof token).toBe('string');
    const decoded: any = jwt.verify(token, JWT_SECRET);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@example.in');
    expect(decoded.roles).toContain('ENGINEER');
  });

  test('JWT rejects a token signed with a different secret', () => {
    const token = jwt.sign({ sub: 'x' }, 'other-secret', { expiresIn: '1h' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });
});