import { describe, it, expect } from 'vitest';
import { passwordsMatch } from '../src/utils/validation';

describe('passwordsMatch', () => {
  it('devuelve true cuando las contraseñas son iguales', () => {
    expect(passwordsMatch('abc123', 'abc123')).toBe(true);
  });

  it('devuelve false cuando las contraseñas son distintas', () => {
    expect(passwordsMatch('abc123', 'xyz789')).toBe(false);
  });

  it('devuelve false cuando una está vacía', () => {
    expect(passwordsMatch('abc123', '')).toBe(false);
  });
});