import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomeContent from '../components/HomeContent';
import * as firebaseLib from '../lib/firebase';

// Mock the firebase library
jest.mock('../lib/firebase', () => ({
  getFirebaseDB: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
}));

// Mock the next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('HomeContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and feature grid initially', async () => {
    // Provide a mock DB and empty getDocs
    (firebaseLib.getFirebaseDB as jest.Mock).mockReturnValue({});
    const { getDocs } = require('firebase/firestore');
    (getDocs as jest.Mock).mockResolvedValue({ forEach: () => {} });

    await waitFor(() => {
      render(<HomeContent />);
    });
    
    expect(screen.getByPlaceholderText(/Search forms, guidelines/i)).toBeInTheDocument();
    expect(screen.getByText('Everything You Need')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Guidance')).toBeInTheDocument();
  });

  it('filters services and shows results when searching', async () => {
    // Mock firebase to return some test data
    const mockServices = [
      { id: 'form-6', title_en: 'Form 6: New Voter Registration', category: 'Forms & Guidelines', pdf_en: 'link' },
      { id: 'src', title_en: 'Special Summary Revision (SRC)', category: 'Election SRC' },
    ];

    // Mock firestore functions
    const getDocsMock = jest.fn().mockResolvedValue({
      forEach: (callback: any) => {
        mockServices.forEach(s => callback({ id: s.id, data: () => s }));
      }
    });

    const { collection, query, limit, getDocs } = require('firebase/firestore');
    (collection as jest.Mock).mockReturnValue({});
    (query as jest.Mock).mockReturnValue({});
    (limit as jest.Mock).mockReturnValue({});
    (getDocs as jest.Mock).mockImplementation(getDocsMock);

    // Provide a mock DB
    (firebaseLib.getFirebaseDB as jest.Mock).mockReturnValue({});

    render(<HomeContent />);
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Search forms, guidelines/i);
    fireEvent.change(searchInput, { target: { value: 'Form 6' } });

    // Feature grid should be hidden, search results should show
    await waitFor(() => {
      expect(screen.queryByText('Everything You Need')).not.toBeInTheDocument();
      expect(screen.getByText('Search Results (1)')).toBeInTheDocument();
      expect(screen.getByText('Form 6: New Voter Registration')).toBeInTheDocument();
      expect(screen.queryByText('Special Summary Revision (SRC)')).not.toBeInTheDocument();
    });
  });

  it('populates search input when suggestion chip is clicked', async () => {
    // Provide a mock DB and empty getDocs
    (firebaseLib.getFirebaseDB as jest.Mock).mockReturnValue({});
    const { getDocs } = require('firebase/firestore');
    (getDocs as jest.Mock).mockResolvedValue({ forEach: () => {} });

    await waitFor(() => {
      render(<HomeContent />);
    });
    
    const chip = screen.getByText('Form 6');
    fireEvent.click(chip);

    const searchInput = screen.getByPlaceholderText(/Search forms, guidelines/i) as HTMLInputElement;
    expect(searchInput.value).toBe('Form 6');
  });
});
