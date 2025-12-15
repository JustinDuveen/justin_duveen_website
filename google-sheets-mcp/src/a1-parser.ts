/**
 * Enterprise-grade A1 notation parser for Google Sheets
 * Handles all edge cases and provides proper GridRange objects
 */

export interface GridRange {
  sheetId?: number;
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

export interface ParsedRange {
  sheetName?: string;
  sheetId?: number;
  range: GridRange;
  isValid: boolean;
  error?: string;
  originalNotation: string;
}

export interface CellReference {
  column: string;
  row: number;
  isAbsolute: {
    column: boolean;
    row: boolean;
  };
}

export class A1NotationParser {
  private sheetNameToIdMap: Map<string, number> = new Map();
  private namedRanges: Map<string, string> = new Map();

  constructor() {
    // Initialize with common patterns
  }

  /**
   * Update sheet mapping from spreadsheet metadata
   */
  updateSheetMapping(sheets: Array<{properties: {title: string, sheetId: number}}>) {
    this.sheetNameToIdMap.clear();
    sheets.forEach(sheet => {
      if (sheet.properties) {
        this.sheetNameToIdMap.set(sheet.properties.title, sheet.properties.sheetId);
      }
    });
  }

  /**
   * Add named range mapping
   */
  addNamedRange(name: string, a1Notation: string) {
    this.namedRanges.set(name, a1Notation);
  }

  /**
   * Parse A1 notation into GridRange object
   * Supports:
   * - "A1" - Single cell
   * - "A1:B10" - Range
   * - "Sheet1!A1:B10" - Sheet with range
   * - "'Complex Sheet Name'!A1:B10" - Quoted sheet names
   * - "$A$1:B10" - Absolute references
   * - "A:A" - Full column
   * - "1:1" - Full row
   * - "NamedRange" - Named ranges
   */
  parse(notation: string): ParsedRange {
    const result: ParsedRange = {
      range: {},
      isValid: false,
      originalNotation: notation
    };

    try {
      // Handle named ranges first
      if (this.namedRanges.has(notation)) {
        return this.parse(this.namedRanges.get(notation)!);
      }

      // Clean and validate input
      const cleanNotation = notation.trim();
      if (!cleanNotation) {
        result.error = "Empty notation";
        return result;
      }

      // Split sheet name and range
      const {sheetName, rangeNotation} = this.parseSheetAndRange(cleanNotation);

      if (sheetName) {
        result.sheetName = sheetName;
        result.sheetId = this.sheetNameToIdMap.get(sheetName);
        result.range.sheetId = result.sheetId;
      }

      // Parse the range notation
      const parsedRange = this.parseRangeNotation(rangeNotation);
      if (!parsedRange.isValid) {
        result.error = parsedRange.error;
        return result;
      }

      result.range = { ...result.range, ...parsedRange.range };
      result.isValid = true;

      return result;

    } catch (error) {
      result.error = `Parse error: ${error instanceof Error ? error.message : String(error)}`;
      return result;
    }
  }

  /**
   * Parse sheet name and range from notation
   */
  private parseSheetAndRange(notation: string): {sheetName?: string, rangeNotation: string} {
    // Handle quoted sheet names: 'My Sheet'!A1:B10
    const quotedMatch = notation.match(/^'([^']+)'!(.+)$/);
    if (quotedMatch) {
      return {
        sheetName: quotedMatch[1],
        rangeNotation: quotedMatch[2]
      };
    }

    // Handle unquoted sheet names: Sheet1!A1:B10
    const unquotedMatch = notation.match(/^([^!]+)!(.+)$/);
    if (unquotedMatch) {
      return {
        sheetName: unquotedMatch[1],
        rangeNotation: unquotedMatch[2]
      };
    }

    // No sheet specified
    return { rangeNotation: notation };
  }

  /**
   * Parse range notation (without sheet name)
   */
  private parseRangeNotation(notation: string): {range: GridRange, isValid: boolean, error?: string} {
    // Full column: A:A, B:Z
    if (/^[A-Z]+:[A-Z]+$/.test(notation)) {
      return this.parseFullColumn(notation);
    }

    // Full row: 1:1, 5:10
    if (/^\d+:\d+$/.test(notation)) {
      return this.parseFullRow(notation);
    }

    // Single cell: A1, $A$1
    const singleCellMatch = notation.match(/^(\$?[A-Z]+)(\$?\d+)$/);
    if (singleCellMatch) {
      return this.parseSingleCell(notation);
    }

    // Range: A1:B10, $A$1:B10
    const rangeMatch = notation.match(/^(\$?[A-Z]+)(\$?\d+):(\$?[A-Z]+)(\$?\d+)$/);
    if (rangeMatch) {
      return this.parseRange(notation);
    }

    return {
      range: {},
      isValid: false,
      error: `Invalid range notation: ${notation}`
    };
  }

  /**
   * Parse full column notation (A:A, B:Z)
   */
  private parseFullColumn(notation: string): {range: GridRange, isValid: boolean} {
    const [startCol, endCol] = notation.split(':');

    return {
      range: {
        startColumnIndex: this.columnToIndex(startCol),
        endColumnIndex: this.columnToIndex(endCol) + 1,
        startRowIndex: 0,
        endRowIndex: undefined // Full column
      },
      isValid: true
    };
  }

  /**
   * Parse full row notation (1:1, 5:10)
   */
  private parseFullRow(notation: string): {range: GridRange, isValid: boolean} {
    const [startRow, endRow] = notation.split(':').map(r => parseInt(r));

    return {
      range: {
        startRowIndex: startRow - 1, // Convert to 0-based
        endRowIndex: endRow,
        startColumnIndex: 0,
        endColumnIndex: undefined // Full row
      },
      isValid: true
    };
  }

  /**
   * Parse single cell notation (A1, $A$1)
   */
  private parseSingleCell(notation: string): {range: GridRange, isValid: boolean} {
    const cell = this.parseCell(notation);

    return {
      range: {
        startRowIndex: cell.row - 1, // Convert to 0-based
        endRowIndex: cell.row,
        startColumnIndex: this.columnToIndex(cell.column),
        endColumnIndex: this.columnToIndex(cell.column) + 1
      },
      isValid: true
    };
  }

  /**
   * Parse range notation (A1:B10, $A$1:B10)
   */
  private parseRange(notation: string): {range: GridRange, isValid: boolean} {
    const [startCell, endCell] = notation.split(':');
    const start = this.parseCell(startCell);
    const end = this.parseCell(endCell);

    return {
      range: {
        startRowIndex: start.row - 1, // Convert to 0-based
        endRowIndex: end.row,
        startColumnIndex: this.columnToIndex(start.column),
        endColumnIndex: this.columnToIndex(end.column) + 1
      },
      isValid: true
    };
  }

  /**
   * Parse individual cell reference
   */
  private parseCell(cellNotation: string): CellReference {
    const match = cellNotation.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell notation: ${cellNotation}`);
    }

    return {
      column: match[2],
      row: parseInt(match[4]),
      isAbsolute: {
        column: match[1] === '$',
        row: match[3] === '$'
      }
    };
  }

  /**
   * Convert column letter(s) to 0-based index
   * A=0, B=1, ..., Z=25, AA=26, etc.
   */
  private columnToIndex(column: string): number {
    // Remove $ if present
    const cleanColumn = column.replace('$', '');
    let result = 0;

    for (let i = 0; i < cleanColumn.length; i++) {
      result = result * 26 + (cleanColumn.charCodeAt(i) - 64);
    }

    return result - 1; // Convert to 0-based
  }

  /**
   * Convert 0-based index to column letter(s)
   */
  indexToColumn(index: number): string {
    let result = '';
    let num = index + 1; // Convert to 1-based

    while (num > 0) {
      num--; // Adjust for 0-based alphabet
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }

    return result;
  }

  /**
   * Generate A1 notation from GridRange
   */
  rangeToA1(range: GridRange, sheetName?: string): string {
    let notation = '';

    // Add sheet name if provided
    if (sheetName) {
      // Quote sheet name if it contains spaces or special characters
      const needsQuoting = /[^a-zA-Z0-9_]/.test(sheetName);
      notation += needsQuoting ? `'${sheetName}'!` : `${sheetName}!`;
    }

    // Handle full column
    if (range.startRowIndex === 0 && range.endRowIndex === undefined) {
      const startCol = this.indexToColumn(range.startColumnIndex || 0);
      const endCol = this.indexToColumn((range.endColumnIndex || 1) - 1);
      notation += `${startCol}:${endCol}`;
      return notation;
    }

    // Handle full row
    if (range.startColumnIndex === 0 && range.endColumnIndex === undefined) {
      const startRow = (range.startRowIndex || 0) + 1;
      const endRow = range.endRowIndex || startRow;
      notation += `${startRow}:${endRow}`;
      return notation;
    }

    // Handle cell or range
    const startCol = this.indexToColumn(range.startColumnIndex || 0);
    const startRow = (range.startRowIndex || 0) + 1;

    // Single cell
    if (!range.endRowIndex || !range.endColumnIndex ||
        (range.endRowIndex === startRow && range.endColumnIndex === (range.startColumnIndex || 0) + 1)) {
      notation += `${startCol}${startRow}`;
      return notation;
    }

    // Range
    const endCol = this.indexToColumn((range.endColumnIndex || 1) - 1);
    const endRow = range.endRowIndex;
    notation += `${startCol}${startRow}:${endCol}${endRow}`;

    return notation;
  }

  /**
   * Validate if notation is syntactically correct
   */
  validate(notation: string): {isValid: boolean, error?: string} {
    const parsed = this.parse(notation);
    return {
      isValid: parsed.isValid,
      error: parsed.error
    };
  }

  /**
   * Get suggestions for partial notation
   */
  getSuggestions(partial: string): string[] {
    const suggestions: string[] = [];

    // Sheet name suggestions
    if (partial.includes('!')) {
      const sheetPart = partial.split('!')[0];
      for (const [sheetName] of this.sheetNameToIdMap) {
        if (sheetName.toLowerCase().startsWith(sheetPart.toLowerCase())) {
          suggestions.push(`${sheetName}!A1`);
        }
      }
    } else {
      // Column suggestions
      if (/^[A-Z]*$/.test(partial)) {
        const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        cols.forEach(col => {
          if (col.startsWith(partial)) {
            suggestions.push(`${col}1`);
          }
        });
      }
    }

    // Named range suggestions
    for (const [name] of this.namedRanges) {
      if (name.toLowerCase().startsWith(partial.toLowerCase())) {
        suggestions.push(name);
      }
    }

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }
}