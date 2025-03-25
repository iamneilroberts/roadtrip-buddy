import { render, screen } from '../../test-utils';
import OfflineNotification from '../OfflineNotification';

describe('OfflineNotification', () => {
  it('renders when offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    render(<OfflineNotification />);

    expect(screen.getByText(/You are currently offline/)).toBeInTheDocument();
    expect(screen.getByText(/Some features may be limited/)).toBeInTheDocument();
  });

  it('does not render when online', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });

    render(<OfflineNotification />);

    expect(screen.queryByText(/You are currently offline/)).not.toBeInTheDocument();
  });
});
