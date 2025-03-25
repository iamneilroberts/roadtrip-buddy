import { render, screen, fireEvent, waitFor, act } from '../../test-utils';
import ChatInput from '../Chat/ChatInput';

describe('ChatInput', () => {
  it('renders correctly with default state', async () => {
    await act(async () => {
      render(<ChatInput onSendMessage={() => {}} isLoading={false} />);
    });

    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Quick')).toBeInTheDocument();
    expect(screen.getByText('Detailed')).toBeInTheDocument();
  });

  it('handles message submission', async () => {
    const mockOnSendMessage = jest.fn();
    
    await act(async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    });

    await act(async () => {
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Hello' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello', 'detailed');
    });
  });

  it('handles mode switching', async () => {
    const mockOnSendMessage = jest.fn();
    
    await act(async () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={false} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Quick'));
    });
    
    expect(screen.getByText('Quick')).toHaveClass('bg-blue-500');

    await act(async () => {
      fireEvent.click(screen.getByText('Detailed'));
    });
    
    expect(screen.getByText('Detailed')).toHaveClass('bg-blue-500');
  });

  it('disables submission when loading', async () => {
    await act(async () => {
      render(<ChatInput onSendMessage={() => {}} isLoading={true} />);
    });

    const submitButton = screen.getByRole('button', { name: /sending/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByPlaceholderText('Type your message...')).toBeDisabled();
  });

  it('shows loading spinner when loading', async () => {
    await act(async () => {
      render(<ChatInput onSendMessage={() => {}} isLoading={true} />);
    });

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
  });
});
