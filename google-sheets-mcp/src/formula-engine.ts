/**
 * Advanced formula engine with validation, suggestions, and AI assistance
 */

export interface FormulaValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  suggestions?: string[];
  optimizations?: string[];
}

export interface FormulaFunction {
  name: string;
  category: string;
  description: string;
  syntax: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  examples: string[];
  returnType: string;
}

export interface FormulaSuggestion {
  formula: string;
  description: string;
  category: string;
  confidence: number;
  example?: string;
}

export class FormulaEngine {
  private functions: Map<string, FormulaFunction> = new Map();

  constructor() {
    this.initializeFunctions();
  }

  /**
   * Validate a formula for syntax and function usage
   */
  validateFormula(formula: string): FormulaValidationResult {
    const result: FormulaValidationResult = {
      isValid: true,
      warnings: [],
      suggestions: [],
      optimizations: []
    };

    // Remove leading = if present
    const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;

    try {
      // Basic syntax validation
      const syntaxCheck = this.validateSyntax(cleanFormula);
      if (!syntaxCheck.isValid) {
        result.isValid = false;
        result.error = syntaxCheck.error;
        return result;
      }

      // Function validation
      const functionCheck = this.validateFunctions(cleanFormula);
      result.warnings!.push(...functionCheck.warnings);
      result.suggestions!.push(...functionCheck.suggestions);

      // Performance optimization suggestions
      const optimizations = this.suggestOptimizations(cleanFormula);
      result.optimizations!.push(...optimizations);

      return result;

    } catch (error) {
      result.isValid = false;
      result.error = `Validation error: ${error instanceof Error ? error.message : String(error)}`;
      return result;
    }
  }

  /**
   * Suggest formulas based on description
   */
  suggestFormulasFromDescription(description: string, dataRange?: string): FormulaSuggestion[] {
    const suggestions: FormulaSuggestion[] = [];
    const lowerDesc = description.toLowerCase();

    // Mathematical operations
    if (lowerDesc.includes('sum') || lowerDesc.includes('total') || lowerDesc.includes('add')) {
      suggestions.push({
        formula: `=SUM(${dataRange || 'A:A'})`,
        description: 'Sum all values in the range',
        category: 'Math',
        confidence: 0.9,
        example: '=SUM(A1:A10)'
      });

      if (lowerDesc.includes('if') || lowerDesc.includes('condition')) {
        suggestions.push({
          formula: `=SUMIF(${dataRange || 'A:A'},">0")`,
          description: 'Sum values meeting a condition',
          category: 'Conditional Math',
          confidence: 0.8,
          example: '=SUMIF(A1:A10,">100")'
        });
      }
    }

    if (lowerDesc.includes('average') || lowerDesc.includes('mean')) {
      suggestions.push({
        formula: `=AVERAGE(${dataRange || 'A:A'})`,
        description: 'Calculate average of values',
        category: 'Statistics',
        confidence: 0.9,
        example: '=AVERAGE(A1:A10)'
      });
    }

    if (lowerDesc.includes('count')) {
      suggestions.push({
        formula: `=COUNT(${dataRange || 'A:A'})`,
        description: 'Count numeric values',
        category: 'Statistics',
        confidence: 0.9,
        example: '=COUNT(A1:A10)'
      });

      if (lowerDesc.includes('unique') || lowerDesc.includes('distinct')) {
        suggestions.push({
          formula: `=SUMPRODUCT(1/COUNTIF(${dataRange || 'A:A'},${dataRange || 'A:A'}))`,
          description: 'Count unique values',
          category: 'Advanced Statistics',
          confidence: 0.7,
          example: '=SUMPRODUCT(1/COUNTIF(A1:A10,A1:A10))'
        });
      }
    }

    // Lookup operations
    if (lowerDesc.includes('lookup') || lowerDesc.includes('find') || lowerDesc.includes('search')) {
      suggestions.push({
        formula: `=VLOOKUP(lookup_value,table_array,col_index_num,FALSE)`,
        description: 'Vertical lookup in table',
        category: 'Lookup',
        confidence: 0.8,
        example: '=VLOOKUP(A1,B:D,2,FALSE)'
      });

      suggestions.push({
        formula: `=INDEX(return_range,MATCH(lookup_value,lookup_range,0))`,
        description: 'More flexible lookup using INDEX/MATCH',
        category: 'Advanced Lookup',
        confidence: 0.7,
        example: '=INDEX(C:C,MATCH(A1,B:B,0))'
      });
    }

    // Date operations
    if (lowerDesc.includes('date') || lowerDesc.includes('today') || lowerDesc.includes('now')) {
      suggestions.push({
        formula: '=TODAY()',
        description: 'Current date',
        category: 'Date/Time',
        confidence: 0.9,
        example: '=TODAY()'
      });

      if (lowerDesc.includes('age') || lowerDesc.includes('difference')) {
        suggestions.push({
          formula: '=DATEDIF(start_date,end_date,"Y")',
          description: 'Calculate age or date difference',
          category: 'Date/Time',
          confidence: 0.8,
          example: '=DATEDIF(A1,TODAY(),"Y")'
        });
      }
    }

    // Text operations
    if (lowerDesc.includes('text') || lowerDesc.includes('string') || lowerDesc.includes('concatenate')) {
      suggestions.push({
        formula: '=CONCATENATE(text1,text2,...)',
        description: 'Join text values',
        category: 'Text',
        confidence: 0.8,
        example: '=CONCATENATE(A1," ",B1)'
      });

      suggestions.push({
        formula: '=TEXTJOIN(delimiter,ignore_empty,text1,text2,...)',
        description: 'Join text with delimiter',
        category: 'Advanced Text',
        confidence: 0.7,
        example: '=TEXTJOIN(", ",TRUE,A1:A5)'
      });
    }

    // Conditional logic
    if (lowerDesc.includes('if') || lowerDesc.includes('condition') || lowerDesc.includes('case')) {
      suggestions.push({
        formula: '=IF(condition,value_if_true,value_if_false)',
        description: 'Conditional logic',
        category: 'Logic',
        confidence: 0.9,
        example: '=IF(A1>0,"Positive","Non-positive")'
      });

      if (lowerDesc.includes('multiple') || lowerDesc.includes('nested')) {
        suggestions.push({
          formula: '=IFS(condition1,value1,condition2,value2,...)',
          description: 'Multiple conditions',
          category: 'Advanced Logic',
          confidence: 0.8,
          example: '=IFS(A1>90,"A",A1>80,"B",A1>70,"C",TRUE,"F")'
        });
      }
    }

    // Array formulas
    if (lowerDesc.includes('array') || lowerDesc.includes('multiple') || lowerDesc.includes('all')) {
      suggestions.push({
        formula: `=ARRAYFORMULA(formula_expression)`,
        description: 'Apply formula to entire array',
        category: 'Array Functions',
        confidence: 0.7,
        example: '=ARRAYFORMULA(A1:A10*B1:B10)'
      });

      suggestions.push({
        formula: `=FILTER(range,condition)`,
        description: 'Filter data based on condition',
        category: 'Dynamic Arrays',
        confidence: 0.8,
        example: '=FILTER(A1:B10,A1:A10>100)'
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Optimize formula for better performance
   */
  optimizeFormula(formula: string): {optimized: string, improvements: string[]} {
    let optimized = formula;
    const improvements: string[] = [];

    // Replace VLOOKUP with INDEX/MATCH for better performance
    const vlookupPattern = /VLOOKUP\s*\(\s*([^,]+),\s*([^,]+),\s*(\d+),\s*(FALSE|0)\s*\)/gi;
    if (vlookupPattern.test(formula)) {
      optimized = formula.replace(vlookupPattern, (match, lookup, table, col, exact) => {
        improvements.push('Replaced VLOOKUP with INDEX/MATCH for better performance');
        return `INDEX(OFFSET(${table},0,${col}-1,ROWS(${table}),1),MATCH(${lookup},OFFSET(${table},0,0,ROWS(${table}),1),0))`;
      });
    }

    // Suggest SUMPRODUCT instead of array formula multiplication
    if (formula.includes('SUM(') && formula.includes('*') && formula.includes(':')) {
      improvements.push('Consider using SUMPRODUCT instead of SUM with array multiplication');
    }

    // Suggest specific functions over generic ones
    if (formula.includes('SUM(IF(')) {
      improvements.push('Consider using SUMIF or SUMIFS for better performance');
      optimized = optimized.replace(/SUM\(IF\(([^,]+),([^,)]+)\)\)/gi, 'SUMIF($1,$2)');
    }

    return { optimized, improvements };
  }

  /**
   * Explain what a formula does in plain English
   */
  explainFormula(formula: string): string {
    const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;

    // Simple patterns
    if (cleanFormula.match(/^SUM\(([^)]+)\)$/i)) {
      const range = cleanFormula.match(/SUM\(([^)]+)\)/i)?.[1];
      return `Calculate the sum of all values in ${range}`;
    }

    if (cleanFormula.match(/^AVERAGE\(([^)]+)\)$/i)) {
      const range = cleanFormula.match(/AVERAGE\(([^)]+)\)/i)?.[1];
      return `Calculate the average of all values in ${range}`;
    }

    if (cleanFormula.match(/^COUNT\(([^)]+)\)$/i)) {
      const range = cleanFormula.match(/COUNT\(([^)]+)\)/i)?.[1];
      return `Count the number of numeric values in ${range}`;
    }

    if (cleanFormula.match(/^IF\(([^,]+),([^,]+),([^)]+)\)$/i)) {
      const parts = cleanFormula.match(/IF\(([^,]+),([^,]+),([^)]+)\)/i);
      return `If ${parts?.[1]} is true, return ${parts?.[2]}, otherwise return ${parts?.[3]}`;
    }

    // More complex parsing would go here
    return `Complex formula: ${formula}. This formula performs multiple operations that would require detailed analysis.`;
  }

  /**
   * Get function information
   */
  getFunctionInfo(functionName: string): FormulaFunction | null {
    return this.functions.get(functionName.toUpperCase()) || null;
  }

  /**
   * Get all functions in a category
   */
  getFunctionsByCategory(category: string): FormulaFunction[] {
    return Array.from(this.functions.values()).filter(f => f.category === category);
  }

  /**
   * Search functions by name or description
   */
  searchFunctions(query: string): FormulaFunction[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.functions.values()).filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery)
    );
  }

  private validateSyntax(formula: string): {isValid: boolean, error?: string} {
    // Check balanced parentheses
    let openParens = 0;
    let openQuotes = false;

    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];

      if (char === '"') {
        openQuotes = !openQuotes;
      } else if (!openQuotes) {
        if (char === '(') {
          openParens++;
        } else if (char === ')') {
          openParens--;
          if (openParens < 0) {
            return { isValid: false, error: 'Unmatched closing parenthesis' };
          }
        }
      }
    }

    if (openParens > 0) {
      return { isValid: false, error: 'Unmatched opening parenthesis' };
    }

    if (openQuotes) {
      return { isValid: false, error: 'Unclosed quote' };
    }

    return { isValid: true };
  }

  private validateFunctions(formula: string): {warnings: string[], suggestions: string[]} {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Extract function calls
    const functionPattern = /([A-Z_][A-Z0-9_]*)\s*\(/gi;
    const matches = formula.matchAll(functionPattern);

    for (const match of matches) {
      const functionName = match[1].toUpperCase();
      const functionInfo = this.functions.get(functionName);

      if (!functionInfo) {
        warnings.push(`Unknown function: ${functionName}`);
      } else {
        // Check for deprecated functions
        if (functionName === 'VLOOKUP') {
          suggestions.push('Consider using INDEX/MATCH instead of VLOOKUP for better performance');
        }
      }
    }

    return { warnings, suggestions };
  }

  private suggestOptimizations(formula: string): string[] {
    const optimizations: string[] = [];

    // Check for inefficient patterns
    if (formula.includes('VLOOKUP') && formula.includes('FALSE')) {
      optimizations.push('Replace VLOOKUP with INDEX/MATCH for better performance');
    }

    if (formula.match(/SUM\(.*IF\(/)) {
      optimizations.push('Use SUMIF or SUMIFS instead of SUM with IF');
    }

    if (formula.includes('CONCATENATE(')) {
      optimizations.push('Use the & operator or TEXTJOIN for simpler text concatenation');
    }

    return optimizations;
  }

  private initializeFunctions(): void {
    // Math functions
    this.functions.set('SUM', {
      name: 'SUM',
      category: 'Math',
      description: 'Adds all numbers in a range',
      syntax: 'SUM(number1, [number2], ...)',
      parameters: [
        { name: 'number1', type: 'number', required: true, description: 'First number or range' },
        { name: 'number2', type: 'number', required: false, description: 'Additional numbers or ranges' }
      ],
      examples: ['=SUM(A1:A10)', '=SUM(1,2,3)', '=SUM(A1:A5,C1:C5)'],
      returnType: 'number'
    });

    this.functions.set('AVERAGE', {
      name: 'AVERAGE',
      category: 'Statistics',
      description: 'Calculates the average of numbers',
      syntax: 'AVERAGE(number1, [number2], ...)',
      parameters: [
        { name: 'number1', type: 'number', required: true, description: 'First number or range' },
        { name: 'number2', type: 'number', required: false, description: 'Additional numbers or ranges' }
      ],
      examples: ['=AVERAGE(A1:A10)', '=AVERAGE(1,2,3,4,5)'],
      returnType: 'number'
    });

    // Add more functions as needed...
    this.functions.set('IF', {
      name: 'IF',
      category: 'Logic',
      description: 'Returns one value if condition is true, another if false',
      syntax: 'IF(logical_test, value_if_true, value_if_false)',
      parameters: [
        { name: 'logical_test', type: 'boolean', required: true, description: 'Condition to test' },
        { name: 'value_if_true', type: 'any', required: true, description: 'Value returned if condition is true' },
        { name: 'value_if_false', type: 'any', required: true, description: 'Value returned if condition is false' }
      ],
      examples: ['=IF(A1>0,"Positive","Not positive")', '=IF(B1="","Empty",B1)'],
      returnType: 'any'
    });

    // Lookup functions
    this.functions.set('VLOOKUP', {
      name: 'VLOOKUP',
      category: 'Lookup',
      description: 'Searches for value in first column and returns value from specified column',
      syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, range_lookup)',
      parameters: [
        { name: 'lookup_value', type: 'any', required: true, description: 'Value to search for' },
        { name: 'table_array', type: 'range', required: true, description: 'Table to search in' },
        { name: 'col_index_num', type: 'number', required: true, description: 'Column number to return value from' },
        { name: 'range_lookup', type: 'boolean', required: false, description: 'TRUE for approximate match, FALSE for exact match' }
      ],
      examples: ['=VLOOKUP(A1,B:D,2,FALSE)', '=VLOOKUP("Product",A:C,3,0)'],
      returnType: 'any'
    });

    this.functions.set('INDEX', {
      name: 'INDEX',
      category: 'Lookup',
      description: 'Returns value at intersection of specified row and column',
      syntax: 'INDEX(array, row_num, [column_num])',
      parameters: [
        { name: 'array', type: 'range', required: true, description: 'Range or array' },
        { name: 'row_num', type: 'number', required: true, description: 'Row number' },
        { name: 'column_num', type: 'number', required: false, description: 'Column number' }
      ],
      examples: ['=INDEX(A:C,5,2)', '=INDEX(A1:A10,3)'],
      returnType: 'any'
    });

    this.functions.set('MATCH', {
      name: 'MATCH',
      category: 'Lookup',
      description: 'Returns position of value in array',
      syntax: 'MATCH(lookup_value, lookup_array, match_type)',
      parameters: [
        { name: 'lookup_value', type: 'any', required: true, description: 'Value to search for' },
        { name: 'lookup_array', type: 'range', required: true, description: 'Array to search in' },
        { name: 'match_type', type: 'number', required: false, description: '0 for exact match, 1 for largest value less than or equal to, -1 for smallest value greater than or equal to' }
      ],
      examples: ['=MATCH("Apple",A:A,0)', '=MATCH(100,B:B,1)'],
      returnType: 'number'
    });
  }
}