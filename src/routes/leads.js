const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const router = express.Router();
const storageService = require('../services/storage');

// Setup file upload
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

// Upload CSV file with leads
router.post('/upload', upload.single('leads'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a CSV file',
        example: 'Use field name "leads" and upload a CSV with columns: name,role,company,industry,location,linkedin_bio'
      });
    }
    
    const filePath = req.file.path;
    const leads = [];
    
    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const lead = {
            name: row.name ? row.name.trim() : '',
            role: row.role ? row.role.trim() : '',
            company: row.company ? row.company.trim() : '',
            industry: row.industry ? row.industry.trim() : '',
            location: row.location ? row.location.trim() : '',
            linkedin_bio: row.linkedin_bio ? row.linkedin_bio.trim() : ''
          };
          
          // Only save leads with name and company
          if (lead.name && lead.company) {
            leads.push(lead);
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    // Delete the uploaded file
    fs.unlinkSync(filePath);
    
    if (leads.length === 0) {
      return res.status(400).json({
        error: 'No valid leads found',
        message: 'CSV must have name and company columns with data'
      });
    }
    
    // Save leads
    const savedLeads = storageService.setLeads(leads);
    
    res.status(201).json({
      message: 'Leads uploaded successfully!',
      count: savedLeads.length,
      leads: savedLeads.map(lead => ({
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        location: lead.location
      }))
    });
    
  } catch (error) {
    console.error('Error uploading leads:', error);
    
    // Clean up file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not process CSV file'
    });
  }
});

// Get all uploaded leads
router.get('/', (req, res) => {
  try {
    const leads = storageService.getLeads();
    
    if (leads.length === 0) {
      return res.status(404).json({
        error: 'No leads found',
        message: 'Upload a CSV file first using POST /api/leads/upload'
      });
    }
    
    res.json({
      message: 'Leads found!',
      count: leads.length,
      leads: leads.map(lead => ({
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        location: lead.location
      }))
    });
    
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({
      error: 'Something went wrong',
      message: 'Could not get leads'
    });
  }
});

// Get sample CSV format
router.get('/sample', (req, res) => {
  const sampleData = [
    {
      name: 'John Doe',
      role: 'CEO',
      company: 'TechCorp',
      industry: 'Technology',
      location: 'San Francisco',
      linkedin_bio: 'Tech leader with 10+ years experience'
    },
    {
      name: 'Jane Smith',
      role: 'Marketing Manager',
      company: 'GrowthCo',
      industry: 'B2B SaaS',
      location: 'New York',
      linkedin_bio: 'Marketing expert focused on growth'
    }
  ];
  
  res.json({
    message: 'Sample CSV format',
    columns: ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'],
    sampleData: sampleData,
    csvExample: 'John Doe,CEO,TechCorp,Technology,San Francisco,Tech leader...'
  });
});

module.exports = router;
