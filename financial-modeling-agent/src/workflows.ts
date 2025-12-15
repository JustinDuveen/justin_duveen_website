import { BusinessModel, BusinessContext, MCPToolCall, WorkflowStep, FinancialFormula } from './types.js';

export class FinancialModelingWorkflows {

  // Financial formulas by business model
  static FORMULAS: Record<BusinessModel, FinancialFormula[]> = {
    saas: [
      {
        name: 'MRR',
        formula: '=SUMPRODUCT(Customers * ARPU)',
        description: 'Monthly Recurring Revenue',
        businessModel: ['saas'],
        category: 'revenue'
      },
      {
        name: 'ARR',
        formula: '=MRR * 12',
        description: 'Annual Recurring Revenue',
        businessModel: ['saas'],
        category: 'revenue'
      },
      {
        name: 'LTV',
        formula: '=(ARPU * GrossMargin) / MonthlyChurn',
        description: 'Customer Lifetime Value',
        businessModel: ['saas'],
        category: 'unit-economics'
      },
      {
        name: 'CAC_Payback',
        formula: '=CAC / (ARPU * GrossMargin)',
        description: 'CAC Payback Period in months',
        businessModel: ['saas'],
        category: 'efficiency'
      },
      {
        name: 'LTV_CAC_Ratio',
        formula: '=LTV / CAC',
        description: 'LTV to CAC Ratio (should be 3x+)',
        businessModel: ['saas'],
        category: 'unit-economics'
      }
    ],
    marketplace: [
      {
        name: 'GMV',
        formula: '=TransactionCount * AverageTransactionValue',
        description: 'Gross Merchandise Value',
        businessModel: ['marketplace'],
        category: 'revenue'
      },
      {
        name: 'Revenue',
        formula: '=GMV * TakeRate',
        description: 'Platform Revenue',
        businessModel: ['marketplace'],
        category: 'revenue'
      },
      {
        name: 'Unit_Economics',
        formula: '=(TakeRate * TransactionValue) - SupportCosts',
        description: 'Profit per transaction',
        businessModel: ['marketplace'],
        category: 'unit-economics'
      }
    ],
    ecommerce: [
      {
        name: 'LTV_Ecom',
        formula: '=(AOV * RepeatRate) / ChurnRate',
        description: 'Customer Lifetime Value for eCommerce',
        businessModel: ['ecommerce'],
        category: 'unit-economics'
      },
      {
        name: 'Unit_Economics_Ecom',
        formula: '=(AOV * GrossMargin) - CAC - FulfillmentCost',
        description: 'Unit economics per customer',
        businessModel: ['ecommerce'],
        category: 'unit-economics'
      }
    ],
    hybrid: [],
    unknown: []
  };

  // Workflow for creating model structure
  static getModelStructureWorkflow(context: BusinessContext): WorkflowStep[] {
    return [
      {
        name: 'create_assumptions_sheet',
        description: 'Create Assumptions tab with editable parameters',
        tools: [
          {
            tool: 'create_sheet',
            parameters: {
              title: 'Assumptions',
              rowCount: 100,
              columnCount: 10
            },
            description: 'Create assumptions sheet for model inputs'
          }
        ]
      },
      {
        name: 'create_projections_sheet',
        description: 'Create Projections tab with monthly P&L',
        tools: [
          {
            tool: 'create_sheet',
            parameters: {
              title: 'Projections',
              rowCount: 200,
              columnCount: 15
            },
            description: 'Create projections sheet for financial forecasts'
          }
        ]
      },
      {
        name: 'create_dashboard_sheet',
        description: 'Create Dashboard tab with key metrics and charts',
        tools: [
          {
            tool: 'create_sheet',
            parameters: {
              title: 'Dashboard',
              rowCount: 50,
              columnCount: 12
            },
            description: 'Create dashboard for key metrics visualization'
          }
        ]
      },
      {
        name: 'create_scenarios_sheet',
        description: 'Create Scenarios tab for base/upside/downside cases',
        tools: [
          {
            tool: 'create_sheet',
            parameters: {
              title: 'Scenarios',
              rowCount: 100,
              columnCount: 20
            },
            description: 'Create scenarios sheet for sensitivity analysis'
          }
        ]
      }
    ];
  }

  // Business model specific revenue workflows
  static getRevenueModelWorkflow(context: BusinessContext, spreadsheetId: string): WorkflowStep[] {
    const baseWorkflow = [
      {
        name: 'setup_assumptions',
        description: 'Set up key assumptions based on business model',
        tools: [
          {
            tool: 'write_range',
            parameters: {
              spreadsheetId,
              range: 'Assumptions!A1:B20',
              values: this.getAssumptionsTemplate(context.model)
            },
            description: 'Write business model assumptions'
          }
        ]
      }
    ];

    // Add business model specific formulas
    const formulas = this.FORMULAS[context.model] || [];
    formulas.forEach((formula, index) => {
      baseWorkflow.push({
        name: `implement_${formula.name}`,
        description: `Implement ${formula.description}`,
        tools: [
          {
            tool: 'suggest_formulas',
            parameters: {
              description: formula.description,
              context: `${context.model} business model`
            },
            description: `Get formula for ${formula.name}`
          },
          {
            tool: 'apply_formula',
            parameters: {
              spreadsheetId,
              range: `Projections!${String.fromCharCode(65 + index)}2`,
              formula: formula.formula
            },
            description: `Apply ${formula.name} formula`
          }
        ]
      });
    });

    return baseWorkflow;
  }

  // Analysis workflow using statistical tools
  static getAnalysisWorkflow(context: BusinessContext, spreadsheetId: string): WorkflowStep[] {
    return [
      {
        name: 'analyze_existing_data',
        description: 'Analyze patterns in existing business data',
        tools: [
          {
            tool: 'analyze_data_patterns',
            parameters: {
              spreadsheetId,
              range: 'Projections!A1:Z100',
              includeHeaders: true
            },
            description: 'Detect trends and patterns in financial data'
          }
        ]
      },
      {
        name: 'generate_insights',
        description: 'Generate business insights from data analysis',
        tools: [
          {
            tool: 'suggest_data_insights',
            parameters: {
              spreadsheetId,
              range: 'Projections!A1:Z100',
              domain: context.model === 'saas' ? 'finance' : 'general'
            },
            description: 'Generate actionable business insights'
          }
        ]
      },
      {
        name: 'detect_red_flags',
        description: 'Identify anomalies and red flags in unit economics',
        tools: [
          {
            tool: 'detect_anomalies',
            parameters: {
              spreadsheetId,
              range: 'Projections!A1:Z100',
              method: 'zscore',
              threshold: 2.0
            },
            description: 'Flag potential issues in financial metrics'
          }
        ]
      }
    ];
  }

  // Visualization workflow
  static getVisualizationWorkflow(context: BusinessContext, spreadsheetId: string): WorkflowStep[] {
    return [
      {
        name: 'create_revenue_chart',
        description: 'Create revenue growth visualization',
        tools: [
          {
            tool: 'create_advanced_chart',
            parameters: {
              spreadsheetId,
              title: `${context.model.toUpperCase()} Revenue Growth`,
              chartType: 'LINE',
              dataRange: 'Projections!A1:C36', // 3 years monthly
              sheetId: 2, // Dashboard sheet
              anchorRow: 2,
              anchorColumn: 1
            },
            description: 'Create revenue trend chart'
          }
        ]
      },
      {
        name: 'create_unit_economics_chart',
        description: 'Create unit economics visualization',
        tools: [
          {
            tool: 'create_advanced_chart',
            parameters: {
              spreadsheetId,
              title: 'Unit Economics Trends',
              chartType: 'COMBO',
              dataRange: 'Projections!A1:F36',
              sheetId: 2,
              anchorRow: 2,
              anchorColumn: 7
            },
            description: 'Create unit economics chart'
          }
        ]
      },
      {
        name: 'format_professional',
        description: 'Apply professional formatting',
        tools: [
          {
            tool: 'format_cells',
            parameters: {
              spreadsheetId,
              range: 'Dashboard!A1:Z50',
              backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
              fontFamily: 'Arial',
              fontSize: 11
            },
            description: 'Apply professional styling'
          }
        ]
      }
    ];
  }

  // Helper: Get assumptions template based on business model
  private static getAssumptionsTemplate(model: BusinessModel): any[][] {
    const baseAssumptions = [
      ['Assumption', 'Value'],
      ['Starting Revenue', 10000],
      ['Monthly Growth Rate (%)', 15],
      ['Customer Acquisition Cost', 100],
      ['Gross Margin (%)', 70]
    ];

    switch (model) {
      case 'saas':
        return [
          ...baseAssumptions,
          ['Monthly Churn Rate (%)', 5],
          ['ARPU (Monthly)', 50],
          ['Sales Cycle (months)', 3]
        ];

      case 'marketplace':
        return [
          ...baseAssumptions,
          ['Take Rate (%)', 15],
          ['Average Transaction Value', 200],
          ['Supply Side CAC', 50],
          ['Demand Side CAC', 150]
        ];

      case 'ecommerce':
        return [
          ...baseAssumptions,
          ['Average Order Value', 75],
          ['Repeat Purchase Rate (%)', 30],
          ['Fulfillment Cost per Order', 10]
        ];

      default:
        return baseAssumptions;
    }
  }
}