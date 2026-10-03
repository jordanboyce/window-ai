import React from 'react';

interface SpinnerProps {
  label?: string;
  size?: number;
}

/**
 * Small, accessible inline spinner. Use anywhere a demo is waiting on the
 * on-device model (first inference, download, session creation) so the user
 * sees progress instead of a static placeholder.
 */
export const Spinner: React.FC<SpinnerProps> = ({ label, size = 18 }) => (
  <span
    role="status"
    aria-live="polite"
    className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400"
  >
    <svg
      className="animate-spin motion-reduce:animate-none"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    {label && <span className="text-sm font-medium">{label}</span>}
  </span>
);

export default Spinner;
