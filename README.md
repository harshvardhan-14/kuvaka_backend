# Lead Scoring API

A simple API that scores leads using AI. Made by Harshvardhan Singh ! 😊

## What it does

This API helps you score leads (potential customers) by:
1. Taking your product details
2. Uploading a CSV with leads
3. Using AI to score each lead
4. Giving you results with scores and reasoning

## How to run

1. **Install dependencies**
   
   npm install
   

2. **Set up environment**
   
   GEMINI_API_KEY=your_api_key_here
   

3. **Start the server**
   
   npm start
   

4. **Test it works**
   
    http://localhost:3000/health
   

## API Endpoints

### Main workflow:
1. `POST /api/offer` - Save your product details
2. `POST /api/leads/upload` - Upload CSV with leads
3. `POST /api/score` - Score all leads
4. `GET /api/results` - See the results

### Other useful endpoints:
- `GET /` - API info
- `GET /health` - Check if server is running
- `GET /api/leads/sample` - See CSV format example
- `GET /api/results/export/csv` - Download results as CSV

## How to test manually

### Step 1: Save your product
```
curl -X POST http://localhost:3000/api/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Sales Tool",
    "value_props": ["Saves time", "More meetings"],
    "ideal_use_cases": ["B2B companies", "Sales teams"]
  }'
```

**Expected result:** 
```json
{
  "message": "Offer saved successfully!",
  "offer": {
    "name": "AI Sales Tool",
    "value_props": ["Saves time", "More meetings"],
    "ideal_use_cases": ["B2B companies", "Sales teams"],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Step 2: Upload leads CSV
Use the included `sample-leads.csv` file or create your own with this format:
```csv
name,role,company,industry,location,linkedin_bio
John Doe,CEO,TechCorp,Technology,San Francisco,Tech leader with 10+ years
Jane Smith,Marketing Manager,GrowthCo,B2B SaaS,New York,Marketing expert
```

Then upload it:
```bash
curl -X POST http://localhost:3000/api/leads/upload \
  -F "leads=@sample-leads.csv"
```

**Expected result:**
```json
{
  "message": "Leads uploaded successfully!",
  "count": 2,
  "leads": [
    {
      "name": "John Doe",
      "role": "CEO",
      "company": "TechCorp",
      "industry": "Technology",
      "location": "San Francisco"
    },
    {
      "name": "Jane Smith",
      "role": "Marketing Manager",
      "company": "GrowthCo",
      "industry": "B2B SaaS",
      "location": "New York"
    }
  ]
}
```

### Step 3: Score the leads
```bash
curl -X POST http://localhost:3000/api/score
```

**Expected result:**
```json
{
  "message": "Scoring completed!",
  "summary": {
    "totalLeads": 2,
    "highIntent": 1,
    "mediumIntent": 1,
    "lowIntent": 0,
    "averageScore": 75
  },
  "results": [
    {
      "name": "John Doe",
      "role": "CEO",
      "company": "TechCorp",
      "industry": "Technology",
      "location": "San Francisco",
      "intent": "High",
      "score": 85,
      "reasoning": "CEO role with tech industry match. AI says good fit for B2B product."
    }
  ]
}
```

### Step 4: Get results
```bash
curl http://localhost:3000/api/results
```

**Expected result:** Same as step 3 but just the results part.

### Step 5: Export as CSV
```bash
curl http://localhost:3000/api/results/export/csv -o results.csv
```

**Expected result:** Downloads a CSV file with all the results.

## How scoring works

The API gives each lead a score from 0-100:

**Rule-based scoring (50 points max):**
- Role: CEO/CTO/Manager = 20 points, Senior/Specialist = 10 points
- Industry match: Exact match = 20 points, Related = 10 points  
- Data completeness: All fields filled = 10 points

**AI scoring (50 points max):**
- Uses Google Gemini to analyze the lead
- High intent = 50 points, Medium = 30 points, Low = 10 points

**Final score:**
- 70-100 = High intent
- 40-69 = Medium intent  
- 0-39 = Low intent

## Testing

Run tests:
```bash
npm test
```

## Docker

Build and run with Docker:
```bash
docker build -t lead-scoring-api .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key lead-scoring-api
```

Or use docker-compose:
```bash
docker-compose up
```

## Deployment

I have deployed using
- Railway 



## Files in this project

```
src/
├── app.js              # Main server file
├── routes/             # API endpoints
│   ├── offer.js        # Product/offer routes
│   ├── leads.js        # CSV upload routes
│   ├── score.js        # Scoring routes
│   └── results.js      # Results routes
└── services/           # Business logic
    ├── storage.js      # Simple data storage
    ├── aiService.js    # Google Gemini AI
    └── scoringService.js # Scoring logic
```

## Notes

- This uses in-memory storage (data is lost when server restarts)
- In production, you'd use a real database like MongoDB
- The AI service needs a valid Gemini API key
- CSV files are limited to 5MB
- All file uploads are cleaned up automatically

Made by Harshvardhan Singh
