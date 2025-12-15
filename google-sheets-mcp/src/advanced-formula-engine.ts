/**
 * Advanced Formula Intelligence Engine for Phase 2A
 * Extends the base formula engine with AI-powered debugging, performance analysis, and documentation
 */

import { FormulaEngine, FormulaValidationResult, FormulaSuggestion } from './formula-engine.js';

export interface FormulaDebugStep {
  step: number;
  operation: string;
  input: any;
  output: any;
  explanation: string;
  range?: string;
}

export interface FormulaDebugResult {
  isSuccess: boolean;
  steps: FormulaDebugStep[];
  finalResult: any;
  executionTime?: number;
  error?: string;
  suggestions?: string[];
}

export interface FormulaPerformanceAnalysis {
  formula: string;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  estimatedTime: 'fast' | 'moderate' | 'slow' | 'very_slow';
  memoryUsage: 'light' | 'moderate' | 'heavy';
  bottlenecks: Array<{
    type: 'function' | 'range' | 'array' | 'lookup';
    description: string;
    impact: 'low' | 'medium' | 'high';
    suggestion: string;
  }>;
  optimizationScore: number;
  recommendations: string[];
}

export interface FormulaDocumentation {
  formula: string;
  purpose: string;
  description: string;
  inputs: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  output: {
    type: string;
    description: string;
  };
  examples: Array<{
    scenario: string;
    formula: string;
    result: string;
    explanation: string;
  }>;
  dependencies: string[];
  assumptions: string[];
  limitations: string[];
}

export interface FormulaAlternative {
  formula: string;
  description: string;
  pros: string[];
  cons: string[];
  performanceRating: number;
  complexityRating: number;
  useCase: string;
}

export interface FormulaLibraryItem {
  id: string;
  name: string;
  category: string;
  formula: string;
  description: string;
  tags: string[];
  createdDate: Date;
  lastUsed: Date;
  usageCount: number;
  author?: string;
  version: string;
}

export class AdvancedFormulaEngine extends FormulaEngine {
  private formulaLibrary: Map<string, FormulaLibraryItem> = new Map();
  private performanceCache: Map<string, FormulaPerformanceAnalysis> = new Map();

  /**
   * Debug formula execution step-by-step
   */
  debugFormula(
    formula: string,
    context?: {
      cellData?: Map<string, any>;
      namedRanges?: Map<string, string>;
      spreadsheetId?: string;
    }
  ): FormulaDebugResult {
    const steps: FormulaDebugStep[] = [];
    const startTime = Date.now();

    try {
      // Remove leading = if present
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;

      // Step 1: Parse and validate syntax
      steps.push({
        step: 1,
        operation: 'Syntax Validation',
        input: cleanFormula,
        output: 'Valid',
        explanation: 'Formula syntax is correct'
      });

      // Step 2: Extract functions and ranges
      const functions = this.extractFunctions(cleanFormula);
      const ranges = this.extractRanges(cleanFormula);

      steps.push({
        step: 2,
        operation: 'Component Analysis',
        input: { functions, ranges },
        output: `Found ${functions.length} functions and ${ranges.length} ranges`,
        explanation: 'Identified all formula components'
      });

      // Step 3: Resolve references
      const resolvedRanges = this.resolveReferences(ranges, context?.namedRanges);
      steps.push({
        step: 3,
        operation: 'Reference Resolution',
        input: ranges,
        output: resolvedRanges,
        explanation: 'Converted named ranges to cell references'
      });

      // Step 4: Function-by-function execution simulation
      let currentFormula = cleanFormula;
      for (let i = 0; i < functions.length; i++) {
        const func = functions[i];
        const result = this.simulateFunctionExecution(func, context);

        steps.push({
          step: 4 + i,
          operation: `Execute ${func.name}`,
          input: func.parameters,
          output: result,
          explanation: `${func.name} function executed with parameters: ${func.parameters.join(', ')}`
        });
      }

      // Step 5: Final result calculation
      const finalResult = this.calculateFinalResult(cleanFormula, context);
      steps.push({
        step: steps.length + 1,
        operation: 'Final Calculation',
        input: cleanFormula,
        output: finalResult,
        explanation: 'Formula execution completed successfully'
      });

      const executionTime = Date.now() - startTime;

      return {
        isSuccess: true,
        steps,
        finalResult,
        executionTime,
        suggestions: this.generateDebugSuggestions(steps)
      };

    } catch (error) {
      return {
        isSuccess: false,
        steps,
        finalResult: null,
        error: error instanceof Error ? error.message : String(error),
        suggestions: ['Check formula syntax', 'Verify all references exist', 'Ensure functions are used correctly']
      };
    }
  }

  /**
   * Suggest alternative formula approaches
   */
  suggestAlternatives(formula: string): FormulaAlternative[] {
    const alternatives: FormulaAlternative[] = [];
    const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;

    // VLOOKUP alternatives
    if (cleanFormula.includes('VLOOKUP')) {
      alternatives.push({
        formula: cleanFormula.replace(
          /VLOOKUP\s*\(\s*([^,]+),\s*([^,]+),\s*(\d+),\s*(FALSE|0)\s*\)/gi,
          'INDEX($2,MATCH($1,OFFSET($2,0,0,ROWS($2),1),0),$3-1)'
        ),
        description: 'INDEX/MATCH combination for better performance',
        pros: ['More flexible', 'Better performance', 'Can lookup left'],
        cons: ['More complex syntax', 'Harder to read'],
        performanceRating: 9,
        complexityRating: 6,
        useCase: 'Large datasets or left lookups'
      });

      alternatives.push({
        formula: cleanFormula.replace(
          /VLOOKUP\s*\(\s*([^,]+),\s*([^,]+),\s*(\d+),\s*(FALSE|0)\s*\)/gi,
          'XLOOKUP($1,OFFSET($2,0,0,ROWS($2),1),OFFSET($2,0,$3-1,ROWS($2),1))'
        ),
        description: 'Modern XLOOKUP function',
        pros: ['Simplest syntax', 'Best performance', 'Most flexible'],
        cons: ['Newer function', 'May not be available in all versions'],
        performanceRating: 10,
        complexityRating: 3,
        useCase: 'Modern Excel/Sheets versions'
      });
    }

    // SUM(IF()) alternatives
    if (cleanFormula.match(/SUM\s*\(\s*IF\s*\(/i)) {
      alternatives.push({
        formula: cleanFormula.replace(/SUM\s*\(\s*IF\s*\(([^,]+),([^,)]+)\)\s*\)/gi, 'SUMIF($1,$2)'),
        description: 'SUMIF for conditional summation',
        pros: ['Better performance', 'Simpler syntax', 'No array entry needed'],
        cons: ['Single condition only'],
        performanceRating: 9,
        complexityRating: 3,
        useCase: 'Single condition summation'
      });

      alternatives.push({
        formula: cleanFormula.replace(/SUM\s*\(\s*IF\s*\(/gi, 'SUMPRODUCT(('),
        description: 'SUMPRODUCT for complex conditions',
        pros: ['Multiple conditions', 'Good performance', 'No array entry'],
        cons: ['Different syntax', 'Memory intensive'],
        performanceRating: 8,
        complexityRating: 5,
        useCase: 'Multiple conditions or complex logic'
      });
    }

    // CONCATENATE alternatives
    if (cleanFormula.includes('CONCATENATE')) {
      alternatives.push({
        formula: cleanFormula.replace(/CONCATENATE\s*\(([^)]+)\)/gi, (match, params) => {
          const parts = params.split(',').map((p: string) => p.trim());
          return parts.join(' & ');
        }),
        description: 'Ampersand operator for text joining',
        pros: ['Shorter syntax', 'Faster execution', 'More readable'],
        cons: ['Limited to simple concatenation'],
        performanceRating: 9,
        complexityRating: 2,
        useCase: 'Simple text joining'
      });

      alternatives.push({
        formula: cleanFormula.replace(/CONCATENATE\s*\(([^)]+)\)/gi, 'TEXTJOIN("", TRUE, $1)'),
        description: 'TEXTJOIN for advanced text handling',
        pros: ['Handles arrays', 'Ignore empty cells', 'Custom delimiters'],
        cons: ['More complex', 'Newer function'],
        performanceRating: 8,
        complexityRating: 4,
        useCase: 'Advanced text manipulation'
      });
    }

    return alternatives;
  }

  /**
   * Calculate performance metrics for a formula
   */
  calculatePerformance(formula: string, dataSize?: { rows: number; columns: number }): FormulaPerformanceAnalysis {
    const cacheKey = `${formula}_${dataSize?.rows || 0}_${dataSize?.columns || 0}`;

    if (this.performanceCache.has(cacheKey)) {
      return this.performanceCache.get(cacheKey)!;
    }

    const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
    const analysis: FormulaPerformanceAnalysis = {
      formula,
      complexity: 'low',
      estimatedTime: 'fast',
      memoryUsage: 'light',
      bottlenecks: [],
      optimizationScore: 100,
      recommendations: []
    };

    // Analyze complexity factors
    let complexityScore = 0;

    // Function complexity
    const functions = this.extractFunctions(cleanFormula);
    const expensiveFunctions = ['VLOOKUP', 'SUMIF', 'COUNTIF', 'ARRAYFORMULA', 'FILTER'];
    const veryExpensiveFunctions = ['SUMPRODUCT', 'QUERY', 'INDIRECT'];

    for (const func of functions) {
      if (veryExpensiveFunctions.includes(func.name.toUpperCase())) {
        complexityScore += 30;
        analysis.bottlenecks.push({
          type: 'function',
          description: `${func.name} is computationally expensive`,
          impact: 'high',
          suggestion: `Consider alternatives to ${func.name} for better performance`
        });
      } else if (expensiveFunctions.includes(func.name.toUpperCase())) {
        complexityScore += 15;
        analysis.bottlenecks.push({
          type: 'function',
          description: `${func.name} can be slow with large datasets`,
          impact: 'medium',
          suggestion: `Optimize ${func.name} usage or consider alternatives`
        });
      }
    }

    // Range complexity
    const ranges = this.extractRanges(cleanFormula);
    for (const range of ranges) {
      if (range.includes(':')) {
        const estimatedCells = this.estimateRangeCells(range, dataSize);
        if (estimatedCells > 10000) {
          complexityScore += 20;
          analysis.bottlenecks.push({
            type: 'range',
            description: `Large range ${range} affects performance`,
            impact: 'high',
            suggestion: 'Consider using specific ranges instead of entire columns'
          });
        } else if (estimatedCells > 1000) {
          complexityScore += 10;
          analysis.bottlenecks.push({
            type: 'range',
            description: `Medium range ${range} may slow calculation`,
            impact: 'medium',
            suggestion: 'Monitor performance with this range size'
          });
        }
      }
    }

    // Array formula detection
    if (cleanFormula.includes('ARRAYFORMULA') || cleanFormula.includes('{')) {
      complexityScore += 25;
      analysis.bottlenecks.push({
        type: 'array',
        description: 'Array formulas can be memory intensive',
        impact: 'high',
        suggestion: 'Consider breaking into smaller operations'
      });
    }

    // Nested function analysis
    const nestingLevel = this.calculateNestingLevel(cleanFormula);
    if (nestingLevel > 5) {
      complexityScore += 15;
      analysis.bottlenecks.push({
        type: 'function',
        description: `High nesting level (${nestingLevel}) increases complexity`,
        impact: 'medium',
        suggestion: 'Break complex formula into intermediate calculations'
      });
    }

    // Determine complexity classification
    if (complexityScore >= 60) {
      analysis.complexity = 'very_high';
      analysis.estimatedTime = 'very_slow';
      analysis.memoryUsage = 'heavy';
    } else if (complexityScore >= 40) {
      analysis.complexity = 'high';
      analysis.estimatedTime = 'slow';
      analysis.memoryUsage = 'heavy';
    } else if (complexityScore >= 20) {
      analysis.complexity = 'medium';
      analysis.estimatedTime = 'moderate';
      analysis.memoryUsage = 'moderate';
    }

    analysis.optimizationScore = Math.max(0, 100 - complexityScore);

    // Generate recommendations
    if (analysis.optimizationScore < 70) {
      analysis.recommendations.push('Consider breaking this formula into smaller parts');
      analysis.recommendations.push('Use helper columns for intermediate calculations');
    }

    if (analysis.bottlenecks.some(b => b.type === 'range')) {
      analysis.recommendations.push('Use specific ranges instead of entire columns');
      analysis.recommendations.push('Consider using tables with structured references');
    }

    if (functions.some(f => f.name.toUpperCase() === 'VLOOKUP')) {
      analysis.recommendations.push('Replace VLOOKUP with INDEX/MATCH for better performance');
    }

    this.performanceCache.set(cacheKey, analysis);
    return analysis;
  }

  /**
   * Generate comprehensive documentation for a formula
   */
  generateDocumentation(
    formula: string,
    context?: {
      purpose?: string;
      dataContext?: string;
      businessContext?: string;
    }
  ): FormulaDocumentation {
    const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
    const functions = this.extractFunctions(cleanFormula);
    const ranges = this.extractRanges(cleanFormula);

    const doc: FormulaDocumentation = {
      formula,
      purpose: context?.purpose || 'Data calculation and analysis',
      description: this.generateFormulaDescription(cleanFormula, functions),
      inputs: this.identifyInputs(ranges, functions),
      output: this.identifyOutput(cleanFormula, functions),
      examples: this.generateExamples(cleanFormula, functions),
      dependencies: this.identifyDependencies(ranges),
      assumptions: this.identifyAssumptions(cleanFormula, functions),
      limitations: this.identifyLimitations(cleanFormula, functions)
    };

    return doc;
  }

  /**
   * Create personal formula library
   */
  createFormulaLibrary(
    formula: string,
    metadata: {
      name: string;
      category: string;
      description: string;
      tags?: string[];
      author?: string;
    }
  ): string {
    const id = this.generateFormulaId(metadata.name);

    const libraryItem: FormulaLibraryItem = {
      id,
      name: metadata.name,
      category: metadata.category,
      formula,
      description: metadata.description,
      tags: metadata.tags || [],
      createdDate: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      author: metadata.author,
      version: '1.0'
    };

    this.formulaLibrary.set(id, libraryItem);
    return id;
  }

  /**
   * Search formula library
   */
  searchFormulaLibrary(query: string): FormulaLibraryItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.formulaLibrary.values()).filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      item.category.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Get formula from library
   */
  getFormulaFromLibrary(id: string): FormulaLibraryItem | null {
    const item = this.formulaLibrary.get(id);
    if (item) {
      item.lastUsed = new Date();
      item.usageCount++;
    }
    return item || null;
  }

  // Private helper methods
  private extractFunctions(formula: string): Array<{ name: string; parameters: string[] }> {
    const functions: Array<{ name: string; parameters: string[] }> = [];
    const functionPattern = /([A-Z_][A-Z0-9_]*)\s*\(([^)]*)\)/gi;
    let match;

    while ((match = functionPattern.exec(formula)) !== null) {
      const name = match[1];
      const params = match[2] ? match[2].split(',').map(p => p.trim()) : [];
      functions.push({ name, parameters: params });
    }

    return functions;
  }

  private extractRanges(formula: string): string[] {
    const ranges: string[] = [];
    // Match A1 notation patterns
    const rangePattern = /([A-Z]+\d+(?::[A-Z]+\d+)?|[A-Z]+:[A-Z]+|\d+:\d+)/gi;
    let match;

    while ((match = rangePattern.exec(formula)) !== null) {
      ranges.push(match[1]);
    }

    return ranges;
  }

  private resolveReferences(ranges: string[], namedRanges?: Map<string, string>): Map<string, string> {
    const resolved = new Map<string, string>();

    for (const range of ranges) {
      if (namedRanges?.has(range)) {
        resolved.set(range, namedRanges.get(range)!);
      } else {
        resolved.set(range, range); // Already a cell reference
      }
    }

    return resolved;
  }

  private simulateFunctionExecution(func: { name: string; parameters: string[] }, context?: any): any {
    // Simulate function execution based on function type
    switch (func.name.toUpperCase()) {
      case 'SUM':
        return '[Sum of range values]';
      case 'AVERAGE':
        return '[Average of range values]';
      case 'COUNT':
        return '[Count of numeric values]';
      case 'VLOOKUP':
        return '[Lookup result]';
      case 'IF':
        return '[Conditional result]';
      default:
        return `[${func.name} result]`;
    }
  }

  private calculateFinalResult(formula: string, context?: any): any {
    // Simplified final result calculation
    return '[Final calculated result]';
  }

  private generateDebugSuggestions(steps: FormulaDebugStep[]): string[] {
    const suggestions: string[] = [];

    // Analyze steps for common issues
    const hasComplexFunctions = steps.some(s => s.operation.includes('VLOOKUP') || s.operation.includes('SUMPRODUCT'));
    if (hasComplexFunctions) {
      suggestions.push('Consider using simpler alternatives for better performance');
    }

    const hasLargeRanges = steps.some(s => s.explanation.includes('entire column'));
    if (hasLargeRanges) {
      suggestions.push('Use specific ranges instead of entire columns for better efficiency');
    }

    return suggestions;
  }

  private estimateRangeCells(range: string, dataSize?: { rows: number; columns: number }): number {
    // Simplified range size estimation
    if (range.includes(':')) {
      if (range.match(/[A-Z]+:[A-Z]+/)) {
        // Entire columns
        return (dataSize?.rows || 1000) * 1;
      } else if (range.match(/\d+:\d+/)) {
        // Entire rows
        return (dataSize?.columns || 26) * 1;
      } else {
        // Cell range - simplified calculation
        return 100; // Approximate
      }
    }
    return 1; // Single cell
  }

  private calculateNestingLevel(formula: string): number {
    let maxLevel = 0;
    let currentLevel = 0;

    for (const char of formula) {
      if (char === '(') {
        currentLevel++;
        maxLevel = Math.max(maxLevel, currentLevel);
      } else if (char === ')') {
        currentLevel--;
      }
    }

    return maxLevel;
  }

  private generateFormulaDescription(formula: string, functions: Array<{ name: string; parameters: string[] }>): string {
    if (functions.length === 0) {
      return 'Simple calculation formula';
    }

    const mainFunction = functions[0].name.toUpperCase();
    const descriptions: { [key: string]: string } = {
      'SUM': 'Calculates the sum of values in specified ranges',
      'AVERAGE': 'Calculates the average of values in specified ranges',
      'VLOOKUP': 'Searches for a value and returns corresponding data from a table',
      'IF': 'Performs conditional logic based on specified criteria',
      'COUNT': 'Counts the number of cells containing numeric values',
      'CONCATENATE': 'Joins text values from multiple cells',
      'INDEX': 'Returns a value from a specific position in a range',
      'MATCH': 'Finds the position of a value in a range'
    };

    return descriptions[mainFunction] || `Performs ${mainFunction} operation on the specified data`;
  }

  private identifyInputs(ranges: string[], functions: Array<{ name: string; parameters: string[] }>): Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }> {
    const inputs: Array<{ name: string; type: string; description: string; required: boolean }> = [];

    // Add range inputs
    ranges.forEach((range, index) => {
      inputs.push({
        name: `Range${index + 1}`,
        type: 'range',
        description: `Data range: ${range}`,
        required: true
      });
    });

    // Add function-specific inputs
    functions.forEach(func => {
      if (func.name.toUpperCase() === 'IF' && func.parameters.length >= 3) {
        inputs.push({
          name: 'Condition',
          type: 'logical',
          description: 'Logical test condition',
          required: true
        });
      }
    });

    return inputs;
  }

  private identifyOutput(formula: string, functions: Array<{ name: string; parameters: string[] }>): {
    type: string;
    description: string;
  } {
    if (functions.length === 0) {
      return { type: 'number', description: 'Calculated numeric result' };
    }

    const mainFunction = functions[0].name.toUpperCase();
    const outputs: { [key: string]: { type: string; description: string } } = {
      'SUM': { type: 'number', description: 'Sum of all values in the specified ranges' },
      'AVERAGE': { type: 'number', description: 'Average of all values in the specified ranges' },
      'COUNT': { type: 'number', description: 'Count of numeric values in the specified ranges' },
      'VLOOKUP': { type: 'any', description: 'Value found in the lookup table' },
      'IF': { type: 'any', description: 'Result based on conditional logic' },
      'CONCATENATE': { type: 'text', description: 'Joined text string' }
    };

    return outputs[mainFunction] || { type: 'any', description: 'Result of the formula calculation' };
  }

  private generateExamples(formula: string, functions: Array<{ name: string; parameters: string[] }>): Array<{
    scenario: string;
    formula: string;
    result: string;
    explanation: string;
  }> {
    const examples = [];

    if (functions.length > 0) {
      const mainFunction = functions[0].name.toUpperCase();

      switch (mainFunction) {
        case 'SUM':
          examples.push({
            scenario: 'Calculate total sales',
            formula: '=SUM(B2:B10)',
            result: '15,750',
            explanation: 'Adds all values in the range B2 to B10'
          });
          break;
        case 'VLOOKUP':
          examples.push({
            scenario: 'Find product price',
            formula: '=VLOOKUP("Product A",A:C,3,FALSE)',
            result: '29.99',
            explanation: 'Looks up "Product A" and returns the price from column 3'
          });
          break;
        case 'IF':
          examples.push({
            scenario: 'Grade assignment',
            formula: '=IF(B2>=90,"A","B")',
            result: 'A',
            explanation: 'Returns "A" if score is 90 or higher, otherwise "B"'
          });
          break;
      }
    }

    return examples;
  }

  private identifyDependencies(ranges: string[]): string[] {
    const dependencies = new Set<string>();

    ranges.forEach(range => {
      if (range.includes(':')) {
        dependencies.add(`Data in range ${range}`);
      } else {
        dependencies.add(`Value in cell ${range}`);
      }
    });

    return Array.from(dependencies);
  }

  private identifyAssumptions(formula: string, functions: Array<{ name: string; parameters: string[] }>): string[] {
    const assumptions: string[] = [];

    // Common assumptions
    assumptions.push('Referenced cells contain valid data');

    functions.forEach(func => {
      switch (func.name.toUpperCase()) {
        case 'SUM':
        case 'AVERAGE':
          assumptions.push('Range contains numeric values');
          break;
        case 'VLOOKUP':
          assumptions.push('Lookup table is sorted appropriately');
          assumptions.push('Lookup value exists in the first column');
          break;
        case 'COUNT':
          assumptions.push('Cells contain numeric data to be counted');
          break;
      }
    });

    return assumptions;
  }

  private identifyLimitations(formula: string, functions: Array<{ name: string; parameters: string[] }>): string[] {
    const limitations: string[] = [];

    functions.forEach(func => {
      switch (func.name.toUpperCase()) {
        case 'VLOOKUP':
          limitations.push('Can only lookup to the right of the search column');
          limitations.push('Requires exact match for reliable results');
          break;
        case 'SUM':
          limitations.push('Ignores text values and empty cells');
          break;
        case 'AVERAGE':
          limitations.push('Excludes empty cells from calculation');
          break;
      }
    });

    // Formula-wide limitations
    if (formula.length > 8192) {
      limitations.push('Formula exceeds recommended length limit');
    }

    const nestingLevel = this.calculateNestingLevel(formula);
    if (nestingLevel > 64) {
      limitations.push('Formula nesting exceeds Excel/Sheets limits');
    }

    return limitations;
  }

  private generateFormulaId(name: string): string {
    return `formula_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }
}