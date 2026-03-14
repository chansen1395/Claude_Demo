import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme';
import { Header } from '../../components/Header';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('Header', () => {
  it('renders the title', () => {
    renderWithTheme(<Header />);
    expect(screen.getByText('GENESIS')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderWithTheme(<Header />);
    expect(screen.getByText('Neuroevolution Ecosystem Simulator')).toBeInTheDocument();
  });
});
