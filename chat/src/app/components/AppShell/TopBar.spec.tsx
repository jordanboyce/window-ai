import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

vi.mock('../../hooks/useGoogleAnalytics', () => ({ useGoogleAnalytics: () => ({ trackUserInteraction: vi.fn() }) }));
vi.mock('../../context/ThemeContext', () => ({ useTheme: () => ({ toggleTheme: vi.fn(), theme: 'dark' }) }));
vi.mock('./ShellContext', () => ({ useShell: () => ({ present: false, setPresent: vi.fn(), setRailOpen: vi.fn() }) }));

describe('TopBar', () => {
  it('keeps demo controls without external social branding', () => {
    render(<MemoryRouter><TopBar /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /present/i })).toBeTruthy();
    for (const name of ['GitHub', 'X (Twitter)', 'LinkedIn', 'YouTube']) {
      expect(screen.queryByRole('link', { name })).toBeNull();
    }
  });
});
