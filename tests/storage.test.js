const storageService = require('../src/services/storage');

describe('StorageService', () => {
  beforeEach(() => {
    // Clear all data before each test
    storageService.clearAll();
  });

  describe('Offer Management', () => {
    test('should store and retrieve offer', () => {
      const offerData = {
        name: 'AI Outreach Automation',
        value_props: ['24/7 outreach', '6x more meetings'],
        ideal_use_cases: ['B2B SaaS mid-market']
      };

      const storedOffer = storageService.setOffer(offerData);
      expect(storedOffer).toMatchObject(offerData);
      expect(storedOffer).toHaveProperty('id');
      expect(storedOffer).toHaveProperty('createdAt');

      const retrievedOffer = storageService.getOffer();
      expect(retrievedOffer).toEqual(storedOffer);
    });

    test('should return null when no offer is stored', () => {
      const offer = storageService.getOffer();
      expect(offer).toBeNull();
    });

    test('should overwrite existing offer', () => {
      const offer1 = {
        name: 'First Offer',
        value_props: ['Feature 1'],
        ideal_use_cases: ['Use case 1']
      };

      const offer2 = {
        name: 'Second Offer',
        value_props: ['Feature 2'],
        ideal_use_cases: ['Use case 2']
      };

      storageService.setOffer(offer1);
      storageService.setOffer(offer2);

      const retrievedOffer = storageService.getOffer();
      expect(retrievedOffer.name).toBe('Second Offer');
    });
  });

  describe('Leads Management', () => {
    test('should store and retrieve leads', () => {
      const leadsData = [
        {
          name: 'John Doe',
          role: 'CEO',
          company: 'TechCorp',
          industry: 'Technology',
          location: 'San Francisco',
          linkedin_bio: 'Tech leader'
        },
        {
          name: 'Jane Smith',
          role: 'CTO',
          company: 'StartupCo',
          industry: 'SaaS',
          location: 'New York',
          linkedin_bio: 'Technical expert'
        }
      ];

      const storedLeads = storageService.setLeads(leadsData);
      expect(storedLeads).toHaveLength(2);
      
      storedLeads.forEach((lead, index) => {
        expect(lead).toMatchObject(leadsData[index]);
        expect(lead).toHaveProperty('id');
        expect(lead).toHaveProperty('uploadedAt');
      });

      const retrievedLeads = storageService.getLeads();
      expect(retrievedLeads).toEqual(storedLeads);
    });

    test('should return empty array when no leads are stored', () => {
      const leads = storageService.getLeads();
      expect(leads).toEqual([]);
    });

    test('should overwrite existing leads', () => {
      const leads1 = [
        { name: 'John Doe', role: 'CEO', company: 'TechCorp', industry: 'Tech', location: 'SF' }
      ];

      const leads2 = [
        { name: 'Jane Smith', role: 'CTO', company: 'StartupCo', industry: 'SaaS', location: 'NY' }
      ];

      storageService.setLeads(leads1);
      storageService.setLeads(leads2);

      const retrievedLeads = storageService.getLeads();
      expect(retrievedLeads).toHaveLength(1);
      expect(retrievedLeads[0].name).toBe('Jane Smith');
    });
  });

  describe('Results Management', () => {
    test('should store and retrieve results', () => {
      const resultsData = [
        {
          name: 'John Doe',
          role: 'CEO',
          company: 'TechCorp',
          industry: 'Technology',
          location: 'San Francisco',
          intent: 'High',
          score: 85,
          reasoning: 'Great fit for the product'
        },
        {
          name: 'Jane Smith',
          role: 'CTO',
          company: 'StartupCo',
          industry: 'SaaS',
          location: 'New York',
          intent: 'Medium',
          score: 65,
          reasoning: 'Good potential customer'
        }
      ];

      const storedResults = storageService.setResults(resultsData);
      expect(storedResults).toHaveLength(2);
      
      storedResults.forEach((result, index) => {
        expect(result).toMatchObject(resultsData[index]);
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('scoredAt');
      });

      const retrievedResults = storageService.getResults();
      expect(retrievedResults).toEqual(storedResults);
    });

    test('should return empty array when no results are stored', () => {
      const results = storageService.getResults();
      expect(results).toEqual([]);
    });

    test('should overwrite existing results', () => {
      const results1 = [
        { name: 'John Doe', intent: 'High', score: 85, reasoning: 'Great fit' }
      ];

      const results2 = [
        { name: 'Jane Smith', intent: 'Medium', score: 65, reasoning: 'Good potential' }
      ];

      storageService.setResults(results1);
      storageService.setResults(results2);

      const retrievedResults = storageService.getResults();
      expect(retrievedResults).toHaveLength(1);
      expect(retrievedResults[0].name).toBe('Jane Smith');
    });
  });

  describe('Data Clearing', () => {
    test('should clear all data', () => {
      // Store some data
      storageService.setOffer({
        name: 'Test Offer',
        value_props: ['Feature 1'],
        ideal_use_cases: ['Use case 1']
      });

      storageService.setLeads([
        { name: 'John Doe', role: 'CEO', company: 'TechCorp', industry: 'Tech', location: 'SF' }
      ]);

      storageService.setResults([
        { name: 'John Doe', intent: 'High', score: 85, reasoning: 'Great fit' }
      ]);

      // Verify data exists
      expect(storageService.getOffer()).not.toBeNull();
      expect(storageService.getLeads()).toHaveLength(1);
      expect(storageService.getResults()).toHaveLength(1);

      // Clear all data
      storageService.clearAll();

      // Verify data is cleared
      expect(storageService.getOffer()).toBeNull();
      expect(storageService.getLeads()).toEqual([]);
      expect(storageService.getResults()).toEqual([]);
    });
  });

  describe('Statistics', () => {
    test('should return correct statistics', () => {
      // Initially empty
      let stats = storageService.getStats();
      expect(stats.hasOffer).toBe(false);
      expect(stats.leadsCount).toBe(0);
      expect(stats.resultsCount).toBe(0);
      expect(stats).toHaveProperty('lastUpdated');

      // Add some data
      storageService.setOffer({
        name: 'Test Offer',
        value_props: ['Feature 1'],
        ideal_use_cases: ['Use case 1']
      });

      storageService.setLeads([
        { name: 'John Doe', role: 'CEO', company: 'TechCorp', industry: 'Tech', location: 'SF' },
        { name: 'Jane Smith', role: 'CTO', company: 'StartupCo', industry: 'SaaS', location: 'NY' }
      ]);

      storageService.setResults([
        { name: 'John Doe', intent: 'High', score: 85, reasoning: 'Great fit' }
      ]);

      // Check updated statistics
      stats = storageService.getStats();
      expect(stats.hasOffer).toBe(true);
      expect(stats.leadsCount).toBe(2);
      expect(stats.resultsCount).toBe(1);
      expect(stats).toHaveProperty('lastUpdated');
    });
  });

  describe('ID Generation', () => {
    test('should generate unique IDs', () => {
      const offer1 = storageService.setOffer({
        name: 'Offer 1',
        value_props: ['Feature 1'],
        ideal_use_cases: ['Use case 1']
      });

      const offer2 = storageService.setOffer({
        name: 'Offer 2',
        value_props: ['Feature 2'],
        ideal_use_cases: ['Use case 2']
      });

      expect(offer1.id).not.toBe(offer2.id);
      expect(typeof offer1.id).toBe('string');
      expect(typeof offer2.id).toBe('string');
    });
  });
});
