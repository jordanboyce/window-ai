import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

vi.mock('../hooks/useSEOData', () => ({
  useSEOData: vi.fn(),
  seoConfigs: { home: {} },
}));

describe('HomePage introduction', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  it('explains the live browser API call and avoids social branding', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/this page calls your browser/i)).toBeTruthy();
    expect(screen.getByText(/why it matters/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /try translation/i }).getAttribute('href')).toBe('/translate/translate-demo');
    expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).toBeNull();
  });
});
