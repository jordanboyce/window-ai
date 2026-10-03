import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const obsoleteFlags = /#(?:optimization-guide-on-device-model|prompt-api-for-gemini-nano(?:-multimodal-input)?|writer-api-for-gemini-nano|rewriter-api-for-gemini-nano|summarization-api-for-gemini-nano|language-detection-api|translation-api|WebMCP)\b/g;

function filesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(path);
    return /\.(tsx?|md)$/.test(entry.name) && !entry.name.endsWith('.spec.ts') ? [path] : [];
  });
}

describe('Chrome Canary 157 flag instructions', () => {
  // IDs present in Chromium 157.0.8081.0 chrome/browser/about_flags.cc.
  // `prompt-api-tool-use` was dropped from the catalog because the demos now use
  // the stable `responseConstraint` manual-dispatch loop (native tool
  // auto-execution was removed from the Prompt API in 157).
  const currentIds = [
    'enable-webmcp-testing', 'prompt-api', 'prompt-api-multimodal-input',
    'proofreader-api', 'rewriter-api',
    'semantic-embedder-api', 'summarizer-api', 'writer-api',
  ];

  it('never points app UI, messages or docs to retired flag IDs', () => {
    const stale = filesIn(appDir).flatMap((file) => {
      const hits = [...readFileSync(file, 'utf8').matchAll(obsoleteFlags)];
      return hits.map((match) => `${file.slice(appDir.length)}: ${match[0]}`);
    });
    expect(stale).toEqual([]);
  });

  it('only recommends IDs present in the targeted Canary release', () => {
    const ids = filesIn(appDir).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/chrome:\/\/flags\/#([a-z0-9-]+)/g)].map((m) => m[1])
    );
    expect([...new Set(ids)].sort()).toEqual(currentIds);
  });

  it('lists the current Prompt, Writer, Rewriter, Proofreader, Embedder and WebMCP flags', () => {
    const catalog = readFileSync(join(appDir, 'components', 'ApiStatus.tsx'), 'utf8');
    for (const id of ['prompt-api', 'writer-api', 'rewriter-api', 'proofreader-api', 'semantic-embedder-api', 'enable-webmcp-testing']) {
      expect(catalog).toContain(`chrome://flags/#${id}`);
    }
    expect(catalog).not.toContain('chrome://flags/#optimization-guide-on-device-model');
  });
});
