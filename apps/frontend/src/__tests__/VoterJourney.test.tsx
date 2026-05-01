import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoterJourney from '../components/VoterJourney';

// Mock fetch globally
global.fetch = jest.fn();

describe('VoterJourney Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step 1 initially', () => {
    render(<VoterJourney />);
    expect(screen.getByText('🗺️ Personalized Voter Journey')).toBeInTheDocument();
    expect(screen.getByText('Step 1: What is your situation?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate my plan/i })).toBeDisabled();
  });

  it('enables the button when text is entered', () => {
    render(<VoterJourney />);
    const textarea = screen.getByPlaceholderText(/e.g. I recently got married/i);
    fireEvent.change(textarea, { target: { value: 'I just turned 18' } });
    expect(screen.getByRole('button', { name: /generate my plan/i })).toBeEnabled();
  });

  it('shows quick options that fill the textarea', () => {
    render(<VoterJourney />);
    const quickBtn = screen.getByText('Turning 18');
    fireEvent.click(quickBtn);
    const textarea = screen.getByPlaceholderText(/e.g. I recently got married/i);
    expect(textarea).toHaveValue('I just turned 18 and want to vote.');
    expect(screen.getByRole('button', { name: /generate my plan/i })).toBeEnabled();
  });

  it('handles the API call and transitions to step 3', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            title: 'Mock Step 1',
            description: 'Mock description',
            link: 'https://mock.link'
          }
        ]
      })
    });

    render(<VoterJourney />);
    const textarea = screen.getByPlaceholderText(/e.g. I recently got married/i);
    fireEvent.change(textarea, { target: { value: 'Test situation' } });
    
    const generateBtn = screen.getByRole('button', { name: /generate my plan/i });
    fireEvent.click(generateBtn);

    // Should transition to loading step 2 briefly (spinner)
    expect(screen.getByText(/AI is analyzing your situation/i)).toBeInTheDocument();

    // Should transition to step 3
    await waitFor(() => {
      expect(screen.getByText('Your Action Plan')).toBeInTheDocument();
      expect(screen.getByText('Mock Step 1')).toBeInTheDocument();
      expect(screen.getByText('Mock description')).toBeInTheDocument();
    });
  });

  it('handles API errors and stays on step 1', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Backend error'
      })
    });

    render(<VoterJourney />);
    const textarea = screen.getByPlaceholderText(/e.g. I recently got married/i);
    fireEvent.change(textarea, { target: { value: 'Test situation' } });
    
    const generateBtn = screen.getByRole('button', { name: /generate my plan/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Backend error')).toBeInTheDocument();
      expect(screen.getByText('Step 1: What is your situation?')).toBeInTheDocument();
    });
  });
});
