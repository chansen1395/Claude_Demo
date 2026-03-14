import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme';
import { Controls } from '../../components/Controls';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('Controls', () => {
  const defaultProps = {
    paused: false,
    speed: 1,
    mutRate: 0.08,
    trails: true,
    onTogglePause: vi.fn(),
    onSpeedChange: vi.fn(),
    onMutRateChange: vi.fn(),
    onToggleTrails: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pause button when playing', () => {
    renderWithTheme(<Controls {...defaultProps} />);
    expect(screen.getByText('⏸ PAUSE')).toBeInTheDocument();
  });

  it('renders play button when paused', () => {
    renderWithTheme(<Controls {...defaultProps} paused={true} />);
    expect(screen.getByText('▶ PLAY')).toBeInTheDocument();
  });

  it('calls onTogglePause when pause button clicked', () => {
    renderWithTheme(<Controls {...defaultProps} />);
    fireEvent.click(screen.getByText('⏸ PAUSE'));
    expect(defaultProps.onTogglePause).toHaveBeenCalledOnce();
  });

  it('displays current speed', () => {
    renderWithTheme(<Controls {...defaultProps} speed={5} />);
    expect(screen.getByText('5×')).toBeInTheDocument();
  });

  it('displays mutation rate as percent', () => {
    renderWithTheme(<Controls {...defaultProps} mutRate={0.08} />);
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('displays trails button text', () => {
    renderWithTheme(<Controls {...defaultProps} trails={true} />);
    expect(screen.getByText('☁ Trails')).toBeInTheDocument();
  });

  it('displays no trails button text', () => {
    renderWithTheme(<Controls {...defaultProps} trails={false} />);
    expect(screen.getByText('☁ No Trails')).toBeInTheDocument();
  });

  it('calls onToggleTrails when trails button clicked', () => {
    renderWithTheme(<Controls {...defaultProps} />);
    fireEvent.click(screen.getByText('☁ Trails'));
    expect(defaultProps.onToggleTrails).toHaveBeenCalledOnce();
  });

  it('calls onReset when reset button clicked', () => {
    renderWithTheme(<Controls {...defaultProps} />);
    fireEvent.click(screen.getByText('↻ Reset'));
    expect(defaultProps.onReset).toHaveBeenCalledOnce();
  });

  it('calls onSpeedChange when speed slider changes', () => {
    renderWithTheme(<Controls {...defaultProps} />);
    const sliders = document.querySelectorAll('input[type="range"]');
    const speedSlider = sliders[0]!;
    fireEvent.change(speedSlider, { target: { value: '5' } });
    expect(defaultProps.onSpeedChange).toHaveBeenCalledWith(5);
  });

  it('calls onMutRateChange when mutation slider changes', () => {
    renderWithTheme(<Controls {...defaultProps} />);
    const sliders = document.querySelectorAll('input[type="range"]');
    const mutSlider = sliders[1]!;
    fireEvent.change(mutSlider, { target: { value: '15' } });
    expect(defaultProps.onMutRateChange).toHaveBeenCalledWith(0.15);
  });
});
