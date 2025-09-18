const express = require('express');
const router = express.Router();
const storageService = require('../services/storage');

// Get all scoring results
router.get('/', (req, res) => {
  try {
    const results = storageService.getResults();
    
    if (results.length === 0) {
      return res.status(404).json({
        error: 'No results found',
        message: 'Run scoring first using POST /api/score'
      });
    }
    
    res.json({
      message: 'Results found!',
      count: results.length,
      results: results.map(result => ({
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
    console.error('Error getting results:', error);
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not get results'
    });
  }
});

// Export results as CSV files
router.get('/export/csv', (req, res) => {
  try {
    const results = storageService.getResults();
    
    if (results.length === 0) {
      return res.status(404).json({
        error: 'No results found',
        message: 'Run scoring first to export results'
      });
    }
    
    // Create CSV content
    const csvHeader = 'Name,Role,Company,Industry,Location,Intent,Score,Reasoning\n';
    const csvRows = results.map(result => {
      return [
        result.name,
        result.role,
        result.company,
        result.industry,
        result.location,
        result.intent,
        result.score,
        result.reasoning
      ].join(',');
    });
    
    const csvContent = csvHeader + csvRows.join('\n');
    
    // Set headers for file download
    const filename = `lead-results-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting results:', error);
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not export results'
    });
  }
});

module.exports = router;
