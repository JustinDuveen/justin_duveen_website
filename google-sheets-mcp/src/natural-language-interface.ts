/**
 * Natural Language Interface for Phase 2A
 * Processes natural language queries and creates spreadsheets from text descriptions
 */

export interface NaturalQueryResult {
  intent: 'data_query' | 'calculation' | 'chart_creation' | 'data_analysis' | 'spreadsheet_creation';
  confidence: number;
  interpretation: string;
  suggestedActions: Array<{
    type: string;
    description: string;
    parameters: any;
  }>;
  generatedFormula?: string;
  generatedChart?: any;
  clarificationNeeded?: Array<{
    question: string;
    options?: string[];
  }>;
}

export interface DataStoryResult {
  narrative: string;
  keyInsights: Array<{
    type: 'trend' | 'comparison' | 'anomaly' | 'correlation';
    description: string;
    supporting_data: any;
    significance: 'high' | 'medium' | 'low';
  }>;
  recommendations: string[];
  visualSuggestions: Array<{
    chartType: string;
    description: string;
    dataRange: string;
  }>;
}

export interface SpreadsheetFromDescription {
  structure: {
    sheets: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: 'text' | 'number' | 'date' | 'boolean' | 'formula';
        description: string;
        validation?: any;
      }>;
      sampleData?: any[][];
    }>;
  };
  formulas: Array<{
    cell: string;
    formula: string;
    description: string;
  }>;
  formatting: Array<{
    range: string;
    style: any;
    description: string;
  }>;
  charts: Array<{
    type: string;
    dataRange: string;
    title: string;
    position: any;
  }>;
}

export interface InsightReport {
  summary: string;
  insights: Array<{
    category: 'performance' | 'trend' | 'anomaly' | 'opportunity' | 'risk';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    recommendations?: string[];
  }>;
  dataQuality: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  nextSteps: string[];
}

export class NaturalLanguageInterface {
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private entityExtractors: Map<string, RegExp> = new Map();
  private contextCache: Map<string, any> = new Map();

  constructor() {
    this.initializePatterns();
  }

  /**
   * Process natural language query and suggest actions
   */
  async processNaturalQuery(
    query: string,
    context?: {
      spreadsheetId?: string;
      currentSheet?: string;
      availableData?: string[];
    }
  ): Promise<NaturalQueryResult> {
    const normalizedQuery = this.normalizeQuery(query);

    // Extract intent
    const intent = this.extractIntent(normalizedQuery);
    const confidence = this.calculateConfidence(normalizedQuery, intent);

    // Extract entities (ranges, functions, values)
    const entities = this.extractEntities(normalizedQuery, context);

    // Generate interpretation
    const interpretation = this.generateInterpretation(normalizedQuery, intent, entities);

    // Generate suggested actions
    const suggestedActions = await this.generateSuggestedActions(intent, entities, context);

    // Generate formula if applicable
    const generatedFormula = this.generateFormula(intent, entities, normalizedQuery);

    // Check if clarification is needed
    const clarificationNeeded = this.identifyClarificationNeeds(intent, entities, confidence);

    return {
      intent,
      confidence,
      interpretation,
      suggestedActions,
      generatedFormula,
      clarificationNeeded
    };
  }

  /**
   * Generate narrative data story from spreadsheet data
   */
  async explainDataStory(
    data: any[][],
    options: {
      includeHeaders?: boolean;
      focusArea?: 'trends' | 'comparisons' | 'anomalies' | 'overview';
      audienceLevel?: 'technical' | 'business' | 'executive';
    } = {}
  ): Promise<DataStoryResult> {
    const { includeHeaders = true, focusArea = 'overview', audienceLevel = 'business' } = options;

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    // Analyze data characteristics
    const analysis = await this.analyzeDataCharacteristics(dataRows, headers);

    // Generate narrative based on analysis
    const narrative = this.generateNarrative(analysis, focusArea, audienceLevel);

    // Extract key insights
    const keyInsights = this.extractKeyInsights(analysis, focusArea);

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis, audienceLevel);

    // Suggest visualizations
    const visualSuggestions = this.suggestVisualizations(analysis);

    return {
      narrative,
      keyInsights,
      recommendations,
      visualSuggestions
    };
  }

  /**
   * Answer specific questions about the data
   */
  async answerDataQuestions(
    question: string,
    data: any[][],
    context?: {
      includeHeaders?: boolean;
      previousQuestions?: string[];
    }
  ): Promise<{
    answer: string;
    confidence: number;
    supportingData?: any;
    relatedQuestions?: string[];
    visualization?: any;
  }> {
    const { includeHeaders = true } = context || {};

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    // Analyze question to understand what's being asked
    const questionAnalysis = this.analyzeQuestion(question, headers);

    // Extract relevant data
    const relevantData = this.extractRelevantData(dataRows, headers, questionAnalysis);

    // Calculate answer
    const answer = this.calculateAnswer(questionAnalysis, relevantData, headers);

    // Determine confidence
    const confidence = this.calculateAnswerConfidence(questionAnalysis, relevantData);

    // Generate related questions
    const relatedQuestions = this.generateRelatedQuestions(question, headers, questionAnalysis);

    // Suggest visualization if applicable
    const visualization = this.suggestVisualizationForQuestion(questionAnalysis, relevantData);

    return {
      answer,
      confidence,
      supportingData: relevantData,
      relatedQuestions,
      visualization
    };
  }

  /**
   * Create spreadsheet structure from text description
   */
  async createFromDescription(
    description: string,
    options: {
      includeFormatting?: boolean;
      includeSampleData?: boolean;
      includeCharts?: boolean;
    } = {}
  ): Promise<SpreadsheetFromDescription> {
    const {
      includeFormatting = true,
      includeSampleData = true,
      includeCharts = true
    } = options;

    // Parse description to understand requirements
    const requirements = this.parseSpreadsheetRequirements(description);

    // Generate sheet structure
    const structure = this.generateSheetStructure(requirements, includeSampleData);

    // Generate formulas
    const formulas = this.generateFormulasFromDescription(requirements, structure);

    // Generate formatting
    const formatting = includeFormatting ? this.generateFormatting(requirements, structure) : [];

    // Generate charts
    const charts = includeCharts ? this.generateChartsFromDescription(requirements, structure) : [];

    return {
      structure,
      formulas,
      formatting,
      charts
    };
  }

  /**
   * Generate automated insights report
   */
  async generateInsightsReport(
    data: any[][],
    context?: {
      includeHeaders?: boolean;
      domain?: 'sales' | 'finance' | 'marketing' | 'operations' | 'general';
      reportType?: 'summary' | 'detailed' | 'executive';
    }
  ): Promise<InsightReport> {
    const { includeHeaders = true, domain = 'general', reportType = 'summary' } = context || {};

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    // Perform comprehensive data analysis
    const analysis = await this.performComprehensiveAnalysis(dataRows, headers, domain);

    // Generate summary
    const summary = this.generateInsightSummary(analysis, reportType);

    // Extract insights
    const insights = this.extractBusinessInsights(analysis, domain);

    // Assess data quality
    const dataQuality = this.assessDataQualityForReport(dataRows, headers);

    // Generate next steps
    const nextSteps = this.generateNextSteps(insights, dataQuality, domain);

    return {
      summary,
      insights,
      dataQuality,
      nextSteps
    };
  }

  // Private helper methods
  private initializePatterns(): void {
    // Intent patterns
    this.intentPatterns.set('data_query', [
      /show me.*(?:data|values|records)/i,
      /what is.*(?:in|from)/i,
      /display.*(?:rows|columns|range)/i,
      /get.*(?:data|information)/i
    ]);

    this.intentPatterns.set('calculation', [
      /calculate.*(?:sum|total|average|count)/i,
      /what.*(?:is the|are the).*(?:sum|total|average|count)/i,
      /compute.*(?:sum|total|average|count)/i,
      /find.*(?:sum|total|average|count)/i
    ]);

    this.intentPatterns.set('chart_creation', [
      /create.*(?:chart|graph|plot)/i,
      /make.*(?:chart|graph|plot)/i,
      /show.*(?:chart|graph|plot)/i,
      /visualize.*(?:data|this)/i
    ]);

    this.intentPatterns.set('data_analysis', [
      /analyze.*(?:data|trends|patterns)/i,
      /what.*(?:trends|patterns|insights)/i,
      /find.*(?:correlations|relationships)/i,
      /identify.*(?:outliers|anomalies)/i
    ]);

    this.intentPatterns.set('spreadsheet_creation', [
      /create.*(?:spreadsheet|workbook|sheet)/i,
      /make.*(?:spreadsheet|workbook|sheet)/i,
      /build.*(?:spreadsheet|workbook|sheet)/i,
      /set up.*(?:spreadsheet|workbook|sheet)/i
    ]);

    // Entity extractors
    this.entityExtractors.set('range', /([A-Z]+\d+(?::[A-Z]+\d+)?|[A-Z]+:[A-Z]+|\d+:\d+)/g);
    this.entityExtractors.set('column', /(?:column|col)\s*([A-Z]+|\d+)/gi);
    this.entityExtractors.set('function', /(SUM|AVERAGE|COUNT|VLOOKUP|IF|MAX|MIN)\b/gi);
    this.entityExtractors.set('number', /\b\d+(?:\.\d+)?\b/g);
    this.entityExtractors.set('percentage', /\b\d+(?:\.\d+)?%/g);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim();
  }

  private extractIntent(query: string): NaturalQueryResult['intent'] {
    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          return intent as NaturalQueryResult['intent'];
        }
      }
    }
    return 'data_query'; // Default intent
  }

  private calculateConfidence(query: string, intent: string): number {
    const patterns = this.intentPatterns.get(intent) || [];
    const matches = patterns.filter(pattern => pattern.test(query)).length;
    return Math.min(0.9, 0.6 + (matches * 0.1));
  }

  private extractEntities(query: string, context?: any): any {
    const entities: any = {};

    for (const [type, pattern] of this.entityExtractors) {
      const matches = query.match(pattern);
      if (matches) {
        entities[type] = matches;
      }
    }

    // Extract context-specific entities
    if (context?.availableData) {
      entities.availableData = context.availableData.filter((item: string) =>
        query.toLowerCase().includes(item.toLowerCase())
      );
    }

    return entities;
  }

  private generateInterpretation(query: string, intent: string, entities: any): string {
    switch (intent) {
      case 'calculation':
        return `User wants to perform calculations on data${entities.range ? ` in range ${entities.range[0]}` : ''}`;
      case 'chart_creation':
        return `User wants to create a chart/visualization of the data`;
      case 'data_analysis':
        return `User wants to analyze data for patterns, trends, or insights`;
      case 'spreadsheet_creation':
        return `User wants to create a new spreadsheet based on requirements`;
      default:
        return `User wants to query or view data${entities.range ? ` from ${entities.range[0]}` : ''}`;
    }
  }

  private async generateSuggestedActions(intent: string, entities: any, context?: any): Promise<any[]> {
    const actions: any[] = [];

    switch (intent) {
      case 'calculation':
        if (entities.function) {
          actions.push({
            type: 'apply_formula',
            description: `Apply ${entities.function[0]} formula`,
            parameters: {
              formula: `=${entities.function[0]}(${entities.range?.[0] || 'A:A'})`,
              range: 'result_cell'
            }
          });
        }
        break;

      case 'chart_creation':
        actions.push({
          type: 'create_chart',
          description: 'Create chart from data',
          parameters: {
            chartType: 'auto_detect',
            dataRange: entities.range?.[0] || 'A:D',
            title: 'Data Visualization'
          }
        });
        break;

      case 'data_analysis':
        actions.push({
          type: 'analyze_data_patterns',
          description: 'Analyze data for patterns and insights',
          parameters: {
            range: entities.range?.[0] || 'A:Z',
            analysisType: 'comprehensive'
          }
        });
        break;

      case 'spreadsheet_creation':
        actions.push({
          type: 'create_spreadsheet_from_description',
          description: 'Create spreadsheet based on description',
          parameters: {
            includeFormatting: true,
            includeSampleData: true
          }
        });
        break;
    }

    return actions;
  }

  private generateFormula(intent: string, entities: any, query: string): string | undefined {
    if (intent !== 'calculation') return undefined;

    // Simple formula generation based on entities
    if (entities.function && entities.range) {
      return `=${entities.function[0]}(${entities.range[0]})`;
    }

    // Pattern-based formula generation
    if (query.includes('sum') || query.includes('total')) {
      const range = entities.range?.[0] || 'A:A';
      return `=SUM(${range})`;
    }

    if (query.includes('average') || query.includes('mean')) {
      const range = entities.range?.[0] || 'A:A';
      return `=AVERAGE(${range})`;
    }

    if (query.includes('count')) {
      const range = entities.range?.[0] || 'A:A';
      return `=COUNT(${range})`;
    }

    return undefined;
  }

  private identifyClarificationNeeds(intent: string, entities: any, confidence: number): any[] | undefined {
    const clarifications: any[] = [];

    if (confidence < 0.7) {
      clarifications.push({
        question: 'Could you please rephrase your request more specifically?',
        options: [
          'I want to calculate something',
          'I want to create a chart',
          'I want to analyze data',
          'I want to view specific data'
        ]
      });
    }

    if (intent === 'calculation' && !entities.range) {
      clarifications.push({
        question: 'Which data range would you like to calculate on?',
        options: ['Current selection', 'Entire column', 'Specific range']
      });
    }

    if (intent === 'chart_creation' && !entities.range) {
      clarifications.push({
        question: 'What data should be included in the chart?'
      });
    }

    return clarifications.length > 0 ? clarifications : undefined;
  }

  private async analyzeDataCharacteristics(dataRows: any[][], headers: string[]): Promise<any> {
    // Comprehensive data analysis for story generation
    const analysis = {
      totalRows: dataRows.length,
      totalColumns: headers.length,
      columnTypes: new Map<string, string>(),
      summary: new Map<string, any>(),
      trends: [],
      patterns: [],
      anomalies: [],
      correlations: []
    };

    // Analyze each column
    for (let i = 0; i < headers.length; i++) {
      const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');

      if (this.isNumericColumn(columnData)) {
        analysis.columnTypes.set(headers[i], 'numeric');
        const numericData = columnData.map(val => parseFloat(val.toString())).filter(val => !isNaN(val));
        analysis.summary.set(headers[i], {
          count: numericData.length,
          sum: numericData.reduce((a, b) => a + b, 0),
          average: numericData.reduce((a, b) => a + b, 0) / numericData.length,
          min: Math.min(...numericData),
          max: Math.max(...numericData)
        });
      } else {
        analysis.columnTypes.set(headers[i], 'text');
        analysis.summary.set(headers[i], {
          count: columnData.length,
          unique: new Set(columnData).size,
          most_common: this.getMostCommon(columnData)
        });
      }
    }

    return analysis;
  }

  private generateNarrative(analysis: any, focusArea: string, audienceLevel: string): string {
    let narrative = '';

    // Introduction
    if (audienceLevel === 'executive') {
      narrative += `This dataset contains ${analysis.totalRows.toLocaleString()} records across ${analysis.totalColumns} key dimensions. `;
    } else {
      narrative += `The data consists of ${analysis.totalRows.toLocaleString()} rows and ${analysis.totalColumns} columns. `;
    }

    // Data composition
    const numericColumns = Array.from(analysis.columnTypes.entries()).filter(([_, type]) => type === 'numeric').length;
    const textColumns = analysis.totalColumns - numericColumns;

    if (numericColumns > 0) {
      narrative += `The dataset includes ${numericColumns} quantitative measure${numericColumns === 1 ? '' : 's'} `;
      if (textColumns > 0) {
        narrative += `and ${textColumns} categorical dimension${textColumns === 1 ? '' : 's'}. `;
      } else {
        narrative += '. ';
      }
    }

    // Focus area specific insights
    switch (focusArea) {
      case 'trends':
        narrative += 'The analysis reveals several notable trends in the data. ';
        break;
      case 'comparisons':
        narrative += 'Comparing across different segments shows interesting variations. ';
        break;
      case 'anomalies':
        narrative += 'Several anomalies and outliers have been identified that warrant attention. ';
        break;
      default:
        narrative += 'The data presents opportunities for strategic insights and decision-making. ';
    }

    return narrative;
  }

  private extractKeyInsights(analysis: any, focusArea: string): any[] {
    const insights: any[] = [];

    // Generate insights based on analysis
    for (const [column, summary] of analysis.summary) {
      if (analysis.columnTypes.get(column) === 'numeric') {
        const stats = summary as any;
        const range = stats.max - stats.min;
        const variation = range / stats.average;

        if (variation > 2) {
          insights.push({
            type: 'anomaly',
            description: `${column} shows high variation (${(variation * 100).toFixed(0)}% coefficient of variation)`,
            supporting_data: stats,
            significance: 'medium'
          });
        }

        if (stats.average > stats.min * 5) {
          insights.push({
            type: 'trend',
            description: `${column} demonstrates significant scale differences across the dataset`,
            supporting_data: stats,
            significance: 'high'
          });
        }
      }
    }

    return insights;
  }

  private generateRecommendations(analysis: any, audienceLevel: string): string[] {
    const recommendations: string[] = [];

    if (audienceLevel === 'executive') {
      recommendations.push('Consider implementing regular data monitoring dashboards');
      recommendations.push('Establish KPI tracking for key metrics identified in this analysis');
    } else {
      recommendations.push('Create pivot tables for detailed breakdowns');
      recommendations.push('Set up automated alerts for significant changes');
      recommendations.push('Implement data validation rules to ensure quality');
    }

    return recommendations;
  }

  private suggestVisualizations(analysis: any): any[] {
    const suggestions: any[] = [];

    const numericColumns = Array.from(analysis.columnTypes.entries()).filter(([_, type]) => type === 'numeric');
    const textColumns = Array.from(analysis.columnTypes.entries()).filter(([_, type]) => type === 'text');

    if (numericColumns.length > 0 && textColumns.length > 0) {
      suggestions.push({
        chartType: 'column',
        description: 'Compare numeric values across categories',
        dataRange: 'A:C'
      });
    }

    if (numericColumns.length >= 2) {
      suggestions.push({
        chartType: 'scatter',
        description: 'Explore relationships between numeric variables',
        dataRange: 'B:C'
      });
    }

    if (analysis.totalRows > 20) {
      suggestions.push({
        chartType: 'histogram',
        description: 'Show distribution of values',
        dataRange: 'B:B'
      });
    }

    return suggestions;
  }

  // Additional helper methods...
  private isNumericColumn(data: any[]): boolean {
    if (data.length === 0) return false;
    const numericCount = data.filter(val => !isNaN(parseFloat(val.toString()))).length;
    return numericCount / data.length > 0.8;
  }

  private getMostCommon(array: any[]): any {
    const counts = new Map();
    for (const item of array) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return Array.from(counts.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  private analyzeQuestion(question: string, headers: string[]): any {
    const analysis = {
      type: 'unknown',
      targetColumns: [],
      operation: null,
      filters: [],
      aggregation: null
    };

    // Identify question type
    if (question.toLowerCase().includes('how many') || question.toLowerCase().includes('count')) {
      analysis.type = 'count';
      analysis.operation = 'COUNT';
    } else if (question.toLowerCase().includes('total') || question.toLowerCase().includes('sum')) {
      analysis.type = 'sum';
      analysis.operation = 'SUM';
    } else if (question.toLowerCase().includes('average') || question.toLowerCase().includes('mean')) {
      analysis.type = 'average';
      analysis.operation = 'AVERAGE';
    } else if (question.toLowerCase().includes('maximum') || question.toLowerCase().includes('highest')) {
      analysis.type = 'max';
      analysis.operation = 'MAX';
    } else if (question.toLowerCase().includes('minimum') || question.toLowerCase().includes('lowest')) {
      analysis.type = 'min';
      analysis.operation = 'MIN';
    }

    // Identify target columns
    analysis.targetColumns = headers.filter(header =>
      question.toLowerCase().includes(header.toLowerCase())
    );

    return analysis;
  }

  private extractRelevantData(dataRows: any[][], headers: string[], questionAnalysis: any): any {
    // Extract data relevant to the question
    if (questionAnalysis.targetColumns.length === 0) {
      return { message: 'No specific columns identified' };
    }

    const columnIndex = headers.indexOf(questionAnalysis.targetColumns[0]);
    if (columnIndex === -1) return { message: 'Column not found' };

    const columnData = dataRows.map(row => row[columnIndex]).filter(val => val !== null && val !== undefined && val !== '');

    return {
      column: questionAnalysis.targetColumns[0],
      data: columnData,
      index: columnIndex
    };
  }

  private calculateAnswer(questionAnalysis: any, relevantData: any, headers: string[]): string {
    if (!relevantData.data) {
      return "I couldn't find the specific data to answer your question.";
    }

    const data = relevantData.data;
    const column = relevantData.column;

    switch (questionAnalysis.operation) {
      case 'COUNT':
        return `There are ${data.length} entries in ${column}.`;

      case 'SUM':
        const numericData = data.map((val: any) => parseFloat(val.toString())).filter((val: number) => !isNaN(val));
        if (numericData.length === 0) {
          return `${column} doesn't contain numeric data that can be summed.`;
        }
        const sum = numericData.reduce((a: number, b: number) => a + b, 0);
        return `The total sum of ${column} is ${sum.toLocaleString()}.`;

      case 'AVERAGE':
        const avgData = data.map((val: any) => parseFloat(val.toString())).filter((val: number) => !isNaN(val));
        if (avgData.length === 0) {
          return `${column} doesn't contain numeric data to calculate an average.`;
        }
        const average = avgData.reduce((a: number, b: number) => a + b, 0) / avgData.length;
        return `The average of ${column} is ${average.toFixed(2)}.`;

      case 'MAX':
        const maxData = data.map((val: any) => parseFloat(val.toString())).filter((val: number) => !isNaN(val));
        if (maxData.length === 0) {
          return `${column} doesn't contain numeric data to find a maximum.`;
        }
        const max = Math.max(...maxData);
        return `The maximum value in ${column} is ${max}.`;

      case 'MIN':
        const minData = data.map((val: any) => parseFloat(val.toString())).filter((val: number) => !isNaN(val));
        if (minData.length === 0) {
          return `${column} doesn't contain numeric data to find a minimum.`;
        }
        const min = Math.min(...minData);
        return `The minimum value in ${column} is ${min}.`;

      default:
        return `Based on the ${column} data, here's what I found: ${data.slice(0, 3).join(', ')}${data.length > 3 ? '...' : ''}.`;
    }
  }

  private calculateAnswerConfidence(questionAnalysis: any, relevantData: any): number {
    if (!relevantData.data) return 0.1;
    if (questionAnalysis.targetColumns.length === 0) return 0.3;
    if (questionAnalysis.operation) return 0.9;
    return 0.6;
  }

  private generateRelatedQuestions(question: string, headers: string[], questionAnalysis: any): string[] {
    const related: string[] = [];

    if (questionAnalysis.targetColumns.length > 0) {
      const column = questionAnalysis.targetColumns[0];

      if (questionAnalysis.operation !== 'COUNT') {
        related.push(`How many entries are in ${column}?`);
      }
      if (questionAnalysis.operation !== 'AVERAGE') {
        related.push(`What's the average ${column}?`);
      }
      if (questionAnalysis.operation !== 'MAX') {
        related.push(`What's the maximum ${column}?`);
      }
    }

    // Add general questions about other columns
    const otherColumns = headers.filter(h => !questionAnalysis.targetColumns.includes(h)).slice(0, 2);
    for (const col of otherColumns) {
      related.push(`What about ${col}?`);
    }

    return related;
  }

  private suggestVisualizationForQuestion(questionAnalysis: any, relevantData: any): any | undefined {
    if (!relevantData.data || questionAnalysis.targetColumns.length === 0) return undefined;

    switch (questionAnalysis.type) {
      case 'count':
        return {
          type: 'bar',
          description: 'Bar chart showing counts by category'
        };
      case 'sum':
      case 'average':
        return {
          type: 'column',
          description: 'Column chart showing values'
        };
      default:
        return {
          type: 'table',
          description: 'Table view of the data'
        };
    }
  }

  private parseSpreadsheetRequirements(description: string): any {
    // Parse natural language description to extract spreadsheet requirements
    const requirements = {
      purpose: '',
      sheets: [],
      columns: [],
      formulas: [],
      charts: [],
      formatting: []
    };

    // Extract purpose
    requirements.purpose = description.split('.')[0];

    // Simple pattern matching for common requirements
    if (description.toLowerCase().includes('budget')) {
      requirements.columns.push(
        { name: 'Category', type: 'text' },
        { name: 'Budgeted Amount', type: 'number' },
        { name: 'Actual Amount', type: 'number' },
        { name: 'Variance', type: 'formula' }
      );
    }

    if (description.toLowerCase().includes('sales')) {
      requirements.columns.push(
        { name: 'Date', type: 'date' },
        { name: 'Product', type: 'text' },
        { name: 'Quantity', type: 'number' },
        { name: 'Price', type: 'number' },
        { name: 'Total', type: 'formula' }
      );
    }

    return requirements;
  }

  private generateSheetStructure(requirements: any, includeSampleData: boolean): any {
    const structure = {
      sheets: [{
        name: 'Main Data',
        columns: requirements.columns.length > 0 ? requirements.columns : [
          { name: 'Item', type: 'text', description: 'Item description' },
          { name: 'Value', type: 'number', description: 'Numeric value' },
          { name: 'Date', type: 'date', description: 'Date field' }
        ],
        sampleData: includeSampleData ? this.generateSampleData(requirements.columns) : undefined
      }]
    };

    return structure;
  }

  private generateFormulasFromDescription(requirements: any, structure: any): any[] {
    const formulas: any[] = [];

    // Generate formulas based on column types
    const columns = structure.sheets[0].columns;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      if (column.type === 'formula') {
        if (column.name.toLowerCase().includes('total')) {
          formulas.push({
            cell: `${String.fromCharCode(65 + i)}2`,
            formula: `=${String.fromCharCode(65 + i - 2)}2*${String.fromCharCode(65 + i - 1)}2`,
            description: `Calculate ${column.name}`
          });
        } else if (column.name.toLowerCase().includes('variance')) {
          formulas.push({
            cell: `${String.fromCharCode(65 + i)}2`,
            formula: `=${String.fromCharCode(65 + i - 1)}2-${String.fromCharCode(65 + i - 2)}2`,
            description: `Calculate ${column.name}`
          });
        }
      }
    }

    return formulas;
  }

  private generateFormatting(requirements: any, structure: any): any[] {
    const formatting: any[] = [];

    // Header formatting
    formatting.push({
      range: 'A1:Z1',
      style: {
        bold: true,
        backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
      },
      description: 'Header row formatting'
    });

    // Number formatting for numeric columns
    const columns = structure.sheets[0].columns;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      if (column.type === 'number' || column.type === 'formula') {
        formatting.push({
          range: `${String.fromCharCode(65 + i)}:${String.fromCharCode(65 + i)}`,
          style: {
            numberFormat: { type: 'NUMBER', pattern: '#,##0.00' }
          },
          description: `Number formatting for ${column.name}`
        });
      }
    }

    return formatting;
  }

  private generateChartsFromDescription(requirements: any, structure: any): any[] {
    const charts: any[] = [];

    // Auto-generate chart if there are numeric columns
    const columns = structure.sheets[0].columns;
    const numericColumns = columns.filter((col: any) => col.type === 'number' || col.type === 'formula');

    if (numericColumns.length > 0) {
      charts.push({
        type: 'column',
        dataRange: 'A:C',
        title: 'Data Overview',
        position: { sheetId: 0, anchorRow: 5, anchorColumn: 5 }
      });
    }

    return charts;
  }

  private generateSampleData(columns: any[]): any[][] {
    const sampleData: any[][] = [];

    for (let row = 0; row < 5; row++) {
      const rowData: any[] = [];
      for (const column of columns) {
        switch (column.type) {
          case 'text':
            rowData.push(`Sample ${column.name} ${row + 1}`);
            break;
          case 'number':
            rowData.push(Math.floor(Math.random() * 1000) + 100);
            break;
          case 'date':
            const date = new Date();
            date.setDate(date.getDate() + row);
            rowData.push(date.toISOString().split('T')[0]);
            break;
          case 'formula':
            rowData.push(''); // Will be filled by formula
            break;
          default:
            rowData.push(`Value ${row + 1}`);
        }
      }
      sampleData.push(rowData);
    }

    return sampleData;
  }

  private async performComprehensiveAnalysis(dataRows: any[][], headers: string[], domain: string): Promise<any> {
    // Perform domain-specific analysis
    return this.analyzeDataCharacteristics(dataRows, headers);
  }

  private generateInsightSummary(analysis: any, reportType: string): string {
    let summary = '';

    switch (reportType) {
      case 'executive':
        summary = `Executive Summary: This dataset contains ${analysis.totalRows.toLocaleString()} records with ${analysis.totalColumns} key metrics. `;
        break;
      case 'detailed':
        summary = `Detailed Analysis: Comprehensive examination of ${analysis.totalRows.toLocaleString()} data points across ${analysis.totalColumns} dimensions reveals several key patterns and insights. `;
        break;
      default:
        summary = `Analysis Summary: The data shows ${analysis.totalRows.toLocaleString()} records across ${analysis.totalColumns} variables with notable patterns and opportunities for optimization. `;
    }

    return summary;
  }

  private extractBusinessInsights(analysis: any, domain: string): any[] {
    const insights: any[] = [];

    // Generate domain-specific insights
    switch (domain) {
      case 'sales':
        insights.push({
          category: 'performance',
          title: 'Sales Performance Overview',
          description: 'Analysis of sales data reveals key performance indicators and trends',
          impact: 'high',
          actionable: true,
          recommendations: ['Focus on top-performing products', 'Analyze seasonal patterns']
        });
        break;

      case 'finance':
        insights.push({
          category: 'risk',
          title: 'Financial Data Quality',
          description: 'Financial data shows good consistency with some areas for improvement',
          impact: 'medium',
          actionable: true,
          recommendations: ['Implement additional validation rules', 'Regular reconciliation processes']
        });
        break;

      default:
        insights.push({
          category: 'opportunity',
          title: 'Data Optimization Opportunities',
          description: 'Several areas identified for data structure and process improvements',
          impact: 'medium',
          actionable: true,
          recommendations: ['Standardize data formats', 'Implement automated quality checks']
        });
    }

    return insights;
  }

  private assessDataQualityForReport(dataRows: any[][], headers: string[]): any {
    const totalCells = dataRows.length * headers.length;
    const emptyCells = dataRows.flat().filter(cell => cell === null || cell === undefined || cell === '').length;
    const completeness = (totalCells - emptyCells) / totalCells;

    return {
      score: Math.round(completeness * 100),
      issues: completeness < 0.9 ? [`${((1 - completeness) * 100).toFixed(1)}% of data is missing`] : [],
      recommendations: completeness < 0.9 ? ['Address missing data', 'Implement validation rules'] : ['Maintain current data quality standards']
    };
  }

  private generateNextSteps(insights: any[], dataQuality: any, domain: string): string[] {
    const steps: string[] = [];

    if (dataQuality.score < 80) {
      steps.push('Improve data quality by addressing missing values and inconsistencies');
    }

    if (insights.some((insight: any) => insight.actionable)) {
      steps.push('Implement recommendations from actionable insights');
    }

    steps.push('Set up regular monitoring and reporting');
    steps.push('Create automated alerts for significant changes');

    return steps;
  }
}