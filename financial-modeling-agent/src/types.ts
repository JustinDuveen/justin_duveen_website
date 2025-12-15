// Financial Modeling Types
export type BusinessModel = 'saas' | 'marketplace' | 'ecommerce' | 'hybrid' | 'unknown';

export interface BusinessContext {
  model: BusinessModel;
  currentTraction: {
    revenue?: number; // MRR/GMV/Monthly Revenue
    customers?: number;
    growthRate?: number; // % MoM
  };
  unitEconomics: {
    cac?: number;
    ltv?: number;
    churn?: number; // Monthly for SaaS
    grossMargin?: number;
    takeRate?: number; // For marketplaces
    aov?: number; // For eCommerce
  };
  fundraising: {
    stage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b+';
    burnRate?: number;
    runway?: number; // months
    targetRaise?: number;
  };
}

export interface ModelStructure {
  spreadsheetId: string;
  sheets: {
    assumptions: number;
    projections: number;
    dashboard: number;
    scenarios: number;
  };
}

export interface FinancialFormula {
  name: string;
  formula: string;
  description: string;
  businessModel: BusinessModel[];
  category: 'revenue' | 'unit-economics' | 'growth' | 'efficiency';
}

export interface RedFlag {
  metric: string;
  value: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'watch';
  explanation: string;
  recommendation: string;
}

export interface ModelingResult {
  context: BusinessContext;
  structure: ModelStructure;
  insights: string[];
  redFlags: RedFlag[];
  investorNarrative: string;
  nextSteps: string[];
}

// Tool call types for MCP integration
export interface MCPToolCall {
  tool: string;
  parameters: Record<string, any>;
  description: string;
}

export interface WorkflowStep {
  name: string;
  description: string;
  tools: MCPToolCall[];
  validation?: (result: any) => boolean;
}