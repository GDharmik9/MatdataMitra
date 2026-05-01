import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBot from '../components/ChatBot';

// Mock the global window objects for Web Speech API
const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  lang: 'hi-IN',
  continuous: false,
  interimResults: false,
  maxAlternatives: 1,
  onresult: null,
  onerror: null,
  onend: null,
}));

// Mock the global window objects for Speech Synthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
};

const mockSpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  text: '',
  lang: 'hi-IN',
  rate: 1,
  onend: null,
}));

beforeAll(() => {
  // @ts-ignore
  global.window.SpeechRecognition = mockSpeechRecognition;
  // @ts-ignore
  global.window.webkitSpeechRecognition = mockSpeechRecognition;
  // @ts-ignore
  global.window.speechSynthesis = mockSpeechSynthesis;
  // @ts-ignore
  global.window.SpeechSynthesisUtterance = mockSpeechSynthesisUtterance;
  
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('ChatBot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders correctly with default text mode', () => {
    render(<ChatBot isActive={true} initialMode="text" />);
    expect(screen.getByPlaceholderText(/Type your message.../i)).toBeInTheDocument();
  });

  it('handles sending text message successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { reply: "Hello from AI!" }
      }),
      status: 200,
    });

    render(<ChatBot isActive={true} initialMode="text" />);
    
    const input = screen.getByPlaceholderText(/Type your message.../i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(sendButton);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText('Hello from AI!')).toBeInTheDocument();
    });
  });

  it('handles backend rate limit (429) gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: false,
        error: "429 Too Many Requests"
      }),
      status: 429,
    });

    render(<ChatBot isActive={true} initialMode="text" />);
    
    const input = screen.getByPlaceholderText(/Type your message.../i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('I am experiencing high traffic right now. Please try again in a moment.')).toBeInTheDocument();
    });
  });

  it('allows language switching', () => {
    render(<ChatBot isActive={true} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en' } });
    expect((select as HTMLSelectElement).value).toBe('en');
  });
});
