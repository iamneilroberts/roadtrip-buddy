import { render, screen } from '../../test-utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default size and color', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('img', { name: /loading indicator/i });
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('h-8');
    expect(spinner).toHaveClass('text-blue-500');
  });

  it('accepts custom size', () => {
    render(<LoadingSpinner size="large" />);

    const spinner = screen.getByRole('img', { name: /loading indicator/i });
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('h-12');
  });

  it('accepts custom color', () => {
    render(<LoadingSpinner color="gray" />);

    const spinner = screen.getByRole('img', { name: /loading indicator/i });
    expect(spinner).toHaveClass('text-gray-500');
  });

  it('accepts custom className', () => {
    render(<LoadingSpinner className="mt-4" />);

    // The className is applied to the container div, not the SVG itself
    const container = screen.getByRole('img', { name: /loading indicator/i }).parentElement;
    expect(container).toHaveClass('mt-4');
  });
});
