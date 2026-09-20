import { describe, it, expect } from 'vitest';
import { formatPrice, formatWeight, formatGoldPrice } from '../utils';

describe('Public Utils', () => {
  describe('formatPrice', () => {
    it('formats price in INR format', () => {
      const formatted = formatPrice(54999);
      expect(formatted).toMatch(/₹\s?54,999/);
    });
  });

  describe('formatWeight', () => {
    it('formats grams with 1 decimal place', () => {
      expect(formatWeight(5.24)).toBe('5.2g');
      expect(formatWeight(10)).toBe('10.0g');
    });
  });

  describe('formatGoldPrice', () => {
    it('formats rate per gram with 2 decimals and currency prefix', () => {
      expect(formatGoldPrice(7250.5)).toMatch(/₹\s?7,250\.50\/gram/);
    });
  });
});
