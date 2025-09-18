const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
// ai service with gemini
class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('need GEMINI_API_KEY in .env');
    }
    // i have used gemini-1.5-flash model because gemini-1.5-pro is not available for free tier
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('ai service ready');
  }

  // score lead with ai
  async scoreLead(lead, offer) {
    try {
      const prompt = this.createScoringPrompt(lead, offer);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const aiResult = this.parseAIResponse(text);
      console.log(`ai scored ${lead.name}: ${aiResult.intent}`);
      return aiResult;
      
    } catch (error) {
      console.error('ai error:', error);
      return {
        intent: 'Low',
        reasoning: 'ai failed, using low score',
        aiScore: 10
      };
    }
  }

  // create prompt for ai
  createScoringPrompt(lead, offer) {
    return `
Analyze this lead's buying intent for the product.

PRODUCT: ${offer.name}
Value: ${offer.value_props.join(', ')}
Target: ${offer.ideal_use_cases.join(', ')}

LEAD:
Name: ${lead.name}
Role: ${lead.role}
Company: ${lead.company}
Industry: ${lead.industry}
Location: ${lead.location}
Bio: ${lead.linkedin_bio || 'Not provided'}

Rate their buying intent as High, Medium, or Low.

Respond with JSON only:
{
  "intent": "High|Medium|Low",
  "reasoning": "1-2 sentence explanation"
}
`;
  }

  // parse ai response
  parseAIResponse(responseText) {
    try {
      const cleanText = responseText.trim();
      let jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('no json found');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.intent || !parsed.reasoning) {
        throw new Error('invalid response');
      }
      
      const validIntents = ['High', 'Medium', 'Low'];
      if (!validIntents.includes(parsed.intent)) {
        throw new Error('invalid intent');
      }
      
      const intentScores = {
        'High': 50,
        'Medium': 30,
        'Low': 10
      };
      
      return {
        intent: parsed.intent,
        reasoning: parsed.reasoning,
        aiScore: intentScores[parsed.intent]
      };
      
    } catch (error) {
      console.error('parse error:', error);
      
      // fallback
      const lowerText = responseText.toLowerCase();
      let intent = 'Low';
      
      if (lowerText.includes('high') || lowerText.includes('strong')) {
        intent = 'High';
      } else if (lowerText.includes('medium') || lowerText.includes('moderate')) {
        intent = 'Medium';
      }
      
      return {
        intent: intent,
        reasoning: 'ai parsing failed, using fallback',
        aiScore: intent === 'High' ? 50 : intent === 'Medium' ? 30 : 10
      };
    }
  }

}

module.exports = AIService;
