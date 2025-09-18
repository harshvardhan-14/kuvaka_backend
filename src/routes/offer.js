const express = require('express');
const router = express.Router();
const storageService = require('../services/storage');

// Save product/offer info
router.post('/', (req, res) => {
  try {
    const { name, value_props, ideal_use_cases } = req.body;
    
    // Check if required fields are there
    if (!name || !value_props || !ideal_use_cases) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide name, value_props, and ideal_use_cases',
        example: {
          name: 'AI Outreach Tool',
          value_props: ['Saves time', 'More meetings'],
          ideal_use_cases: ['B2B companies', 'Sales teams']
        }
      });
    }
    
    // Basic validation
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be a non-empty string'
      });
    }
    
    if (!Array.isArray(value_props) || value_props.length === 0) {
      return res.status(400).json({
        error: 'Invalid value_props',
        message: 'value_props must be an array with at least one item'
      });
    }
    
    if (!Array.isArray(ideal_use_cases) || ideal_use_cases.length === 0) {
      return res.status(400).json({
        error: 'Invalid ideal_use_cases',
        message: 'ideal_use_cases must be an array with at least one item'
      });
    }
    
    // Save the offer
    const offerData = {
      name: name.trim(),
      value_props: value_props.map(prop => prop.trim()),
      ideal_use_cases: ideal_use_cases.map(useCase => useCase.trim())
    };
    
    const savedOffer = storageService.setOffer(offerData);
    
    res.status(201).json({
      message: 'Offer saved successfully!',
      offer: savedOffer
    });
    
  } catch (error) {
    console.error('Error saving offer:', error);
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not save offer'
    });
  }
});

// Get saved offer
router.get('/', (req, res) => {
  try {
    const offer = storageService.getOffer();
    
    if (!offer) {
      return res.status(404).json({
        error: 'No offer found',
        message: 'Please save an offer first using POST /api/offer'
      });
    }
    
    res.json({
      message: 'Offer found!',
      offer: offer
    });
    
  } catch (error) {
    console.error('Error getting offer:', error);
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not get offer'
    });
  }
});

module.exports = router;
