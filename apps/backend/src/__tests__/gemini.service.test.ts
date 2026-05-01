import { generateResponse } from '../services/gemini.service';
import { GoogleGenAI } from '@google/genai';

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: "Mocked AI Response"
          })
        }
      };
    })
  };
});

describe('Gemini AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a response successfully using the mocked genai client', async () => {
    const response = await generateResponse("What is Form 6?", "en");
    expect(response).toBe("Mocked AI Response");
  });

  it('should fall back to safe error handling if genai throws an error', async () => {
    (GoogleGenAI as jest.Mock).mockImplementationOnce(() => {
      return {
        models: {
          generateContent: jest.fn().mockRejectedValue(new Error('Rate limit exceeded'))
        }
      };
    });

    await expect(generateResponse("What is Form 6?", "en")).rejects.toThrow('Failed to generate AI response');
  });
});
