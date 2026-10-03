import React from 'react';

/** The three paths are deliberately separate: sample browsing is not a WebMCP call. */
export const WorkbenchExplainer: React.FC = () => (
  <section aria-label="How the Recipe Workbench works" className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <h2 className="font-semibold text-gray-900 dark:text-white">1 · Browse manually</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Sample recipes work without AI or WebMCP. Clicking a recipe is ordinary page interaction, not a tool call.</p>
    </div>
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <h2 className="font-semibold text-gray-900 dark:text-white">2 · Expose page tools</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">With WebMCP enabled, this page registers recipe actions for compatible external agents. The tools status above shows whether registration worked; registering does not run them.</p>
    </div>
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <h2 className="font-semibold text-gray-900 dark:text-white">3 · Try the in-page assistant</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">With the Prompt API ready, the assistant uses the same handlers directly and shows tool calls below. This chat is separate from WebMCP registration.</p>
    </div>
  </section>
);
