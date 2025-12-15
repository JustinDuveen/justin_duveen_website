#!/usr/bin/env node

import { Agent } from '@anthropic-ai/claude-agent-sdk';
import dotenv from 'dotenv';
import { BusinessContext, BusinessModel, ModelingResult, ModelStructure } from './types.js';
import { FinancialModelingWorkflows } from './workflows.js';
import { BusinessModelValidator } from './validators.js';
import { WebSearchOrchestrator, MarketResearchResult } from './web-search-orchestrator.js';

dotenv.config();

export class FinancialModelingAgent {
  private agent: Agent;
  private context: BusinessContext | null = null;
  private webSearchOrchestrator: WebSearchOrchestrator;
  private marketResearch: MarketResearchResult | null = null;

  constructor() {
    this.agent = new Agent({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // Use project-level settings that include our optimized system prompt
      settingSources: ['project'],
      // Explicitly allow only our financial modeling tools
      allowedTools: [
        'get_spreadsheet_info',
        'create_sheet',
        'read_range',
        'write_range',
        'append_data',
        'batch_update',
        'analyze_data_patterns',
        'suggest_data_insights',
        'detect_anomalies',
        'predict_trends',
        'classify_data_quality',
        'generate_summary_report',
        'suggest_formulas',
        'apply_formula',
        'validate_formula',
        'optimize_formula',
        'create_advanced_chart',
        'create_pivot_table',
        'format_cells',
        'add_conditional_formatting',
        // Web search tools for sub-agents
        'WebFetch',
        'WebSearch'
      ]
    });

    this.webSearchOrchestrator = new WebSearchOrchestrator();
  }

  async buildFinancialModel(userInput: string, existingSpreadsheetId?: string): Promise<ModelingResult> {
    console.log('🚀 Starting Financial Model Build Process...');

    // Step 1: Detect business model and gather context
    const businessModel = BusinessModelValidator.detectBusinessModel(userInput);
    console.log(`📊 Detected business model: ${businessModel}`);

    // If business model is unknown, ask clarifying questions
    if (businessModel === 'unknown') {
      const questions = BusinessModelValidator.getClarifyingQuestions('unknown');
      throw new Error(`I need more information to build your model. Please answer these questions:\n${questions.join('\n')}`);
    }

    // Step 2: Create or access spreadsheet
    let spreadsheetId: string;
    let modelStructure: ModelStructure;

    if (existingSpreadsheetId) {
      spreadsheetId = existingSpreadsheetId;
      // Get existing sheet info
      const sheetInfo = await this.agent.callTool('get_spreadsheet_info', {
        spreadsheetId: existingSpreadsheetId
      });
      console.log('📋 Using existing spreadsheet:', sheetInfo.title);

      // Map existing sheets or create structure
      modelStructure = await this.ensureModelStructure(spreadsheetId, sheetInfo);
    } else {
      // Create new spreadsheet with proper structure
      const newSheet = await this.agent.callTool('create_sheet', {
        title: `Financial Model - ${businessModel.toUpperCase()}`,
        rowCount: 1000,
        columnCount: 26
      });
      spreadsheetId = newSheet.spreadsheetId;
      console.log('📊 Created new spreadsheet:', spreadsheetId);

      // Create the full model structure
      modelStructure = await this.createModelStructure(spreadsheetId, businessModel);
    }

    // Step 3: Build context from user input (would normally involve more interactive questioning)
    this.context = this.parseBusinessContext(userInput, businessModel);

    // Step 3.5: Strategic market research (if beneficial)
    if (WebSearchOrchestrator.shouldUseWebSearch(this.context, 'new')) {
      console.log('🔍 Conducting strategic market research...');
      await this.conductMarketResearch('new_model_intelligence');
    }

    // Step 4: Execute financial modeling workflow
    const result = await this.executeModelingWorkflow(spreadsheetId, modelStructure);

    console.log('✅ Financial model completed successfully!');
    return result;
  }

  private async createModelStructure(spreadsheetId: string, businessModel: BusinessModel): Promise<ModelStructure> {
    console.log('🏗️ Creating model structure...');

    const structureWorkflow = FinancialModelingWorkflows.getModelStructureWorkflow(this.context!);

    // Execute each step to create sheets
    for (const step of structureWorkflow) {
      console.log(`📝 ${step.description}`);
      for (const toolCall of step.tools) {
        await this.agent.callTool(toolCall.tool, {
          ...toolCall.parameters,
          spreadsheetId
        });
      }
    }

    // Return structure mapping (assuming sequential sheet IDs)
    return {
      spreadsheetId,
      sheets: {
        assumptions: 1,
        projections: 2,
        dashboard: 3,
        scenarios: 4
      }
    };
  }

  private async ensureModelStructure(spreadsheetId: string, sheetInfo: any): Promise<ModelStructure> {
    // Check if required sheets exist, create if missing
    const requiredSheets = ['Assumptions', 'Projections', 'Dashboard', 'Scenarios'];
    const existingSheets = sheetInfo.sheets?.map((s: any) => s.properties.title) || [];

    const structure: ModelStructure = {
      spreadsheetId,
      sheets: { assumptions: 0, projections: 1, dashboard: 2, scenarios: 3 }
    };

    for (const sheetName of requiredSheets) {
      if (!existingSheets.includes(sheetName)) {
        console.log(`📝 Creating missing sheet: ${sheetName}`);
        await this.agent.callTool('create_sheet', {
          spreadsheetId,
          title: sheetName,
          rowCount: sheetName === 'Projections' ? 200 : 100,
          columnCount: sheetName === 'Projections' ? 15 : 10
        });
      }
    }

    return structure;
  }

  private async executeModelingWorkflow(spreadsheetId: string, structure: ModelStructure): Promise<ModelingResult> {
    console.log('🔧 Executing financial modeling workflow...');

    // Phase 1: Build revenue model
    console.log('💰 Building revenue model...');
    const revenueWorkflow = FinancialModelingWorkflows.getRevenueModelWorkflow(this.context!, spreadsheetId);
    await this.executeWorkflowSteps(revenueWorkflow);

    // Phase 2: Analysis and insights
    console.log('📈 Analyzing data and generating insights...');
    const analysisWorkflow = FinancialModelingWorkflows.getAnalysisWorkflow(this.context!, spreadsheetId);
    const analysisResults = await this.executeWorkflowSteps(analysisWorkflow);

    // Phase 3: Visualization
    console.log('📊 Creating visualizations...');
    const vizWorkflow = FinancialModelingWorkflows.getVisualizationWorkflow(this.context!, spreadsheetId);
    await this.executeWorkflowSteps(vizWorkflow);

    // Phase 4: Validation and red flag detection
    console.log('🔍 Validating unit economics...');
    const baseRedFlags = BusinessModelValidator.validateUnitEconomics(this.context!);
    const redFlags = this.enhanceValidationWithMarketData(baseRedFlags);

    // Phase 5: Generate insights and narrative
    const baseInsights = BusinessModelValidator.generateBusinessInsights(this.context!);
    const insights = this.generateEnhancedInsights(baseInsights);
    const narrative = BusinessModelValidator.generateInvestorNarrative(this.context!);

    // Generate final summary report
    const summaryReport = await this.agent.callTool('generate_summary_report', {
      spreadsheetId,
      range: 'Dashboard!A1:Z50',
      reportType: 'executive_summary',
      includeInsights: true
    });

    return {
      context: this.context!,
      structure,
      insights: [...insights, ...(summaryReport.insights || [])],
      redFlags,
      investorNarrative: narrative,
      nextSteps: [
        'Review and validate assumptions in the Assumptions tab',
        'Test scenarios using the Scenarios tab',
        redFlags.length > 0 ? 'Address red flags before investor presentations' : 'Model is investor-ready',
        'Practice explaining your unit economics story'
      ]
    };
  }

  private async executeWorkflowSteps(workflow: any[]): Promise<any[]> {
    const results = [];

    for (const step of workflow) {
      console.log(`  ⚡ ${step.description}`);

      for (const toolCall of step.tools) {
        try {
          const result = await this.agent.callTool(toolCall.tool, toolCall.parameters);
          results.push(result);

          // Validate if step has validation function
          if (step.validation && !step.validation(result)) {
            console.warn(`  ⚠️ Step validation failed for ${step.name}`);
          }
        } catch (error) {
          console.error(`  ❌ Error in ${toolCall.tool}:`, error);
          throw error;
        }
      }
    }

    return results;
  }

  private parseBusinessContext(userInput: string, businessModel: BusinessModel): BusinessContext {
    // This would normally involve more sophisticated parsing or interactive questioning
    // For demo purposes, using sensible defaults based on business model

    const baseContext: BusinessContext = {
      model: businessModel,
      currentTraction: {
        revenue: 10000, // $10K/month baseline
        customers: 200,
        growthRate: 15 // 15% MoM
      },
      unitEconomics: {
        cac: 100,
        grossMargin: 70
      },
      fundraising: {
        stage: 'seed',
        burnRate: 25000,
        runway: 18,
        targetRaise: 500000
      }
    };

    // Business model specific adjustments
    switch (businessModel) {
      case 'saas':
        baseContext.unitEconomics = {
          ...baseContext.unitEconomics,
          churn: 5, // 5% monthly
          ltv: 1000
        };
        break;

      case 'marketplace':
        baseContext.unitEconomics = {
          ...baseContext.unitEconomics,
          takeRate: 15
        };
        break;

      case 'ecommerce':
        baseContext.unitEconomics = {
          ...baseContext.unitEconomics,
          aov: 75
        };
        break;
    }

    return baseContext;
  }

  /**
   * Conduct strategic market research using specialized sub-agents
   */
  private async conductMarketResearch(purpose: string): Promise<void> {
    if (!this.context) return;

    try {
      const researchPlan = WebSearchOrchestrator.generateResearchPlan(this.context, purpose);
      console.log(`📋 Research plan: ${researchPlan.specificQuestions.length} questions, max ${researchPlan.maxSearches} searches`);

      // Execute market research with cost controls
      this.marketResearch = await this.webSearchOrchestrator.executeMarketResearch(this.agent, researchPlan);

      console.log(`✅ Market research completed: ${this.marketResearch.dataQuality} quality data`);
      console.log(`💰 Search cost: ~$${(this.marketResearch.searchesUsed * 0.01).toFixed(3)} (${this.marketResearch.searchesUsed} searches)`);

      // Integrate insights into context
      this.integrateMarketResearch();

    } catch (error) {
      console.warn('⚠️ Market research failed, proceeding without:', error);
      this.marketResearch = null;
    }
  }

  /**
   * Integrate market research findings into business context
   */
  private integrateMarketResearch(): void {
    if (!this.marketResearch || !this.context) return;

    // Update context with market intelligence
    console.log('🧠 Integrating market intelligence into model...');

    // Add market context to insights
    if (this.marketResearch.benchmarkData) {
      console.log(`📊 Found benchmarks for: ${Object.keys(this.marketResearch.benchmarkData).join(', ')}`);
    }

    if (this.marketResearch.competitiveIntelligence.length > 0) {
      console.log(`🎯 Competitive insights: ${this.marketResearch.competitiveIntelligence.length} items`);
    }
  }

  /**
   * Validate model against market benchmarks (called during analysis phase)
   */
  private enhanceValidationWithMarketData(baseRedFlags: any[]): any[] {
    if (!this.marketResearch || !this.context) return baseRedFlags;

    const enhancedFlags = [...baseRedFlags];

    // Add market-aware validation
    if (this.marketResearch.benchmarkData) {
      // Example: LTV:CAC market comparison
      if (this.context.unitEconomics.ltv && this.context.unitEconomics.cac) {
        const ratio = this.context.unitEconomics.ltv / this.context.unitEconomics.cac;
        const marketBenchmark = this.extractBenchmarkValue('ltv:cac', this.marketResearch.benchmarkData);

        if (marketBenchmark && ratio < marketBenchmark * 0.8) {
          enhancedFlags.push({
            metric: 'LTV:CAC vs Market',
            value: ratio,
            threshold: marketBenchmark,
            severity: 'warning' as const,
            explanation: `Your LTV:CAC ratio (${ratio.toFixed(1)}x) is below market standards (${marketBenchmark}x)`,
            recommendation: 'Focus on improving customer lifetime value or reducing acquisition costs to meet market expectations'
          });
        }
      }
    }

    return enhancedFlags;
  }

  /**
   * Generate enhanced insights including market intelligence
   */
  private generateEnhancedInsights(baseInsights: string[]): string[] {
    if (!this.marketResearch) return baseInsights;

    const enhancedInsights = [...baseInsights];

    // Add market context insights
    if (this.marketResearch.actionableInsights.length > 0) {
      enhancedInsights.push('**Market Intelligence**:');
      enhancedInsights.push(...this.marketResearch.actionableInsights.slice(0, 3));
    }

    // Add competitive positioning
    if (this.marketResearch.competitiveIntelligence.length > 0) {
      enhancedInsights.push('**Competitive Position**:');
      enhancedInsights.push(this.marketResearch.competitiveIntelligence[0]); // Top insight
    }

    return enhancedInsights;
  }

  /**
   * Extract benchmark value from market research data
   */
  private extractBenchmarkValue(metricName: string, benchmarkData: Record<string, any>): number | null {
    const value = benchmarkData[metricName.toLowerCase()];
    if (!value) return null;

    // Parse value like "3-5x" to get midpoint
    const match = value.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  // Interactive chat interface
  async chat(message: string): Promise<string> {
    try {
      const response = await this.agent.chat(message);
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      return `I encountered an error: ${error}. Please try rephrasing your question or request.`;
    }
  }
}

// CLI interface for testing
async function main() {
  const agent = new FinancialModelingAgent();

  const testInput = "I'm building a SaaS company with subscription pricing. We have 500 customers paying $50/month, growing 10% monthly. Our CAC is $120 and churn is 3% monthly.";

  try {
    console.log('🎯 Financial Modeling Agent - Demo\n');
    console.log('Input:', testInput);
    console.log('\n' + '='.repeat(50) + '\n');

    const result = await agent.buildFinancialModel(testInput);

    console.log('\n' + '='.repeat(50));
    console.log('📊 MODELING RESULTS');
    console.log('='.repeat(50));
    console.log('\n💡 Key Insights:');
    result.insights.forEach(insight => console.log(`  • ${insight}`));

    if (result.redFlags.length > 0) {
      console.log('\n🚨 Red Flags:');
      result.redFlags.forEach(flag => {
        console.log(`  ⚠️ ${flag.metric}: ${flag.value} (threshold: ${flag.threshold})`);
        console.log(`     ${flag.explanation}`);
        console.log(`     💡 ${flag.recommendation}\n`);
      });
    }

    console.log('\n📈 Investor Narrative:');
    console.log(`  "${result.investorNarrative}"`);

    console.log('\n✅ Next Steps:');
    result.nextSteps.forEach(step => console.log(`  • ${step}`));

    console.log(`\n🔗 Spreadsheet ID: ${result.structure.spreadsheetId}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FinancialModelingAgent;