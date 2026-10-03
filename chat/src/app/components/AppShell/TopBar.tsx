import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { useShell } from './ShellContext';
import { titleForPath } from './navItems';

/** Sticky demo controls: sidebar, page title, theme, presentation. */
export const TopBar: React.FC = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { present, setPresent, setRailOpen } = useShell();
  const { trackUserInteraction } = useGoogleAnalytics();

  const title = titleForPath(pathname);

  return (
    <div
      className="sticky top-0 z-20 flex h-[60px] items-center gap-3.5 px-[22px] backdrop-blur-[12px]"
      style={{
        background: 'var(--topbar)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={() => setRailOpen((o) => !o)}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] transition-colors"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--surface2)',
          color: 'var(--fg2)',
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      </button>

      <span
        className="font-display text-[15px] font-semibold"
        style={{ color: 'var(--fg)' }}
      >
        {title}
      </span>

      <div className="ml-auto flex items-center gap-3">
        {/* Theme toggle — wired to the shared ThemeProvider */}
        <button
          type="button"
          onClick={() => {
            toggleTheme();
            trackUserInteraction('theme_toggle', 'topbar_theme');
          }}
          title="Toggle theme"
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            color: 'var(--fg2)',
          }}
        >
          {theme === 'dark' ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Present toggle */}
        <button
          type="button"
          onClick={() => {
            setPresent((p) => !p);
            trackUserInteraction('present_toggle', 'topbar_present');
          }}
          className="font-mono-code flex items-center gap-[7px] whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors"
          style={{
            border: '1px solid rgba(59,130,246,.4)',
            background: 'rgba(59,130,246,.12)',
            color: '#93c5fd',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span className="hidden sm:inline">
            {present ? 'Exit' : 'Present'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
