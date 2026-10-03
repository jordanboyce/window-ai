import React from 'react';

interface TypingIndicatorProps {
  label?: string;
}

/**
 * Three-dot "the model is generating" bubble for chat UIs. Rendered inside an
 * assistant bubble while the first token is still pending. Purely visual,
 * screen-reader-hidden; pair with role="status" + aria-label on a wrapper when
 * the status must be announced.
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ label = 'Thinking' }) => (
  <span
    className="inline-flex items-center gap-1.5 py-1"
    role="status"
    aria-label={label}
  >
    <span aria-hidden="true" className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
  </span>
);

export default TypingIndicator;
