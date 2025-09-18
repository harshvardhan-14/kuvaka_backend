const AIService = require('./aiService');

// scoring service - rules + ai added
class ScoringService {
  constructor() {
    this.aiService = new AIService();
    
    // decision makers get more points
    this.decisionMakerRoles = [
      'ceo', 'cto', 'cfo', 'cmo', 'president', 'founder',
      'head of', 'director', 'vp', 'manager', 'lead'
    ];
    
    // influencers get medium points
    this.influencerRoles = [
      'senior', 'specialist', 'analyst', 'coordinator'
    ];
    
    console.log('scoring service ready');
  }

  // score single lead
  async scoreLead(lead, offer) {
    try {
      // rule score (max 50)
      const ruleScore = this.calculateRuleScore(lead, offer);
      
      // ai score (max 50)
      const aiResult = await this.aiService.scoreLead(lead, offer);
      
      // final score
      const finalScore = ruleScore + aiResult.aiScore;
      
      // intent level
      const overallIntent = this.determineOverallIntent(finalScore);
      
      // reasoning
      const reasoning = this.createReasoning(ruleScore, aiResult, lead, offer);
      
      const result = {
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        location: lead.location,
        intent: overallIntent,
        score: finalScore,
        reasoning: reasoning,
        breakdown: {
          ruleScore: ruleScore,
          aiScore: aiResult.aiScore,
          aiIntent: aiResult.intent,
          aiReasoning: aiResult.reasoning
        }
      };
      
      console.log(`📊 Scored ${lead.name}: ${finalScore}/100 (${overallIntent})`);
      return result;
      
    } catch (error) {
      console.error(`Error scoring lead ${lead.name}:`, error);
      
      // Return fallback result
      return {
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        location: lead.location,
        intent: 'Low',
        score: 10,
        reasoning: 'Scoring failed due to technical error',
        breakdown: {
          ruleScore: 0,
          aiScore: 10,
          aiIntent: 'Low',
          aiReasoning: 'Scoring service error'
        }
      };
    }
  }

  /**
   * Calculate rule-based score for a lead
   * @param {Object} lead - The lead data
   * @param {Object} offer - The offer data
   * @returns {number} Rule-based score (0-50)
   */
  calculateRuleScore(lead, offer) {
    let score = 0;
    
    // Role relevance scoring (max 20 points)
    score += this.scoreRoleRelevance(lead.role);
    
    // Industry match scoring (max 20 points)
    score += this.scoreIndustryMatch(lead.industry, offer.ideal_use_cases);
    
    // Data completeness scoring (max 10 points)
    score += this.scoreDataCompleteness(lead);
    
    return Math.min(score, 50); // Cap at 50 points
  }

  /**
   * Score role relevance
   * @param {string} role - The lead's role
   * @returns {number} Role score (0-20)
   */
  scoreRoleRelevance(role) {
    if (!role) return 0;
    
    const lowerRole = role.toLowerCase();
    
    // Check for decision maker roles first (higher priority)
    for (const decisionRole of this.decisionMakerRoles) {
      if (lowerRole.includes(decisionRole)) {
        return 20; // Decision maker
      }
    }
    
    // Check for influencer roles (only if not already a decision maker)
    for (const influencerRole of this.influencerRoles) {
      if (lowerRole.includes(influencerRole)) {
        return 10; // Influencer
      }
    }
    
    return 0; // Other roles
  }

  /**
   * Score industry match with ideal use cases
   * @param {string} industry - The lead's industry
   * @param {Array} idealUseCases - Array of ideal use cases
   * @returns {number} Industry score (0-20)
   */
  scoreIndustryMatch(industry, idealUseCases) {
    if (!industry || !idealUseCases || idealUseCases.length === 0) {
      return 0;
    }
    
    const lowerIndustry = industry.toLowerCase();
    
    // Check for exact matches
    for (const useCase of idealUseCases) {
      const lowerUseCase = useCase.toLowerCase();
      
      // Direct industry match
      if (lowerUseCase.includes(lowerIndustry) || lowerIndustry.includes(lowerUseCase)) {
        return 20; // Exact match
      }
      
      // Check for related industries
      if (this.isRelatedIndustry(lowerIndustry, lowerUseCase)) {
        return 10; // Adjacent match
      }
    }
    
    return 0; // No match
  }

  /**
   * Check if industries are related
   * @param {string} industry1 - First industry
   * @param {string} industry2 - Second industry
   * @returns {boolean} True if related
   */
  isRelatedIndustry(industry1, industry2) {
    // Define industry relationships
    const industryGroups = {
      'tech': ['software', 'saas', 'technology', 'it', 'digital', 'tech'],
      'saas': ['software', 'technology', 'tech', 'cloud', 'platform'],
      'b2b': ['enterprise', 'business', 'corporate', 'commercial'],
      'ecommerce': ['retail', 'online', 'marketplace', 'shopping'],
      'finance': ['fintech', 'banking', 'financial', 'payments'],
      'healthcare': ['medical', 'health', 'pharma', 'biotech'],
      'education': ['edtech', 'learning', 'training', 'academic']
    };
    
    for (const [group, keywords] of Object.entries(industryGroups)) {
      const industry1InGroup = keywords.some(keyword => industry1.includes(keyword));
      const industry2InGroup = keywords.some(keyword => industry2.includes(keyword));
      
      if (industry1InGroup && industry2InGroup) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Score data completeness
   * @param {Object} lead - The lead data
   * @returns {number} Completeness score (0-10)
   */
  scoreDataCompleteness(lead) {
    const requiredFields = ['name', 'role', 'company', 'industry', 'location'];
    let completedFields = 0;
    
    for (const field of requiredFields) {
      if (lead[field] && lead[field].trim() !== '') {
        completedFields++;
      }
    }
    
    // Calculate base score (max 10 points)
    const baseScore = Math.round((completedFields / requiredFields.length) * 10);
    
    // Bonus for LinkedIn bio (but cap at 10)
    if (lead.linkedin_bio && lead.linkedin_bio.trim() !== '') {
      return Math.min(baseScore + 1, 10);
    }
    
    return baseScore;
  }

  /**
   * Determine overall intent based on final score
   * @param {number} score - The final score
   * @returns {string} Intent level (High/Medium/Low)
   */
  determineOverallIntent(score) {
    if (score >= 70) {
      return 'High';
    } else if (score >= 40) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Create comprehensive reasoning for the score
   * @param {number} ruleScore - Rule-based score
   * @param {Object} aiResult - AI scoring result
   * @param {Object} lead - Lead data
   * @param {Object} offer - Offer data
   * @returns {string} Combined reasoning
   */
  createReasoning(ruleScore, aiResult, lead, offer) {
    const ruleReasoning = this.getRuleReasoning(ruleScore, lead, offer);
    const aiReasoning = aiResult.reasoning;
    
    return `${ruleReasoning} AI Analysis: ${aiReasoning}`;
  }

  /**
   * Get rule-based reasoning
   * @param {number} ruleScore - Rule-based score
   * @param {Object} lead - Lead data
   * @param {Object} offer - Offer data
   * @returns {string} Rule reasoning
   */
  getRuleReasoning(ruleScore, lead, offer) {
    const reasons = [];
    
    // Role reasoning
    const roleScore = this.scoreRoleRelevance(lead.role);
    if (roleScore === 20) {
      reasons.push('Decision maker role');
    } else if (roleScore === 10) {
      reasons.push('Influencer role');
    }
    
    // Industry reasoning
    const industryScore = this.scoreIndustryMatch(lead.industry, offer.ideal_use_cases);
    if (industryScore === 20) {
      reasons.push('Industry matches ICP');
    } else if (industryScore === 10) {
      reasons.push('Related industry');
    }
    
    // Data completeness reasoning
    const completenessScore = this.scoreDataCompleteness(lead);
    if (completenessScore >= 8) {
      reasons.push('Complete profile data');
    }
    
    if (reasons.length === 0) {
      return 'Limited profile information available. ';
    }
    
    return `Profile analysis: ${reasons.join(', ')}. `;
  }

  /**
   * Score multiple leads in batch
   * @param {Array} leads - Array of lead objects
   * @param {Object} offer - The offer data
   * @returns {Promise<Array>} Array of scoring results
   */
  async scoreLeads(leads, offer) {
    console.log(`📊 Starting batch scoring for ${leads.length} leads`);
    
    const results = [];
    
    // Process leads sequentially to avoid rate limiting
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      console.log(`Processing lead ${i + 1}/${leads.length}: ${lead.name}`);
      
      try {
        const result = await this.scoreLead(lead, offer);
        results.push(result);
        
        // Add small delay to avoid overwhelming the AI service
        if (i < leads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`Error processing lead ${lead.name}:`, error);
        
        // Add fallback result
        results.push({
          name: lead.name,
          role: lead.role,
          company: lead.company,
          industry: lead.industry,
          location: lead.location,
          intent: 'Low',
          score: 10,
          reasoning: 'Processing failed',
          breakdown: {
            ruleScore: 0,
            aiScore: 10,
            aiIntent: 'Low',
            aiReasoning: 'Processing error'
          }
        });
      }
    }
    
    console.log(`📊 Batch scoring completed: ${results.length} results`);
    return results;
  }
}

module.exports = ScoringService;
