// storage for data - using memory for now
// TODO: use real database later

class StorageService {
  constructor() {
    this.offer = null;
    this.leads = [];
    this.results = [];
    console.log('storage ready');
  }

  // save offer
  setOffer(offerData) {
    this.offer = {
      ...offerData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    console.log('offer saved:', this.offer.name);
    return this.offer;
  }

  // get offer
  getOffer() {
    return this.offer;
  }

  // save leads
  setLeads(leadsData) {
    this.leads = leadsData.map(lead => ({
      ...lead,
      id: this.generateId(),
      uploadedAt: new Date().toISOString()
    }));
    console.log(`${this.leads.length} leads saved`);
    return this.leads;
  }

  // get leads
  getLeads() {
    return this.leads;
  }

  // save results
  setResults(resultsData) {
    this.results = resultsData.map(result => ({
      ...result,
      id: this.generateId(),
      scoredAt: new Date().toISOString()
    }));
    console.log(`${this.results.length} results saved`);
    return this.results;
  }

  // get results
  getResults() {
    return this.results;
  }

  // clear all
  clearAll() {
    this.offer = null;
    this.leads = [];
    this.results = [];
    console.log('data cleared');
  }

  // get stats
  getStats() {
    return {
      hasOffer: !!this.offer,
      leadsCount: this.leads.length,
      resultsCount: this.results.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // make id
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// one instance for all
const storageService = new StorageService();

module.exports = storageService;
