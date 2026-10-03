import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ToolCallingPage from './ToolCallingPage';

vi.mock('../hooks/useSEOData', () => ({ useSEOData: vi.fn(), seoConfigs: { toolCalling: {} } }));
vi.mock('../tools/DocsRenderer', () => ({ DocsRenderer: () => <div>Docs</div> }));
vi.mock('./ThemeToggle', () => ({ default: () => null }));
vi.mock('./ChatBox', () => ({ default: ({ messages }: { messages: { id: number; text: string }[] }) => <div>{messages.map(message => <p key={message.id}>{message.text}</p>)}</div> }));
vi.mock('./ChatInput', () => ({ default: ({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) => <button disabled={disabled} onClick={() => onSend('Use a tool')}>Send request</button> }));

const renderPage = () => render(<MemoryRouter initialEntries={['/tool-calling/tool-calling-demo']}><ToolCallingPage /></MemoryRouter>);
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('manual tool dispatch', () => {
  it.each([
    undefined, null, [], 'invalid', {}, { min: 1 }, { min: '1', max: 5 }, { min: 1, max: null },
  ])('rejects invalid randomNumber arguments %j before executing the tool', async (args) => {
    const prompt = vi.fn()
      .mockResolvedValueOnce(JSON.stringify({ toolName: 'randomNumber', args }))
      .mockResolvedValueOnce(JSON.stringify({ toolName: 'done', reply: 'Finished' }));
    vi.stubGlobal('LanguageModel', { create: vi.fn().mockResolvedValue({ prompt, destroy: vi.fn() }) });
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send request' })).toHaveProperty('disabled', false));
    // Install after rendering so library internals cannot contribute random calls.
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText('Finished')).toBeTruthy();
    expect(random).not.toHaveBeenCalled();
    expect(prompt.mock.calls[1][0]).toMatch(/invalid arguments/i);
    expect(prompt.mock.calls[1][0]).toContain('"required":["min","max"]');
  });

  it('executes valid numeric arguments and returns the result to the model', async () => {
    const prompt = vi.fn()
      .mockResolvedValueOnce(JSON.stringify({ toolName: 'randomNumber', args: { min: 1, max: 5 } }))
      .mockResolvedValueOnce(JSON.stringify({ toolName: 'done', reply: 'Finished' }));
    vi.stubGlobal('LanguageModel', { create: vi.fn().mockResolvedValue({ prompt, destroy: vi.fn() }) });
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send request' })).toHaveProperty('disabled', false));
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    fireEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText('Finished')).toBeTruthy();
    expect(random).toHaveBeenCalledTimes(1);
    expect(prompt.mock.calls[1][0]).toContain('"result":3');
  });

  it('exposes enabled tool input schemas and required argument names to the model', async () => {
    const create = vi.fn().mockResolvedValue({ destroy: vi.fn() });
    vi.stubGlobal('LanguageModel', { create });
    renderPage();
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const prompt = create.mock.calls[0][0].initialPrompts[0].content;
    for (const required of [['location'], ['expression'], ['min', 'max']]) {
      expect(prompt).toContain(JSON.stringify({ required }).slice(1, -1));
    }
    expect(prompt).toContain('"location":{"type":"string"');
    expect(prompt).toContain('"min":{"type":"number"');
    expect(prompt).toContain('"timezone":{"type":"string"');
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    expect(create.mock.calls[1][0].initialPrompts[0].content).not.toContain('getWeather');
  });
});
