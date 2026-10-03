import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkbenchExplainer } from './WorkbenchExplainer';
import { LanguageModelUnavailable } from './LanguageModelUnavailable';

describe('Recipe Workbench explanation', () => {
  it('distinguishes manual browsing, WebMCP registration, and in-page chat', () => {
    render(<WorkbenchExplainer />);
    expect(screen.getByText(/sample recipes work without ai/i)).toBeTruthy();
    expect(screen.getByText(/compatible external agents/i)).toBeTruthy();
    expect(screen.getByText(/same handlers directly/i)).toBeTruthy();
  });

  it('does not claim tools were registered when WebMCP is missing', () => {
    render(<LanguageModelUnavailable registrationStatus="unavailable" />);
    expect(screen.queryByText(/tools are still registered/i)).toBeNull();
    expect(screen.getByText(/tools are not registered/i)).toBeTruthy();
  });
});
