import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentVerifier from '../components/DocumentVerifier';

// Mock fetch and URL globally
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('DocumentVerifier Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the initial state correctly', () => {
    render(<DocumentVerifier />);
    expect(screen.getByText('🔍 AI Document Pre-Verifier')).toBeInTheDocument();
    expect(screen.getByText(/upload your document image/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /verify document/i })).not.toBeInTheDocument();
  });

  it('shows error if non-image file is selected', async () => {
    render(<DocumentVerifier />);
    const fileInput = screen.getByTestId('file-upload');
    
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Please select a valid image file (JPEG, PNG).')).toBeInTheDocument();
    });
  });

  it('shows verify button when image is selected and handles successful verification', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          isValid: true,
          documentType: 'Aadhaar Card',
          confidence: 99,
          feedback: 'Perfect image'
        }
      })
    });

    render(<DocumentVerifier />);
    
    const fileInput = screen.getByTestId('file-upload');
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // The button should now be visible
    const verifyBtn = await screen.findByRole('button', { name: /verify document/i });
    expect(verifyBtn).toBeInTheDocument();

    // Click verify
    fireEvent.click(verifyBtn);

    // Wait for the result to appear
    await waitFor(() => {
      expect(screen.getByText('✅ Document Accepted')).toBeInTheDocument();
      expect(screen.getByText('Aadhaar Card')).toBeInTheDocument();
      expect(screen.getByText('Perfect image')).toBeInTheDocument();
    });
  });
});
