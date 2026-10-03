import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { useShell } from './ShellContext';
import { titleForPath } from './navItems';

interface SocialLink {
  href: string;
  title: string;
  ga: string;
  size: number;
  viewBox: string;
  path: string;
}

const SOCIALS: SocialLink[] = [
  {
    href: 'https://github.com/jordanboyce/window-ai',
    title: 'GitHub',
    ga: 'github',
    size: 17,
    viewBox: '0 0 496 512',
    path: 'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6m-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3m44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8',
  },
];

/** Sticky, blurred top bar: sidebar toggle · title · socials · theme · present. */
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
        {/* Socials — hidden on the cramped mobile top bar */}
        <div className="hidden items-center gap-3 sm:flex">
          {SOCIALS.map((s) => (
            <a
              key={s.ga}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title}
            onClick={() =>
              trackUserInteraction('external_link_click', s.ga)
            }
            className="transition-colors hover:opacity-80"
            style={{ color: 'var(--fg3)' }}
          >
            <svg
              width={s.size}
              height={s.size}
              viewBox={s.viewBox}
              fill="currentColor"
            >
              <path d={s.path} />
            </svg>
            </a>
          ))}
        </div>

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
