import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatBox from './ChatBox';
import { Spinner } from './Spinner';
import { TypingIndicator } from './TypingIndicator';

describe('loading indicators', () => {
  beforeEach(() => {
    // jsdom does not implement scrollIntoView; ChatBox calls it on mount.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('Spinner announces status and renders a label', () => {
    render(<Spinner label="Translating on-device…" />);
    expect(screen.getByRole('status').textContent).toContain('Translating on-device…');
  });

  it('TypingIndicator exposes a labelled status region', () => {
    render(<TypingIndicator label="Generating" />);
    expect(screen.getByRole('status', { name: 'Generating' })).toBeTruthy();
  });

  it('ChatBox shows a typing indicator while waiting on the first token', () => {
    render(<ChatBox messages={[]} isLoading />);
    expect(screen.getByText(/waiting for the model/i)).toBeTruthy();
  });

  it('ChatBox shows a trailing typing bubble when the last message is from the user', () => {
    render(<ChatBox messages={[{ id: 1, text: 'hi', sender: 'User' }]} isLoading />);
    expect(screen.getByText('Generating')).toBeTruthy();
  });

  it('ChatBox does not double-render a typing bubble once the bot has started', () => {
    render(<ChatBox messages={[{ id: 1, text: 'partial answer', sender: 'Bot' }]} isLoading />);
    // The bot bubble is the only content; no trailing "Generating" indicator.
    expect(screen.queryByText('Generating')).toBeNull();
    expect(screen.getByText('partial answer')).toBeTruthy();
  });
});
