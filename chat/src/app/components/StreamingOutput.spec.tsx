import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TranslatePage from './TranslatePage';
import Summary from './Summary';
import WriteRewritePage from './WriteRewritePage';

vi.mock('../hooks/useSEOData', () => ({ useSEOData: vi.fn(), seoConfigs: { translate: {}, summary: {}, writer: {} } }));
vi.mock('../tools/DocsRenderer', () => ({ DocsRenderer: () => <div>Docs</div> }));
vi.mock('../hooks/useGoogleAnalytics', () => ({ useGoogleAnalytics: () => ({ trackAIToolUsage: vi.fn(), trackUserInteraction: vi.fn(), trackError: vi.fn() }) }));

afterEach(() => { vi.unstubAllGlobals(); });

function controlledStream() {
  let controller!: ReadableStreamDefaultController<string>;
  const stream = new ReadableStream<string>({ start(value) { controller = value; } });
  return { stream, get controller() { return controller; } };
}

async function expectPartialBeforeCompletion(control: ReturnType<typeof controlledStream>, loadingButton: string, idleButton: string) {
  expect(screen.getByText(/on-device/i).closest('[role="status"]')).toBeTruthy();
  await act(async () => { control.controller.enqueue('First streamed chunk'); });
  try {
    expect(screen.getByText('First streamed chunk')).toBeTruthy();
    expect(screen.getByRole('button', { name: loadingButton })).toHaveProperty('disabled', true);
    await act(async () => { control.controller.enqueue(' plus second chunk'); });
    expect(screen.getByText('First streamed chunk plus second chunk')).toBeTruthy();
  } finally {
    await act(async () => { control.controller.close(); });
  }
  await waitFor(() => expect(screen.getByRole('button', { name: idleButton })).toHaveProperty('disabled', false));
}

describe('incremental stream output', () => {
  it('shows rewriter chunks before the stream completes', async () => {
    const control = controlledStream();
    vi.stubGlobal('Writer', { create: vi.fn().mockResolvedValue({ write: vi.fn().mockResolvedValue('Original content'), destroy: vi.fn() }) });
    vi.stubGlobal('Rewriter', { create: vi.fn().mockResolvedValue({ rewriteStreaming: () => control.stream }) });
    render(<MemoryRouter initialEntries={['/writer/writer-demo']}><WriteRewritePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Writing Task'), { target: { value: 'Write a greeting' } });
    fireEvent.click(screen.getByRole('button', { name: 'Write Content' }));
    expect(await screen.findByText('Original content')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Rewriter' }));
    fireEvent.click(screen.getByLabelText('Stream Response'));
    fireEvent.click(screen.getByRole('button', { name: 'Rewrite Content' }));
    await expectPartialBeforeCompletion(control, 'Rewriting...', 'Rewrite Content');
  });

  it('shows writer chunks before the stream completes', async () => {
    const control = controlledStream();
    vi.stubGlobal('Writer', { create: vi.fn().mockResolvedValue({ writeStreaming: () => control.stream }) });
    render(<MemoryRouter initialEntries={['/writer/writer-demo']}><WriteRewritePage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Writing Task'), { target: { value: 'Write a greeting' } });
    fireEvent.click(screen.getByLabelText('Stream Response'));
    fireEvent.click(screen.getByRole('button', { name: 'Write Content' }));
    await expectPartialBeforeCompletion(control, 'Writing...', 'Write Content');
  });

  it('shows summary chunks before the stream completes', async () => {
    const control = controlledStream();
    vi.stubGlobal('Summarizer', { create: vi.fn().mockResolvedValue({ summarizeStreaming: () => control.stream }) });
    render(<MemoryRouter initialEntries={['/summary/summary-demo']}><Summary /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Text to Summarize'), { target: { value: 'Article to summarize' } });
    fireEvent.click(screen.getByLabelText('Stream Response'));
    fireEvent.click(screen.getByRole('button', { name: 'Summarize' }));
    await expectPartialBeforeCompletion(control, 'Summarizing...', 'Summarize');
  });

  it('shows translation chunks before the stream completes', async () => {
    const control = controlledStream();
    vi.stubGlobal('Translator', { availability: vi.fn().mockResolvedValue('available'), create: vi.fn().mockResolvedValue({ translateStreaming: () => control.stream }) });
    render(<MemoryRouter initialEntries={['/translate/translate-demo']}><TranslatePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Translate' })).toHaveProperty('disabled', false));
    fireEvent.click(screen.getByLabelText('Stream Response'));
    fireEvent.click(screen.getByRole('button', { name: 'Translate' }));
    await expectPartialBeforeCompletion(control, 'Translating...', 'Translate');
  });
});
