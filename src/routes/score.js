const express = require('express');
const router = express.Router();
const storageService = require('../services/storage');
const ScoringService = require('../services/scoringService');

// Score all leads
router.post('/', async (req, res) => {
  try {
    // Check if we have offer and leads
    const offer = storageService.getOffer();
    if (!offer) {
      return res.status(400).json({
        error: 'No offer found',
        message: 'Please save an offer first using POST /api/offer'
      });
    }
    
    const leads = storageService.getLeads();
    if (leads.length === 0) {
      return res.status(400).json({
        error: 'No leads found',
        message: 'Please upload leads first using POST /api/leads/upload'
      });
    }
    
    console.log(`Starting to score ${leads.length} leads...`);
    
    // Score all leads
    const scoringService = new ScoringService();
    const results = await scoringService.scoreLeads(leads, offer);
    
    // Save results
    const savedResults = storageService.setResults(results);
    
    // Calculate summary
    const summary = calculateSummary(savedResults);
    
    res.status(200).json({
      message: 'Scoring completed!',
      summary: summary,
      results: savedResults.map(result => ({
        name: result.name,
        role: result.role,
        company: result.company,
        industry: result.industry,
        location: result.location,
        intent: result.intent,
        score: result.score,
        reasoning: result.reasoning
      }))
    });
    
  } catch (error) {
    console.error('Error during scoring:', error);
    
    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'API key problem',
        message: 'Please check your GEMINI_API_KEY in .env file'
      });
    }
    
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not score leads'
    });
  }
});

// Calculate summary stats
function calculateSummary(results) {
  if (!results || results.length === 0) {
    return {
      totalLeads: 0,
      highIntent: 0,
      mediumIntent: 0,
      lowIntent: 0,
      averageScore: 0
    };
  }
  
  const intentCounts = { High: 0, Medium: 0, Low: 0 };
  let totalScore = 0;
  
  results.forEach(result => {
    intentCounts[result.intent]++;
    totalScore += result.score;
  });
  
  return {
    totalLeads: results.length,
    highIntent: intentCounts.High,
    mediumIntent: intentCounts.Medium,
    lowIntent: intentCounts.Low,
    averageScore: Math.round(totalScore / results.length)
  };
}

module.exports = router;
