import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import App from './app';

// jsdom doesn't implement layout or scrolling.
Element.prototype.scrollIntoView = vi.fn();

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('shows the Cross-Border Desk title and offline demo prompt', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(screen.getByText('Cross-Border Desk')).toBeTruthy();
    expect(screen.getByText(/Offline and ready\. Drop an invoice/)).toBeTruthy();
  });
});
