import { findLocalAnswer } from "../services/firestore.service";

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockDocs = [
    {
      data: () => ({
        title_en: 'Form 6: New Voter Registration',
        description_en: 'Use Form 6 if you have never registered to vote before.',
        pdf_en: 'http://example.com/form6.pdf'
      })
    },
    {
      data: () => ({
        title_en: '2024 General Election Results Declared',
        description_en: 'The 2024 Indian general elections concluded on June 1, 2024.',
        source_url: 'http://example.com/results'
      })
    }
  ];

  return {
    apps: ['mockApp'],
    firestore: () => ({
      collection: () => ({
        get: jest.fn().mockResolvedValue({
          forEach: (callback: any) => mockDocs.forEach(callback)
        })
      })
    })
  };
});

describe('Firestore Service - Cost Saving Wall', () => {
  it('returns null for empty query', async () => {
    const result = await findLocalAnswer("");
    expect(result).toBeNull();
  });

  it('returns null for unrecognized query', async () => {
    const result = await findLocalAnswer("how to cook pasta");
    expect(result).toBeNull();
  });

  it('returns Form 6 for voter registration query', async () => {
    const result = await findLocalAnswer("form 6 new voter registration");
    expect(result).not.toBeNull();
    expect(result).toContain("Form 6: New Voter Registration");
    expect(result).toContain("http://example.com/form6.pdf");
  });

  it('returns results info for election results query', async () => {
    const result = await findLocalAnswer("2024 election results declared");
    expect(result).not.toBeNull();
    expect(result).toContain("2024 General Election Results Declared");
    expect(result).toContain("http://example.com/results");
  });
});
