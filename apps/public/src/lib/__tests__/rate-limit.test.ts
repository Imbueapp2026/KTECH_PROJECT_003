import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit } from '../rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within limit', () => {
    const id = 'user-test-allow-' + Math.random();
    const res1 = checkRateLimit(id, 2, 5000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit(id, 2, 5000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it('blocks requests exceeding limit', () => {
    const id = 'user-test-block-' + Math.random();
    checkRateLimit(id, 1, 5000); // 1st allowed

    const blocked = checkRateLimit(id, 1, 5000); // 2nd blocked
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets limit after window expiry', () => {
    vi.useFakeTimers();
    const id = 'user-test-expire-' + Math.random();

    checkRateLimit(id, 1, 1000);
    const blocked = checkRateLimit(id, 1, 1000);
    expect(blocked.allowed).toBe(false);

    // Advance past windowMs
    vi.advanceTimersByTime(1100);

    const afterExpiry = checkRateLimit(id, 1, 1000);
    expect(afterExpiry.allowed).toBe(true);
    expect(afterExpiry.remaining).toBe(0);

    vi.useRealTimers();
  });
});
