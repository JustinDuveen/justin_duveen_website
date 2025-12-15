/**
 * Intelligent Recommendations Engine for Phase 2A
 * Provides AI-powered suggestions for charts, pivot tables, formulas, and data organization
 */

export interface ChartRecommendation {
  chartType: 'COLUMN' | 'BAR' | 'LINE' | 'AREA' | 'PIE' | 'DONUT' | 'SCATTER' | 'COMBO' | 'HISTOGRAM' | 'BOX_PLOT';
  title: string;
  description: string;
  confidence: number;
  dataRange: string;
  reasoning: string;
  bestPractices: string[];
  configuration?: {
    xAxis?: string;
    yAxis?: string;
    series?: string[];
    groupBy?: string;
  };
}

export interface PivotTableRecommendation {
  rows: string[];
  columns: string[];
  values: Array<{
    field: string;
    aggregation: 'SUM' | 'COUNT' | 'AVERAGE' | 'MAX' | 'MIN' | 'MEDIAN';
  }>;
  filters?: string[];
  confidence: number;
  reasoning: string;
  businessValue: string;
}

export interface FormulaRecommendation {
  formula: string;
  description: string;
  category: 'calculation' | 'lookup' | 'conditional' | 'text' | 'date' | 'statistical';
  confidence: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  alternatives: string[];
  explanation: string;
  examples: string[];
}

export interface DataStructureRecommendation {
  improvement: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  steps: string[];
  benefits: string[];
}

export interface SummaryReport {
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  dataQuality: {
    score: number;
    issues: string[];
  };
  insights: Array<{
    type: 'trend' | 'pattern' | 'anomaly' | 'opportunity';
    description: string;
    significance: 'high' | 'medium' | 'low';
  }>;
}

export class IntelligentRecommendations {
  private dataPatterns: Map<string, any> = new Map();

  /**
   * Recommend optimal chart types based on data characteristics
   */
  async recommendChartType(
    data: any[][],
    options: {
      includeHeaders?: boolean;
      purpose?: 'comparison' | 'distribution' | 'relationship' | 'composition' | 'trend';
      targetAudience?: 'technical' | 'business' | 'executive';
    } = {}
  ): Promise<ChartRecommendation[]> {
    const { includeHeaders = true, purpose, targetAudience = 'business' } = options;
    const recommendations: ChartRecommendation[] = [];

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    // Analyze data characteristics
    const analysis = await this.analyzeDataForCharts(dataRows, headers);

    // Generate recommendations based on data characteristics
    if (analysis.hasTimeColumn && analysis.numericColumns.length > 0) {
      recommendations.push({
        chartType: 'LINE',
        title: 'Time Series Analysis',
        description: 'Shows trends and patterns over time',
        confidence: 0.9,
        dataRange: 'A:' + String.fromCharCode(65 + data[0].length - 1),
        reasoning: 'Time-based data with numeric values is ideal for line charts to show trends',
        bestPractices: [
          'Ensure time values are properly formatted',
          'Use consistent time intervals',
          'Add markers for data points if needed'
        ],
        configuration: {
          xAxis: analysis.timeColumn,
          yAxis: analysis.numericColumns[0],
          series: analysis.numericColumns
        }
      });

      if (analysis.numericColumns.length > 1) {
        recommendations.push({
          chartType: 'AREA',
          title: 'Stacked Time Analysis',
          description: 'Shows how multiple metrics contribute to totals over time',
          confidence: 0.8,
          dataRange: 'A:' + String.fromCharCode(65 + data[0].length - 1),
          reasoning: 'Multiple numeric series over time work well with stacked area charts',
          bestPractices: [
            'Stack related metrics only',
            'Use different colors for clarity',
            'Consider percentage stacking for proportional analysis'
          ]
        });
      }
    }

    if (analysis.categoricalColumns.length > 0 && analysis.numericColumns.length > 0) {
      const hasMany = dataRows.length > 10;

      recommendations.push({
        chartType: hasMany ? 'BAR' : 'COLUMN',
        title: 'Category Comparison',
        description: `Compare values across ${analysis.categoricalColumns[0]} categories`,
        confidence: 0.85,
        dataRange: 'A:' + String.fromCharCode(65 + data[0].length - 1),
        reasoning: `${hasMany ? 'Horizontal bar' : 'Column'} charts are ideal for comparing categories`,
        bestPractices: [
          'Sort categories by value for easier comparison',
          'Use consistent colors within the same metric',
          'Add data labels if space permits'
        ],
        configuration: {
          xAxis: hasMany ? analysis.numericColumns[0] : analysis.categoricalColumns[0],
          yAxis: hasMany ? analysis.categoricalColumns[0] : analysis.numericColumns[0]
        }
      });

      if (analysis.categoricalColumns.length === 1 && analysis.numericColumns.length === 1) {
        const uniqueCategories = new Set(dataRows.map(row => row[analysis.categoricalIndex])).size;
        if (uniqueCategories <= 8) {
          recommendations.push({
            chartType: 'PIE',
            title: 'Composition Analysis',
            description: 'Shows how parts make up the whole',
            confidence: 0.7,
            dataRange: 'A:' + String.fromCharCode(65 + data[0].length - 1),
            reasoning: 'Small number of categories with numeric values work well for pie charts',
            bestPractices: [
              'Limit to 5-7 slices for readability',
              'Start with largest slice at 12 o\'clock',
              'Use donut chart for modern look'
            ]
          });
        }
      }
    }

    if (analysis.numericColumns.length >= 2) {
      recommendations.push({
        chartType: 'SCATTER',
        title: 'Correlation Analysis',
        description: 'Explore relationships between numeric variables',
        confidence: 0.75,
        dataRange: 'A:' + String.fromCharCode(65 + data[0].length - 1),
        reasoning: 'Multiple numeric columns can reveal correlations and patterns',
        bestPractices: [
          'Add trendlines to show correlation',
          'Use size or color for third dimension',
          'Remove outliers if they obscure patterns'
        ],
        configuration: {
          xAxis: analysis.numericColumns[0],
          yAxis: analysis.numericColumns[1]
        }
      });
    }

    // Distribution analysis
    if (analysis.numericColumns.length === 1 && dataRows.length > 20) {
      recommendations.push({
        chartType: 'HISTOGRAM',
        title: 'Distribution Analysis',
        description: 'Shows frequency distribution of values',
        confidence: 0.8,
        dataRange: analysis.numericColumns[0] + ':' + analysis.numericColumns[0],
        reasoning: 'Large numeric datasets benefit from distribution analysis',
        bestPractices: [
          'Choose appropriate bin size',
          'Add normal curve overlay if applicable',
          'Consider box plot for outlier analysis'
        ]
      });
    }

    // Purpose-specific recommendations
    if (purpose) {
      const purposeRecommendations = this.getRecommendationsByPurpose(purpose, analysis, targetAudience);
      recommendations.push(...purposeRecommendations);
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Suggest optimal pivot table structure
   */
  async suggestPivotDimensions(
    data: any[][],
    options: {
      includeHeaders?: boolean;
      analysisGoal?: 'summary' | 'comparison' | 'trend' | 'breakdown';
    } = {}
  ): Promise<PivotTableRecommendation[]> {
    const { includeHeaders = true, analysisGoal = 'summary' } = options;
    const recommendations: PivotTableRecommendation[] = [];

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    const analysis = await this.analyzeDataForPivot(dataRows, headers);

    // Generate basic pivot recommendations
    if (analysis.categoricalColumns.length > 0 && analysis.numericColumns.length > 0) {
      // Simple summary pivot
      recommendations.push({
        rows: [analysis.categoricalColumns[0]],
        columns: [],
        values: analysis.numericColumns.map(col => ({
          field: col,
          aggregation: this.suggestAggregation(col, dataRows, headers) as any
        })),
        confidence: 0.8,
        reasoning: `Group by ${analysis.categoricalColumns[0]} to summarize ${analysis.numericColumns.join(', ')}`,
        businessValue: 'Provides high-level overview of performance by category'
      });

      // Two-dimensional pivot if multiple categorical columns
      if (analysis.categoricalColumns.length >= 2) {
        const timeColumn = analysis.timeColumns[0];
        const mainCategory = analysis.categoricalColumns.find(col => col !== timeColumn);

        if (timeColumn && mainCategory) {
          recommendations.push({
            rows: [mainCategory],
            columns: [timeColumn],
            values: analysis.numericColumns.slice(0, 2).map(col => ({
              field: col,
              aggregation: this.suggestAggregation(col, dataRows, headers) as any
            })),
            confidence: 0.85,
            reasoning: `Cross-tabulate ${mainCategory} by ${timeColumn} for trend analysis`,
            businessValue: 'Shows performance trends across categories over time'
          });
        } else {
          recommendations.push({
            rows: [analysis.categoricalColumns[0]],
            columns: [analysis.categoricalColumns[1]],
            values: [{ field: analysis.numericColumns[0], aggregation: 'SUM' as any }],
            confidence: 0.75,
            reasoning: `Two-way analysis of ${analysis.categoricalColumns[0]} vs ${analysis.categoricalColumns[1]}`,
            businessValue: 'Reveals relationships between different categorical dimensions'
          });
        }
      }

      // Filtered pivot for large datasets
      if (dataRows.length > 100) {
        recommendations.push({
          rows: [analysis.categoricalColumns[0]],
          columns: [],
          values: analysis.numericColumns.slice(0, 1).map(col => ({
            field: col,
            aggregation: 'SUM' as any
          })),
          filters: analysis.categoricalColumns.slice(1, 3),
          confidence: 0.7,
          reasoning: 'Large dataset benefits from filtering capabilities',
          businessValue: 'Enables interactive exploration of specific data segments'
        });
      }
    }

    // Goal-specific recommendations
    switch (analysisGoal) {
      case 'trend':
        if (analysis.timeColumns.length > 0) {
          recommendations.push({
            rows: analysis.timeColumns,
            columns: analysis.categoricalColumns.slice(0, 1),
            values: analysis.numericColumns.map(col => ({
              field: col,
              aggregation: 'AVERAGE' as any
            })),
            confidence: 0.9,
            reasoning: 'Time-based analysis for trend identification',
            businessValue: 'Identifies patterns and trends over time periods'
          });
        }
        break;

      case 'comparison':
        recommendations.push({
          rows: analysis.categoricalColumns.slice(0, 2),
          columns: [],
          values: analysis.numericColumns.map(col => ({
            field: col,
            aggregation: 'SUM' as any
          })),
          confidence: 0.85,
          reasoning: 'Multi-level grouping for detailed comparison',
          businessValue: 'Enables comparison at different hierarchical levels'
        });
        break;
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Recommend context-aware formulas
   */
  async recommendFormulas(
    data: any[][],
    context: {
      cellPosition?: string;
      dataRange?: string;
      intent?: string;
      includeHeaders?: boolean;
    } = {}
  ): Promise<FormulaRecommendation[]> {
    const { includeHeaders = true, intent, dataRange } = context;
    const recommendations: FormulaRecommendation[] = [];

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    const analysis = await this.analyzeDataForFormulas(dataRows, headers);

    // Basic statistical formulas
    if (analysis.numericColumns.length > 0) {
      const range = dataRange || `${analysis.numericColumns[0]}:${analysis.numericColumns[0]}`;

      recommendations.push({
        formula: `=SUM(${range})`,
        description: 'Calculate total sum of values',
        category: 'calculation',
        confidence: 0.9,
        complexity: 'beginner',
        alternatives: [`=SUMIF(${range},">0")`, `=SUBTOTAL(9,${range})`],
        explanation: 'Adds all numeric values in the specified range',
        examples: ['=SUM(B2:B10)', '=SUM(Sales_Data)']
      });

      recommendations.push({
        formula: `=AVERAGE(${range})`,
        description: 'Calculate average of values',
        category: 'statistical',
        confidence: 0.85,
        complexity: 'beginner',
        alternatives: [`=AVERAGEIF(${range},">0")`, `=TRIMMEAN(${range},0.1)`],
        explanation: 'Calculates the arithmetic mean of numeric values',
        examples: ['=AVERAGE(C2:C20)', '=AVERAGE(Revenue)']
      });

      recommendations.push({
        formula: `=COUNT(${range})`,
        description: 'Count numeric values',
        category: 'statistical',
        confidence: 0.8,
        complexity: 'beginner',
        alternatives: [`=COUNTA(${range})`, `=COUNTIF(${range},">0")`],
        explanation: 'Counts cells containing numeric values',
        examples: ['=COUNT(D2:D50)', '=COUNT(Quantities)']
      });
    }

    // Lookup formulas
    if (analysis.categoricalColumns.length > 0 && analysis.numericColumns.length > 0) {
      const lookupColumn = analysis.categoricalColumns[0];
      const returnColumn = analysis.numericColumns[0];

      recommendations.push({
        formula: `=VLOOKUP(lookup_value,${lookupColumn}:${returnColumn},2,FALSE)`,
        description: `Find value in ${returnColumn} based on ${lookupColumn}`,
        category: 'lookup',
        confidence: 0.8,
        complexity: 'intermediate',
        alternatives: [`=INDEX(${returnColumn}:${returnColumn},MATCH(lookup_value,${lookupColumn}:${lookupColumn},0))`],
        explanation: 'Searches for a value and returns corresponding data from another column',
        examples: ['=VLOOKUP(A2,B:D,3,FALSE)', '=VLOOKUP("Product A",Products,2,0)']
      });

      recommendations.push({
        formula: `=INDEX(${returnColumn}:${returnColumn},MATCH(lookup_value,${lookupColumn}:${lookupColumn},0))`,
        description: 'More flexible lookup using INDEX/MATCH',
        category: 'lookup',
        confidence: 0.9,
        complexity: 'intermediate',
        alternatives: [`=XLOOKUP(lookup_value,${lookupColumn}:${lookupColumn},${returnColumn}:${returnColumn})`],
        explanation: 'Combines INDEX and MATCH for powerful lookup capabilities',
        examples: ['=INDEX(C:C,MATCH(A2,B:B,0))', '=INDEX(Prices,MATCH("Item1",Items,0))']
      });
    }

    // Conditional formulas
    if (analysis.numericColumns.length > 0) {
      recommendations.push({
        formula: `=IF(${analysis.numericColumns[0]}1>threshold,value_if_true,value_if_false)`,
        description: 'Conditional logic based on value comparison',
        category: 'conditional',
        confidence: 0.85,
        complexity: 'beginner',
        alternatives: ['=IFS(condition1,value1,condition2,value2)', '=SWITCH(expression,value1,result1,default)'],
        explanation: 'Returns different values based on whether condition is true or false',
        examples: ['=IF(B2>100,"High","Low")', '=IF(Sales>Target,"Met","Missed")']
      });

      recommendations.push({
        formula: `=SUMIF(${analysis.categoricalColumns[0]}:${analysis.categoricalColumns[0]},criteria,${analysis.numericColumns[0]}:${analysis.numericColumns[0]})`,
        description: 'Sum values that meet specific criteria',
        category: 'conditional',
        confidence: 0.9,
        complexity: 'intermediate',
        alternatives: [`=SUMIFS(${analysis.numericColumns[0]}:${analysis.numericColumns[0]},criteria_range1,criteria1)`],
        explanation: 'Sums values in one range based on criteria in another range',
        examples: ['=SUMIF(Region,"North",Sales)', '=SUMIF(A:A,"Product A",B:B)']
      });
    }

    // Date formulas if date columns exist
    if (analysis.dateColumns.length > 0) {
      recommendations.push({
        formula: '=TODAY()',
        description: 'Current date',
        category: 'date',
        confidence: 0.8,
        complexity: 'beginner',
        alternatives: ['=NOW()', '=WEEKDAY(TODAY())'],
        explanation: 'Returns the current date',
        examples: ['=TODAY()', '=TODAY()+30']
      });

      recommendations.push({
        formula: `=DATEDIF(start_date,end_date,"D")`,
        description: 'Calculate difference between dates',
        category: 'date',
        confidence: 0.85,
        complexity: 'intermediate',
        alternatives: ['=end_date-start_date', '=DAYS(end_date,start_date)'],
        explanation: 'Calculates the difference between two dates in specified units',
        examples: ['=DATEDIF(A2,B2,"Y")', '=DATEDIF(StartDate,TODAY(),"M")']
      });
    }

    // Intent-based recommendations
    if (intent) {
      const intentRecommendations = this.getFormulasByIntent(intent, analysis);
      recommendations.push(...intentRecommendations);
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Suggest data structure improvements
   */
  async optimizeDataStructure(
    data: any[][],
    options: {
      includeHeaders?: boolean;
      currentIssues?: string[];
    } = {}
  ): Promise<DataStructureRecommendation[]> {
    const { includeHeaders = true } = options;
    const recommendations: DataStructureRecommendation[] = [];

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    // Analyze current structure
    const issues = await this.identifyStructuralIssues(data, { includeHeaders });

    // Header improvements
    if (includeHeaders) {
      const headerIssues = this.analyzeHeaders(headers);
      if (headerIssues.length > 0) {
        recommendations.push({
          improvement: 'Improve Column Headers',
          description: 'Headers should be descriptive, consistent, and properly formatted',
          impact: 'medium',
          effort: 'low',
          steps: [
            'Use descriptive names instead of generic terms',
            'Apply consistent naming convention (e.g., PascalCase)',
            'Avoid special characters and spaces',
            'Add units of measurement where applicable'
          ],
          benefits: [
            'Easier data understanding and analysis',
            'Better formula readability',
            'Improved data documentation'
          ]
        });
      }
    }

    // Data normalization
    const normalizeNeeded = this.checkNormalizationNeeds(dataRows, headers);
    if (normalizeNeeded.length > 0) {
      recommendations.push({
        improvement: 'Normalize Data Structure',
        description: 'Separate combined data into distinct columns for better analysis',
        impact: 'high',
        effort: 'medium',
        steps: [
          'Split combined fields into separate columns',
          'Create consistent data types per column',
          'Remove redundant data',
          'Establish primary keys where needed'
        ],
        benefits: [
          'Improved data integrity',
          'Better aggregation capabilities',
          'Easier filtering and sorting',
          'Reduced storage redundancy'
        ]
      });
    }

    // Data validation suggestions
    const validationNeeds = this.identifyValidationNeeds(dataRows, headers);
    if (validationNeeds.length > 0) {
      recommendations.push({
        improvement: 'Add Data Validation Rules',
        description: 'Implement validation to ensure data quality and consistency',
        impact: 'high',
        effort: 'low',
        steps: [
          'Add dropdown lists for categorical data',
          'Set numeric ranges for quantitative fields',
          'Create date validation rules',
          'Implement custom validation formulas'
        ],
        benefits: [
          'Prevents data entry errors',
          'Ensures data consistency',
          'Improves data reliability',
          'Reduces cleanup time'
        ]
      });
    }

    // Table structure recommendations
    const tableStructure = this.analyzeTableStructure(data);
    if (!tableStructure.isOptimal) {
      recommendations.push({
        improvement: 'Convert to Structured Table',
        description: 'Use Excel/Sheets table format for better data management',
        impact: 'medium',
        effort: 'low',
        steps: [
          'Select data range and convert to table',
          'Enable table headers and filters',
          'Define calculated columns if needed',
          'Set up table formatting and styles'
        ],
        benefits: [
          'Automatic range expansion',
          'Built-in filtering and sorting',
          'Structured references in formulas',
          'Consistent formatting'
        ]
      });
    }

    // Performance optimization
    if (dataRows.length > 1000) {
      recommendations.push({
        improvement: 'Optimize for Large Datasets',
        description: 'Implement strategies for handling large amounts of data efficiently',
        impact: 'high',
        effort: 'medium',
        steps: [
          'Use XLOOKUP instead of VLOOKUP',
          'Replace array formulas with table references',
          'Implement data connections for external sources',
          'Consider pivot tables for analysis'
        ],
        benefits: [
          'Faster calculation times',
          'Improved file performance',
          'Better memory usage',
          'More responsive interface'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const effortWeight = { low: 3, medium: 2, high: 1 }; // Inverse weight for effort
      return (impactWeight[b.impact] * effortWeight[b.effort]) - (impactWeight[a.impact] * effortWeight[a.effort]);
    });
  }

  /**
   * Generate executive summary report
   */
  async generateSummaryReport(
    data: any[][],
    context: {
      title?: string;
      reportType?: 'executive' | 'technical' | 'operational';
      includeHeaders?: boolean;
    } = {}
  ): Promise<SummaryReport> {
    const { title = 'Data Analysis Report', reportType = 'executive', includeHeaders = true } = context;

    const dataRows = includeHeaders ? data.slice(1) : data;
    const headers = includeHeaders ? data[0] : Array.from({ length: data[0].length }, (_, i) => `Column ${i + 1}`);

    // Analyze data characteristics
    const analysis = await this.analyzeDataForSummary(dataRows, headers);

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(analysis, reportType);

    // Extract key findings
    const keyFindings = this.extractKeyFindings(analysis);

    // Generate recommendations
    const recommendations = this.generateHighLevelRecommendations(analysis);

    // Assess data quality
    const dataQuality = await this.assessDataQuality(data);

    // Generate insights
    const insights = this.generateInsights(analysis);

    return {
      executiveSummary,
      keyFindings,
      recommendations,
      dataQuality,
      insights
    };
  }

  // Private helper methods
  private async analyzeDataForCharts(dataRows: any[][], headers: string[]) {
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];
    const timeColumns: string[] = [];
    let timeColumn: string | null = null;
    let categoricalIndex = -1;

    for (let i = 0; i < headers.length; i++) {
      const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');

      if (this.isNumericColumn(columnData)) {
        numericColumns.push(headers[i]);
      } else if (this.isDateColumn(columnData)) {
        timeColumns.push(headers[i]);
        if (!timeColumn) timeColumn = headers[i];
      } else {
        categoricalColumns.push(headers[i]);
        if (categoricalIndex === -1) categoricalIndex = i;
      }
    }

    return {
      numericColumns,
      categoricalColumns,
      timeColumns,
      timeColumn,
      categoricalIndex,
      hasTimeColumn: timeColumns.length > 0
    };
  }

  private async analyzeDataForPivot(dataRows: any[][], headers: string[]) {
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];
    const timeColumns: string[] = [];

    for (let i = 0; i < headers.length; i++) {
      const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');

      if (this.isNumericColumn(columnData)) {
        numericColumns.push(headers[i]);
      } else if (this.isDateColumn(columnData)) {
        timeColumns.push(headers[i]);
      } else {
        categoricalColumns.push(headers[i]);
      }
    }

    return { numericColumns, categoricalColumns, timeColumns };
  }

  private async analyzeDataForFormulas(dataRows: any[][], headers: string[]) {
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];
    const dateColumns: string[] = [];

    for (let i = 0; i < headers.length; i++) {
      const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');

      if (this.isNumericColumn(columnData)) {
        numericColumns.push(headers[i]);
      } else if (this.isDateColumn(columnData)) {
        dateColumns.push(headers[i]);
      } else {
        categoricalColumns.push(headers[i]);
      }
    }

    return { numericColumns, categoricalColumns, dateColumns };
  }

  private isNumericColumn(data: any[]): boolean {
    if (data.length === 0) return false;
    const numericCount = data.filter(val => !isNaN(parseFloat(val.toString()))).length;
    return numericCount / data.length > 0.8;
  }

  private isDateColumn(data: any[]): boolean {
    if (data.length === 0) return false;
    const dateCount = data.filter(val => {
      const date = new Date(val.toString());
      return !isNaN(date.getTime()) && val.toString().length > 4;
    }).length;
    return dateCount / data.length > 0.8;
  }

  private suggestAggregation(column: string, dataRows: any[][], headers: string[]): string {
    const columnIndex = headers.indexOf(column);
    if (columnIndex === -1) return 'SUM';

    const columnData = dataRows.map(row => row[columnIndex]).filter(val => val !== null && val !== undefined && val !== '');
    const numericData = columnData.map(val => parseFloat(val.toString())).filter(val => !isNaN(val));

    // Determine best aggregation based on data characteristics
    const isCount = column.toLowerCase().includes('count') || column.toLowerCase().includes('quantity');
    const isPercentage = column.toLowerCase().includes('percent') || column.toLowerCase().includes('rate');
    const isPrice = column.toLowerCase().includes('price') || column.toLowerCase().includes('cost');

    if (isCount) return 'SUM';
    if (isPercentage) return 'AVERAGE';
    if (isPrice) return 'AVERAGE';

    // Check data distribution
    const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
    const variance = numericData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericData.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    if (coefficientOfVariation > 1) return 'MEDIAN'; // High variance suggests median is better
    return 'AVERAGE';
  }

  private getRecommendationsByPurpose(purpose: string, analysis: any, targetAudience: string): ChartRecommendation[] {
    const recommendations: ChartRecommendation[] = [];

    switch (purpose) {
      case 'comparison':
        if (analysis.categoricalColumns.length > 0) {
          recommendations.push({
            chartType: 'BAR',
            title: 'Category Comparison',
            description: 'Compare values across categories',
            confidence: 0.9,
            dataRange: 'A:Z',
            reasoning: 'Bar charts excel at comparing values across categories',
            bestPractices: ['Sort by value', 'Use consistent colors', 'Include data labels']
          });
        }
        break;

      case 'trend':
        if (analysis.hasTimeColumn) {
          recommendations.push({
            chartType: 'LINE',
            title: 'Trend Analysis',
            description: 'Show changes over time',
            confidence: 0.95,
            dataRange: 'A:Z',
            reasoning: 'Line charts are optimal for showing trends over time',
            bestPractices: ['Use consistent time intervals', 'Add trendlines', 'Highlight key points']
          });
        }
        break;

      case 'composition':
        recommendations.push({
          chartType: 'PIE',
          title: 'Composition Analysis',
          description: 'Show parts of a whole',
          confidence: 0.8,
          dataRange: 'A:Z',
          reasoning: 'Pie charts effectively show how parts contribute to the whole',
          bestPractices: ['Limit to 5-7 slices', 'Order by size', 'Use donut for modern look']
        });
        break;
    }

    return recommendations;
  }

  private getFormulasByIntent(intent: string, analysis: any): FormulaRecommendation[] {
    const recommendations: FormulaRecommendation[] = [];

    if (intent.toLowerCase().includes('total') || intent.toLowerCase().includes('sum')) {
      recommendations.push({
        formula: '=SUM(range)',
        description: 'Calculate total sum',
        category: 'calculation',
        confidence: 0.95,
        complexity: 'beginner',
        alternatives: ['=SUMIF(range,criteria)', '=SUBTOTAL(9,range)'],
        explanation: 'Adds all numeric values in the specified range',
        examples: ['=SUM(B2:B10)', '=SUM(Sales)']
      });
    }

    if (intent.toLowerCase().includes('average') || intent.toLowerCase().includes('mean')) {
      recommendations.push({
        formula: '=AVERAGE(range)',
        description: 'Calculate average value',
        category: 'statistical',
        confidence: 0.9,
        complexity: 'beginner',
        alternatives: ['=AVERAGEIF(range,criteria)', '=TRIMMEAN(range,0.1)'],
        explanation: 'Calculates the arithmetic mean of values',
        examples: ['=AVERAGE(C2:C20)', '=AVERAGE(Scores)']
      });
    }

    if (intent.toLowerCase().includes('lookup') || intent.toLowerCase().includes('find')) {
      recommendations.push({
        formula: '=VLOOKUP(lookup_value,table_array,col_index_num,FALSE)',
        description: 'Find and return matching value',
        category: 'lookup',
        confidence: 0.85,
        complexity: 'intermediate',
        alternatives: ['=INDEX(MATCH(...))', '=XLOOKUP(...)'],
        explanation: 'Searches for a value and returns corresponding data',
        examples: ['=VLOOKUP(A2,B:D,3,FALSE)', '=VLOOKUP("Item",Table,2,0)']
      });
    }

    return recommendations;
  }

  private async identifyStructuralIssues(data: any[][], options: any): Promise<string[]> {
    const issues: string[] = [];

    // Check for empty rows/columns
    const hasEmptyRows = data.some(row => row.every(cell => cell === null || cell === undefined || cell === ''));
    const hasEmptyColumns = Array.from({ length: data[0].length }, (_, i) =>
      data.every(row => row[i] === null || row[i] === undefined || row[i] === '')
    ).some(isEmpty => isEmpty);

    if (hasEmptyRows) issues.push('Contains empty rows');
    if (hasEmptyColumns) issues.push('Contains empty columns');

    // Check for merged cells (simplified detection)
    // This would need more sophisticated logic in a real implementation

    // Check for inconsistent data types
    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const columnData = data.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');
      const types = new Set(columnData.map(val => typeof val));
      if (types.size > 1) {
        issues.push(`Column ${colIndex + 1} has mixed data types`);
      }
    }

    return issues;
  }

  private analyzeHeaders(headers: string[]): string[] {
    const issues: string[] = [];

    // Check for generic headers
    const genericPattern = /^(column|col|field|data)\d*$/i;
    const hasGeneric = headers.some(header => genericPattern.test(header.toString()));
    if (hasGeneric) issues.push('Contains generic column names');

    // Check for special characters
    const hasSpecialChars = headers.some(header => /[^a-zA-Z0-9_\s]/.test(header.toString()));
    if (hasSpecialChars) issues.push('Headers contain special characters');

    // Check for consistency
    const casingPattern = /^[A-Z][a-z]*(?:[A-Z][a-z]*)*$/; // PascalCase
    const isConsistent = headers.every(header => casingPattern.test(header.toString()));
    if (!isConsistent) issues.push('Inconsistent header naming convention');

    return issues;
  }

  private checkNormalizationNeeds(dataRows: any[][], headers: string[]): string[] {
    const needs: string[] = [];

    // Check for combined fields (e.g., "John Doe" in name field)
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const columnData = dataRows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');

      // Check if text fields contain multiple components
      if (!this.isNumericColumn(columnData) && !this.isDateColumn(columnData)) {
        const hasSpaces = columnData.some(val => val.toString().includes(' '));
        const hasCommas = columnData.some(val => val.toString().includes(','));

        if (hasSpaces && headers[colIndex].toLowerCase().includes('name')) {
          needs.push(`${headers[colIndex]} may need splitting into separate name fields`);
        }
        if (hasCommas) {
          needs.push(`${headers[colIndex]} may contain delimited data that should be normalized`);
        }
      }
    }

    return needs;
  }

  private identifyValidationNeeds(dataRows: any[][], headers: string[]): string[] {
    const needs: string[] = [];

    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const columnData = dataRows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');

      if (this.isNumericColumn(columnData)) {
        needs.push(`${headers[colIndex]} could benefit from numeric range validation`);
      } else if (this.isDateColumn(columnData)) {
        needs.push(`${headers[colIndex]} could benefit from date range validation`);
      } else {
        // Check for categorical data
        const uniqueValues = new Set(columnData);
        if (uniqueValues.size <= 20 && columnData.length > uniqueValues.size * 2) {
          needs.push(`${headers[colIndex]} could use dropdown validation`);
        }
      }
    }

    return needs;
  }

  private analyzeTableStructure(data: any[][]): { isOptimal: boolean; issues: string[] } {
    const issues: string[] = [];

    // This is a simplified analysis
    // Real implementation would check for proper table structure
    const hasHeaders = data.length > 0;
    const hasData = data.length > 1;
    const isRectangular = data.every(row => row.length === data[0].length);

    if (!hasHeaders) issues.push('Missing headers');
    if (!hasData) issues.push('No data rows');
    if (!isRectangular) issues.push('Inconsistent row lengths');

    return {
      isOptimal: issues.length === 0,
      issues
    };
  }

  private async analyzeDataForSummary(dataRows: any[][], headers: string[]) {
    const totalRows = dataRows.length;
    const totalColumns = headers.length;
    const numericColumns = headers.filter((_, i) => {
      const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');
      return this.isNumericColumn(columnData);
    });

    const categoricalColumns = headers.filter((_, i) => {
      const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');
      return !this.isNumericColumn(columnData) && !this.isDateColumn(columnData);
    });

    return {
      totalRows,
      totalColumns,
      numericColumns,
      categoricalColumns,
      hasTimeData: headers.some((_, i) => {
        const columnData = dataRows.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');
        return this.isDateColumn(columnData);
      })
    };
  }

  private generateExecutiveSummary(analysis: any, reportType: string): string {
    const { totalRows, totalColumns, numericColumns, categoricalColumns } = analysis;

    let summary = `This ${reportType} report analyzes a dataset containing ${totalRows.toLocaleString()} records across ${totalColumns} variables. `;

    if (numericColumns.length > 0) {
      summary += `The dataset includes ${numericColumns.length} quantitative measures enabling statistical analysis and trend identification. `;
    }

    if (categoricalColumns.length > 0) {
      summary += `There are ${categoricalColumns.length} categorical dimensions suitable for segmentation and comparative analysis. `;
    }

    if (analysis.hasTimeData) {
      summary += `Time-series data is present, allowing for temporal analysis and forecasting. `;
    }

    summary += `This data structure supports comprehensive business intelligence and data-driven decision making.`;

    return summary;
  }

  private extractKeyFindings(analysis: any): string[] {
    const findings: string[] = [];

    findings.push(`Dataset contains ${analysis.totalRows.toLocaleString()} records across ${analysis.totalColumns} variables`);

    if (analysis.numericColumns.length > 0) {
      findings.push(`${analysis.numericColumns.length} numeric measures available for quantitative analysis`);
    }

    if (analysis.categoricalColumns.length > 0) {
      findings.push(`${analysis.categoricalColumns.length} categorical dimensions enable segmentation analysis`);
    }

    if (analysis.hasTimeData) {
      findings.push('Time-series data enables trend analysis and forecasting capabilities');
    }

    return findings;
  }

  private generateHighLevelRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.numericColumns.length > 0 && analysis.categoricalColumns.length > 0) {
      recommendations.push('Create pivot tables to summarize performance by key dimensions');
    }

    if (analysis.hasTimeData) {
      recommendations.push('Implement trend analysis and forecasting models');
    }

    if (analysis.totalRows > 1000) {
      recommendations.push('Consider data sampling for rapid prototyping and testing');
    }

    recommendations.push('Establish regular data quality monitoring processes');

    return recommendations;
  }

  private async assessDataQuality(data: any[][]): Promise<{ score: number; issues: string[] }> {
    const issues: string[] = [];
    let qualityScore = 100;

    // Check for missing data
    const totalCells = data.length * data[0].length;
    const emptyCells = data.flat().filter(cell => cell === null || cell === undefined || cell === '').length;
    const completeness = (totalCells - emptyCells) / totalCells;

    if (completeness < 0.95) {
      issues.push(`${((1 - completeness) * 100).toFixed(1)}% of data is missing`);
      qualityScore -= (1 - completeness) * 30;
    }

    // Check for duplicates (simplified)
    const uniqueRows = new Set(data.map(row => JSON.stringify(row))).size;
    if (uniqueRows < data.length) {
      issues.push(`${data.length - uniqueRows} duplicate records detected`);
      qualityScore -= 20;
    }

    return {
      score: Math.max(0, Math.round(qualityScore)),
      issues
    };
  }

  private generateInsights(analysis: any): Array<{
    type: 'trend' | 'pattern' | 'anomaly' | 'opportunity';
    description: string;
    significance: 'high' | 'medium' | 'low';
  }> {
    const insights = [];

    if (analysis.numericColumns.length >= 2) {
      insights.push({
        type: 'opportunity' as const,
        description: 'Multiple numeric variables enable correlation and regression analysis',
        significance: 'medium' as const
      });
    }

    if (analysis.categoricalColumns.length >= 2) {
      insights.push({
        type: 'pattern' as const,
        description: 'Multiple categorical dimensions support multi-dimensional analysis',
        significance: 'medium' as const
      });
    }

    if (analysis.hasTimeData) {
      insights.push({
        type: 'trend' as const,
        description: 'Time-series data structure enables predictive analytics',
        significance: 'high' as const
      });
    }

    return insights;
  }
}