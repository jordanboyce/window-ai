import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import TranslatePage from './TranslatePage';
import type { AvailabilityStatus } from '../services/TranslateService';

vi.mock('../hooks/useSEOData', () => ({ useSEOData: vi.fn(), seoConfigs: { translate: {} } }));
vi.mock('../tools/DocsRenderer', () => ({ DocsRenderer: () => <div>Docs</div> }));

describe('translation first run', () => {
  it.each([
    ['available', 'unavailable'],
    ['unavailable', 'available'],
    ['rejected', 'available'],
  ] as const)('ignores a late manual pair A response (%s) after pair B reports %s', async (oldStatus, newStatus) => {
    let resolveOld!: (status: AvailabilityStatus) => void;
    let rejectOld!: (error: Error) => void;
    const oldRequest = new Promise<AvailabilityStatus>((resolve, reject) => { resolveOld = resolve; rejectOld = reject; });
    let resolveNew!: (status: AvailabilityStatus) => void;
    const newRequest = new Promise<AvailabilityStatus>(resolve => { resolveNew = resolve; });
    const availability = vi.fn()
      .mockResolvedValueOnce('available')
      .mockReturnValueOnce(oldRequest)
      .mockReturnValueOnce(newRequest);
    vi.stubGlobal('Translator', { availability });
    try {
      render(<MemoryRouter initialEntries={['/translate/translate-demo']}><TranslatePage /></MemoryRouter>);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Translate' })).toHaveProperty('disabled', false));
      fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));
      fireEvent.change(screen.getByLabelText('Target Language'), { target: { value: 'fr' } });
      expect(availability).toHaveBeenNthCalledWith(2, { sourceLanguage: 'en', targetLanguage: 'es' });
      expect(availability).toHaveBeenNthCalledWith(3, { sourceLanguage: 'en', targetLanguage: 'fr' });
      await act(async () => { resolveNew(newStatus); });
      const expectedStatus = newStatus === 'available' ? /ready for this language pair/i : /unavailable for this language pair/i;
      expect(screen.getByRole('status').textContent).toMatch(expectedStatus);
      await act(async () => {
        if (oldStatus === 'rejected') rejectOld(new Error('Old pair failed'));
        else resolveOld(oldStatus);
      });
      expect(screen.getByRole('status').textContent).toMatch(expectedStatus);
      expect(screen.getByRole('button', { name: 'Translate' })).toHaveProperty('disabled', newStatus === 'unavailable');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('ignores an older automatic check after a newer manual check for the same pair', async () => {
    let resolveAutomatic!: (status: AvailabilityStatus) => void;
    const automaticRequest = new Promise<AvailabilityStatus>(resolve => { resolveAutomatic = resolve; });
    const availability = vi.fn().mockReturnValueOnce(automaticRequest).mockResolvedValueOnce('available');
    vi.stubGlobal('Translator', { availability });
    try {
      render(<MemoryRouter initialEntries={['/translate/translate-demo']}><TranslatePage /></MemoryRouter>);
      fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Translate' })).toHaveProperty('disabled', false));
      await act(async () => { resolveAutomatic('unavailable'); });
      expect(screen.getByRole('status').textContent).toMatch(/ready for this language pair/i);
      expect(screen.getByRole('button', { name: 'Translate' })).toHaveProperty('disabled', false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('starts with a runnable sample and explains unavailable browser APIs without fake output', async () => {
    render(<MemoryRouter initialEntries={['/translate/translate-demo']}><TranslatePage /></MemoryRouter>);
    expect((screen.getByLabelText(/source language/i) as HTMLSelectElement).value).toBe('en');
    expect((screen.getByLabelText(/target language/i) as HTMLSelectElement).value).toBe('es');
    expect((screen.getByLabelText(/text to translate/i) as HTMLTextAreaElement).value).toMatch(/hello/i);
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/translator api.*unavailable/i));
    expect(screen.getByRole('button', { name: /^translate$/i })).toHaveProperty('disabled', true);
    expect(screen.queryByText(/^Error:/)).toBeNull();
  });

  it('clears a result when the input or language pair changes', async () => {
    const translator = { availability: vi.fn().mockResolvedValue('available'), create: vi.fn().mockResolvedValue({ translate: vi.fn().mockResolvedValue('Hola mundo'), destroy: vi.fn() }) };
    vi.stubGlobal('Translator', translator);
    try {
      render(<MemoryRouter initialEntries={['/translate/translate-demo']}><TranslatePage /></MemoryRouter>);
      await waitFor(() => expect(screen.getByRole('button', { name: /^translate$/i })).toHaveProperty('disabled', false));
      fireEvent.click(screen.getByRole('button', { name: /^translate$/i }));
      expect(await screen.findByText('Hola mundo')).toBeTruthy();
      fireEvent.change(screen.getByLabelText(/target language/i), { target: { value: 'fr' } });
      expect(screen.queryByText('Hola mundo')).toBeNull();
      await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/ready for this language pair/i));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
