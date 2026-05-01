import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DemocracyQuiz from '../components/DemocracyQuiz';

global.fetch = jest.fn();

describe('DemocracyQuiz Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockQuestions = [
    {
      question: "Q1",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "Explanation 1"
    },
    {
      question: "Q2",
      options: ["A", "B", "C", "D"],
      correctIndex: 1,
      explanation: "Explanation 2"
    }
  ];

  it('renders start screen initially', () => {
    render(<DemocracyQuiz />);
    expect(screen.getByText('The "Democracy Defender" Quiz')).toBeInTheDocument();
  });

  it('plays through the quiz and shows results', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockQuestions })
    });

    render(<DemocracyQuiz />);
    
    // Start Quiz
    fireEvent.click(screen.getByRole('button', { name: /start quiz/i }));
    
    // Wait for Q1
    await waitFor(() => {
      expect(screen.getByText('Q1')).toBeInTheDocument();
    });

    // Answer Q1 correctly (Index 0)
    const options1 = screen.getAllByRole('button');
    fireEvent.click(options1[0]);

    // Check explanation and score progress
    expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
    expect(screen.getByText('Explanation 1')).toBeInTheDocument();

    // Next Question
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));

    // Wait for Q2
    await waitFor(() => {
      expect(screen.getByText('Q2')).toBeInTheDocument();
    });

    // Answer Q2 wrongly (Index 0 instead of 1)
    const options2 = screen.getAllByRole('button');
    fireEvent.click(options2[0]);

    expect(screen.getByText('❌ Incorrect')).toBeInTheDocument();

    // Finish Quiz
    fireEvent.click(screen.getByRole('button', { name: /view results/i }));

    // Check Results screen
    await waitFor(() => {
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
      // Score should be 1 out of 2
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 2')).toBeInTheDocument();
      // Because score < 4, should show keep learning
      expect(screen.getByText(/Good effort! Keep learning/i)).toBeInTheDocument();
    });
  });
});
