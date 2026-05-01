import { generateResponse } from '../services/gemini.service';

// Expose the mock fn via the mock factory itself so it's available despite hoisting
jest.mock('@google/genai', () => {
  const generateContent = jest.fn().mockResolvedValue({ text: 'Mocked AI Response' });
  return {
    GoogleGenAI: jest.fn(() => ({ models: { generateContent } })),
    // Expose for test access via jest.requireMock
    _generateContent: generateContent,
  };
});

describe('Gemini AI Service', () => {
  // Access the shared mock fn after the mock is set up
  const getMock = () => (jest.requireMock('@google/genai') as any)._generateContent as jest.Mock;

  beforeEach(() => {
    getMock().mockReset();
    getMock().mockResolvedValue({ text: 'Mocked AI Response' });
  });

  it('should generate a response successfully using the mocked genai client', async () => {
    const response = await generateResponse('What is Form 6?', 'en');
    expect(response).toBe('Mocked AI Response');
  });

  it('should fall back to safe error handling if genai throws an error', async () => {
    getMock().mockRejectedValueOnce(new Error('Rate limit exceeded'));
    await expect(generateResponse('What is Form 6?', 'en')).rejects.toThrow('Failed to generate AI response');
  });
});
