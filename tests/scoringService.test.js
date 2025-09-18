const ScoringService = require('../src/services/scoringService');

// Mock the AI service to avoid API calls during testing
jest.mock('../src/services/aiService', () => {
  return jest.fn().mockImplementation(() => ({
    scoreLead: jest.fn().mockResolvedValue({
      intent: 'High',
      reasoning: 'Test AI reasoning',
      aiScore: 50
    })
  }));
});

describe('ScoringService', () => {
  let scoringService;
  let mockOffer;
  let mockLead;

  beforeEach(() => {
    scoringService = new ScoringService();
    
    mockOffer = {
      name: 'AI Outreach Automation',
      value_props: ['24/7 outreach', '6x more meetings'],
      ideal_use_cases: ['B2B SaaS mid-market', 'Technology companies']
    };
    
    mockLead = {
      name: 'John Doe',
      role: 'CEO',
      company: 'TechCorp',
      industry: 'Technology',
      location: 'San Francisco',
      linkedin_bio: 'Experienced tech leader with 10+ years in SaaS'
    };
  });

  describe('calculateRuleScore', () => {
    test('should score decision maker roles correctly', () => {
      const lead = { ...mockLead, role: 'CEO' };
      const score = scoringService.calculateRuleScore(lead, mockOffer);
      expect(score).toBeGreaterThanOrEqual(20); // At least role score
    });

    test('should score influencer roles correctly', () => {
      const lead = { ...mockLead, role: 'Senior Marketing Manager' };
      const score = scoringService.calculateRuleScore(lead, mockOffer);
      expect(score).toBeGreaterThanOrEqual(10); // At least role score
    });

    test('should score industry match correctly', () => {
      const lead = { ...mockLead, industry: 'Technology' };
      const score = scoringService.calculateRuleScore(lead, mockOffer);
      expect(score).toBeGreaterThanOrEqual(20); // Industry match
    });

    test('should score data completeness correctly', () => {
      const lead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'TechCorp',
        industry: 'Technology',
        location: 'San Francisco',
        linkedin_bio: 'Bio provided'
      };
      const score = scoringService.calculateRuleScore(lead, mockOffer);
      expect(score).toBeGreaterThanOrEqual(10); // Data completeness
    });

    test('should cap rule score at 50 points', () => {
      const lead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'TechCorp',
        industry: 'Technology',
        location: 'San Francisco',
        linkedin_bio: 'Bio provided'
      };
      const score = scoringService.calculateRuleScore(lead, mockOffer);
      expect(score).toBeLessThanOrEqual(50);
    });
  });

  describe('scoreRoleRelevance', () => {
    test('should return 20 for decision maker roles', () => {
      const decisionMakerRoles = ['CEO', 'CTO', 'Head of Sales', 'Director of Marketing'];
      
      decisionMakerRoles.forEach(role => {
        const score = scoringService.scoreRoleRelevance(role);
        expect(score).toBe(20);
      });
    });

    test('should return 10 for influencer roles', () => {
      const influencerRoles = ['Senior Developer', 'Marketing Specialist', 'Data Analyst'];
      
      influencerRoles.forEach(role => {
        const score = scoringService.scoreRoleRelevance(role);
        expect(score).toBe(10);
      });
    });

    test('should return 0 for other roles', () => {
      const otherRoles = ['Intern', 'Receptionist', 'Janitor'];
      
      otherRoles.forEach(role => {
        const score = scoringService.scoreRoleRelevance(role);
        expect(score).toBe(0);
      });
    });

    test('should handle empty or null roles', () => {
      expect(scoringService.scoreRoleRelevance('')).toBe(0);
      expect(scoringService.scoreRoleRelevance(null)).toBe(0);
      expect(scoringService.scoreRoleRelevance(undefined)).toBe(0);
    });
  });

  describe('scoreIndustryMatch', () => {
    test('should return 20 for exact industry matches', () => {
      const offer = {
        ideal_use_cases: ['Technology', 'B2B SaaS']
      };
      
      const score = scoringService.scoreIndustryMatch('Technology', offer.ideal_use_cases);
      expect(score).toBe(20);
    });

    test('should return 10 for related industries', () => {
      const offer = {
        ideal_use_cases: ['Technology', 'B2B SaaS']
      };
      
      const score = scoringService.scoreIndustryMatch('Software', offer.ideal_use_cases);
      expect(score).toBe(10);
    });

    test('should return 0 for unrelated industries', () => {
      const offer = {
        ideal_use_cases: ['Technology', 'B2B SaaS']
      };
      
      const score = scoringService.scoreIndustryMatch('Agriculture', offer.ideal_use_cases);
      expect(score).toBe(0);
    });

    test('should handle empty or null inputs', () => {
      expect(scoringService.scoreIndustryMatch('', ['Technology'])).toBe(0);
      expect(scoringService.scoreIndustryMatch('Technology', [])).toBe(0);
      expect(scoringService.scoreIndustryMatch(null, ['Technology'])).toBe(0);
    });
  });

  describe('scoreDataCompleteness', () => {
    test('should return 10 for complete data', () => {
      const lead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'TechCorp',
        industry: 'Technology',
        location: 'San Francisco',
        linkedin_bio: 'Bio provided'
      };
      
      const score = scoringService.scoreDataCompleteness(lead);
      expect(score).toBe(10); // Should be 10 (capped at 10 even with bio bonus)
    });

    test('should return partial score for incomplete data', () => {
      const lead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'TechCorp',
        industry: '',
        location: '',
        linkedin_bio: ''
      };
      
      const score = scoringService.scoreDataCompleteness(lead);
      expect(score).toBeLessThan(10);
      expect(score).toBeGreaterThan(0);
    });

    test('should return 0 for empty data', () => {
      const lead = {
        name: '',
        role: '',
        company: '',
        industry: '',
        location: '',
        linkedin_bio: ''
      };
      
      const score = scoringService.scoreDataCompleteness(lead);
      expect(score).toBe(0);
    });
  });

  describe('determineOverallIntent', () => {
    test('should return High for scores >= 70', () => {
      expect(scoringService.determineOverallIntent(70)).toBe('High');
      expect(scoringService.determineOverallIntent(85)).toBe('High');
      expect(scoringService.determineOverallIntent(100)).toBe('High');
    });

    test('should return Medium for scores 40-69', () => {
      expect(scoringService.determineOverallIntent(40)).toBe('Medium');
      expect(scoringService.determineOverallIntent(55)).toBe('Medium');
      expect(scoringService.determineOverallIntent(69)).toBe('Medium');
    });

    test('should return Low for scores < 40', () => {
      expect(scoringService.determineOverallIntent(0)).toBe('Low');
      expect(scoringService.determineOverallIntent(25)).toBe('Low');
      expect(scoringService.determineOverallIntent(39)).toBe('Low');
    });
  });

  describe('scoreLead', () => {
    test('should return complete scoring result', async () => {
      const result = await scoringService.scoreLead(mockLead, mockOffer);
      
      expect(result).toHaveProperty('name', mockLead.name);
      expect(result).toHaveProperty('role', mockLead.role);
      expect(result).toHaveProperty('company', mockLead.company);
      expect(result).toHaveProperty('industry', mockLead.industry);
      expect(result).toHaveProperty('location', mockLead.location);
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('breakdown');
      
      expect(['High', 'Medium', 'Low']).toContain(result.intent);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(typeof result.reasoning).toBe('string');
    });

    test('should handle scoring errors gracefully', async () => {
      // Mock AI service to throw error
      scoringService.aiService.scoreLead.mockRejectedValueOnce(new Error('AI service error'));
      
      const result = await scoringService.scoreLead(mockLead, mockOffer);
      
      expect(result.intent).toBe('Low');
      expect(result.score).toBe(10);
      expect(result.reasoning).toContain('Scoring failed');
    });
  });

  describe('scoreLeads (batch processing)', () => {
    test('should process multiple leads', async () => {
      const leads = [
        { ...mockLead, name: 'John Doe' },
        { ...mockLead, name: 'Jane Smith' },
        { ...mockLead, name: 'Mike Johnson' }
      ];
      
      const results = await scoringService.scoreLeads(leads, mockOffer);
      
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.name).toBe(leads[index].name);
        expect(result).toHaveProperty('intent');
        expect(result).toHaveProperty('score');
      });
    });

    test('should handle errors in batch processing', async () => {
      const leads = [
        { ...mockLead, name: 'John Doe' },
        { name: 'Invalid Lead' }, // Missing required fields
        { ...mockLead, name: 'Jane Smith' }
      ];
      
      const results = await scoringService.scoreLeads(leads, mockOffer);
      
      expect(results).toHaveLength(3);
      // All leads should have results, even if some failed
      results.forEach(result => {
        expect(result).toHaveProperty('intent');
        expect(result).toHaveProperty('score');
      });
    });
  });
});
