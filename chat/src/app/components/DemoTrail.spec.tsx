import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DemoTrail } from './DemoTrail';

describe('DemoTrail', () => {
  it('offers a guided path from browser check to an offline-ready demo', () => {
    render(<MemoryRouter><DemoTrail /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /three-minute demo path/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /1.*check your browser/i }).getAttribute('href')).toBe('/status');
    expect(screen.getByRole('link', { name: /2.*translate/i }).getAttribute('href')).toBe('/translate/translate-demo');
    expect(screen.getByRole('link', { name: /3.*recipe workbench/i }).getAttribute('href')).toBe('/webmcp/webmcp-demo');
    expect(screen.getByText(/works without the model/i)).toBeTruthy();
    expect(screen.getByText(/browser provides the translation model/i)).toBeTruthy();
    expect(screen.getByText(/page exposes actions as tools/i)).toBeTruthy();
    expect(screen.getByText(/recipe browsing alone does not demonstrate WebMCP/i)).toBeTruthy();
  });
});
