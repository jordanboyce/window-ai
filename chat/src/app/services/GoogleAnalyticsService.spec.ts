import { afterEach, expect, it, vi } from 'vitest';
import GoogleAnalyticsService from './GoogleAnalyticsService';

afterEach(() => vi.useRealTimers());

it('does not poll for third-party analytics when the demo has no tracking ID', () => {
  vi.useFakeTimers();
  new GoogleAnalyticsService();
  expect(vi.getTimerCount()).toBe(0);
});
