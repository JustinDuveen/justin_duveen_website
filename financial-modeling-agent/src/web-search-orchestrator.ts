import { BusinessContext, BusinessModel } from './types.js';

export interface MarketResearchRequest {
  businessModel: BusinessModel;
  specificQuestions: string[];
  researchType: 'benchmarks' | 'competitive' | 'investment_trends' | 'market_validation';
  urgency: 'high' | 'medium' | 'low';
  maxSearches?: number;
}

export interface MarketResearchResult {
  industryContext: string;
  benchmarkData: Record<string, any>;
  competitiveIntelligence: string[];
  investmentPerspective: string;
  actionableInsights: string[];
  searchesUsed: number;
  dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient';
  needsMoreResearch: boolean;
}

export class WebSearchOrchestrator {
  private searchCount = 0;
  private maxSearchesPerSession = 5;

  /**
   * Determine if web search is needed for the financial model
   */
  static shouldUseWebSearch(context: BusinessContext, modelType: 'new' | 'validation' | 'benchmark'): boolean {
    // Only use web search for:
    // 1. Benchmark validation (always valuable)
    // 2. New models for competitive companies (Series A+)
    // 3. When specific flags indicate market research would help

    switch (modelType) {
      case 'benchmark':
        return true; // Always valuable for benchmarking

      case 'validation':
        // Use for validation if we have specific concerns
        return context.fundraising.stage === 'series-a' ||
               context.fundraising.stage === 'series-b+';

      case 'new':
        // Use for new models if it's a competitive market or later stage
        return context.fundraising.stage !== 'pre-seed' &&
               context.currentTraction.revenue && context.currentTraction.revenue > 5000;

      default:
        return false;
    }
  }

  /**
   * Generate strategic research plan
   */
  static generateResearchPlan(context: BusinessContext, purpose: string): MarketResearchRequest {
    const baseRequest: MarketResearchRequest = {
      businessModel: context.model,
      specificQuestions: [],
      researchType: 'benchmarks',
      urgency: 'medium',
      maxSearches: 5
    };

    // Customize based on business model and purpose
    switch (context.model) {
      case 'saas':
        baseRequest.specificQuestions = [
          'Current SaaS industry churn benchmarks for our revenue stage',
          'LTV:CAC ratios for Series A SaaS companies',
          'SaaS magic number and Rule of 40 standards'
        ];
        break;

      case 'marketplace':
        baseRequest.specificQuestions = [
          'Marketplace take rate benchmarks by industry',
          'Two-sided network growth patterns and metrics',
          'Marketplace unit economics for Series A companies'
        ];
        break;

      case 'ecommerce':
        baseRequest.specificQuestions = [
          'eCommerce AOV and repeat purchase benchmarks',
          'Customer acquisition cost standards by channel',
          'eCommerce LTV and retention metrics'
        ];
        break;
    }

    // Adjust urgency based on fundraising timeline
    if (context.fundraising.runway && context.fundraising.runway < 12) {
      baseRequest.urgency = 'high';
    }

    return baseRequest;
  }

  /**
   * Execute market research with sub-agent
   */
  async executeMarketResearch(
    agent: any,
    request: MarketResearchRequest
  ): Promise<MarketResearchResult> {

    console.log(`🔍 Initiating market research: ${request.researchType} for ${request.businessModel}`);
    console.log(`📋 Questions: ${request.specificQuestions.slice(0, 2).join(', ')}${request.specificQuestions.length > 2 ? '...' : ''}`);

    try {
      // Call the market research specialist sub-agent
      const researchPrompt = this.buildResearchPrompt(request);

      const response = await agent.chat(researchPrompt);

      // Parse and structure the response
      const result = this.parseMarketResearchResponse(response, request);

      console.log(`✅ Market research completed: ${result.searchesUsed} searches used`);
      console.log(`📊 Data quality: ${result.dataQuality}`);

      return result;

    } catch (error) {
      console.error('❌ Market research failed:', error);

      // Return fallback result
      return {
        industryContext: 'Market research unavailable - proceeding with model assumptions',
        benchmarkData: {},
        competitiveIntelligence: [],
        investmentPerspective: 'Unable to fetch current investment trends',
        actionableInsights: ['Validate model assumptions manually', 'Consider industry reports'],
        searchesUsed: 0,
        dataQuality: 'insufficient',
        needsMoreResearch: false
      };
    }
  }

  /**
   * Build research prompt for sub-agent
   */
  private buildResearchPrompt(request: MarketResearchRequest): string {
    return `You are the Market Research Specialist. I need research on ${request.businessModel} business model.

**Research Type**: ${request.researchType}
**Urgency**: ${request.urgency}
**Max Searches**: ${request.maxSearches || 5}

**Specific Questions**:
${request.specificQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Requirements**:
- Use maximum ${request.maxSearches || 5} web searches
- Focus on 2025 data and recent industry reports
- Provide specific benchmarks with ranges
- Include competitive intelligence
- Give actionable insights for financial modeling

**After your searches**, please assess if you have sufficient information or need to search more.

Begin your research now.`;
  }

  /**
   * Parse market research response
   */
  private parseMarketResearchResponse(response: string, request: MarketResearchRequest): MarketResearchResult {
    // This would parse the actual response from the sub-agent
    // For now, returning a structured format based on the expected response

    const searchesUsed = this.estimateSearchesUsed(response);

    return {
      industryContext: this.extractSection(response, 'Industry Context') || 'Market context analysis completed',
      benchmarkData: this.extractBenchmarks(response),
      competitiveIntelligence: this.extractCompetitiveInsights(response),
      investmentPerspective: this.extractSection(response, 'Investment Perspective') || 'Investment analysis completed',
      actionableInsights: this.extractActionableInsights(response),
      searchesUsed,
      dataQuality: this.assessDataQuality(response, searchesUsed),
      needsMoreResearch: response.includes('need more research') || response.includes('insufficient data')
    };
  }

  /**
   * Determine when to call benchmark specialist vs market research specialist
   */
  static determineSpecialistType(context: BusinessContext, purpose: string): 'market-research' | 'benchmark' {
    // Use market research for broad questions
    if (purpose.includes('competitive') || purpose.includes('trends') || purpose.includes('market')) {
      return 'market-research';
    }

    // Use benchmark specialist for specific metric validation
    if (purpose.includes('benchmark') || purpose.includes('validate') || purpose.includes('compare')) {
      return 'benchmark';
    }

    // Default to market research for general intelligence
    return 'market-research';
  }

  // Helper methods for parsing response
  private extractSection(response: string, sectionName: string): string | null {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*[:\\s]*([^*]+)`, 'i');
    const match = response.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractBenchmarks(response: string): Record<string, any> {
    // Extract benchmark data from formatted response
    const benchmarks: Record<string, any> = {};

    // Look for metric patterns like "Churn: 2-5%", "LTV:CAC: 3-5x"
    const metricRegex = /(\w+(?:\:\w+)?)\s*:\s*([^,\n]+)/g;
    let match;

    while ((match = metricRegex.exec(response)) !== null) {
      benchmarks[match[1].toLowerCase()] = match[2].trim();
    }

    return benchmarks;
  }

  private extractCompetitiveInsights(response: string): string[] {
    const insights: string[] = [];

    // Look for competitive insights section
    const competitiveSection = this.extractSection(response, 'Competitive Intelligence');
    if (competitiveSection) {
      // Split by bullet points or numbered lists
      const items = competitiveSection.split(/[-•]\s*|\d+\.\s*/).filter(item => item.trim().length > 0);
      insights.push(...items.map(item => item.trim()));
    }

    return insights;
  }

  private extractActionableInsights(response: string): string[] {
    const insights: string[] = [];

    const insightsSection = this.extractSection(response, 'Actionable Insights');
    if (insightsSection) {
      const items = insightsSection.split(/[-•]\s*|\d+\.\s*/).filter(item => item.trim().length > 0);
      insights.push(...items.map(item => item.trim()));
    }

    return insights.length > 0 ? insights : ['Model appears competitive based on available data'];
  }

  private estimateSearchesUsed(response: string): number {
    // Estimate based on response content and mentions of searches
    const searchMentions = (response.match(/search|found|research/gi) || []).length;
    return Math.min(searchMentions / 3, 5); // Rough estimate, max 5
  }

  private assessDataQuality(response: string, searchesUsed: number): 'excellent' | 'good' | 'limited' | 'insufficient' {
    if (searchesUsed >= 4 && response.length > 1000) return 'excellent';
    if (searchesUsed >= 3 && response.length > 600) return 'good';
    if (searchesUsed >= 2 && response.length > 300) return 'limited';
    return 'insufficient';
  }
}