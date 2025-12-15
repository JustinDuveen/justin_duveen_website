export interface SpreadsheetInfo {
  id: string;
  title: string;
  url: string;
  sheets: SheetInfo[];
}

export interface SheetInfo {
  id: number;
  title: string;
  index: number;
  gridProperties: {
    rowCount: number;
    columnCount: number;
  };
}

export interface CellData {
  row: number;
  column: number;
  value: string | number | boolean;
  formattedValue: string;
}

export interface RangeData {
  range: string;
  values: any[][];
  majorDimension: 'ROWS' | 'COLUMNS';
}

export interface ChartSpec {
  title: string;
  chartType: 'COLUMN' | 'BAR' | 'LINE' | 'AREA' | 'PIE' | 'DONUT' | 'SCATTER' | 'COMBO';
  dataRange: string;
  position: {
    sheetId: number;
    overlayPosition: {
      anchorCell: {
        sheetId: number;
        rowIndex: number;
        columnIndex: number;
      };
      offsetXPixels?: number;
      offsetYPixels?: number;
      widthPixels?: number;
      heightPixels?: number;
    };
  };
  legendPosition?: 'BOTTOM' | 'LEFT' | 'RIGHT' | 'TOP' | 'NO_LEGEND';
  titleTextPosition?: 'CENTER' | 'LEFT' | 'RIGHT';
}

export interface PivotTableSpec {
  sourceRange: string;
  destination: {
    sheetId: number;
    rowIndex: number;
    columnIndex: number;
  };
  rows: PivotDimension[];
  columns: PivotDimension[];
  values: PivotValue[];
  filters: PivotDimension[];
}

export interface PivotDimension {
  sourceColumnOffset: number;
  showTotals: boolean;
  sortOrder?: 'ASCENDING' | 'DESCENDING';
}

export interface PivotValue {
  sourceColumnOffset: number;
  summarizeFunction: 'SUM' | 'COUNTA' | 'COUNT' | 'COUNTUNIQUE' | 'AVERAGE' | 'MAX' | 'MIN' | 'MEDIAN' | 'PRODUCT' | 'STDEV' | 'STDEVP' | 'VAR' | 'VARP';
  name?: string;
}

export interface FormatSpec {
  range: string;
  format: {
    backgroundColor?: { red: number; green: number; blue: number; alpha?: number };
    textFormat?: {
      foregroundColor?: { red: number; green: number; blue: number; alpha?: number };
      fontFamily?: string;
      fontSize?: number;
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
    };
    borders?: {
      top?: BorderStyle;
      bottom?: BorderStyle;
      left?: BorderStyle;
      right?: BorderStyle;
    };
    horizontalAlignment?: 'LEFT' | 'CENTER' | 'RIGHT';
    verticalAlignment?: 'TOP' | 'MIDDLE' | 'BOTTOM';
    wrapStrategy?: 'OVERFLOW_CELL' | 'LEGACY_WRAP' | 'CLIP' | 'WRAP';
    numberFormat?: {
      type: 'TEXT' | 'NUMBER' | 'PERCENT' | 'CURRENCY' | 'DATE' | 'TIME' | 'DATE_TIME' | 'SCIENTIFIC';
      pattern?: string;
    };
  };
}

export interface BorderStyle {
  style: 'DOTTED' | 'DASHED' | 'SOLID' | 'SOLID_MEDIUM' | 'SOLID_THICK' | 'DOUBLE';
  color?: { red: number; green: number; blue: number; alpha?: number };
}

export interface FormulaSpec {
  range: string;
  formula: string;
  arrayFormula?: boolean;
}

export interface NamedRange {
  name: string;
  range: string;
  scope?: 'WORKBOOK' | 'SHEET';
  sheetId?: number;
}

export interface ConditionalFormatRule {
  ranges: string[];
  condition: {
    type: 'NUMBER_GREATER' | 'NUMBER_GREATER_THAN_EQ' | 'NUMBER_LESS' | 'NUMBER_LESS_THAN_EQ' |
          'NUMBER_EQ' | 'NUMBER_NOT_EQ' | 'NUMBER_BETWEEN' | 'NUMBER_NOT_BETWEEN' |
          'TEXT_CONTAINS' | 'TEXT_NOT_CONTAINS' | 'TEXT_STARTS_WITH' | 'TEXT_ENDS_WITH' |
          'TEXT_EQ' | 'TEXT_NOT_EQ' | 'DATE_EQ' | 'DATE_BEFORE' | 'DATE_AFTER' |
          'CELL_EMPTY' | 'CELL_NOT_EMPTY' | 'CUSTOM_FORMULA' | 'BLANK' | 'NOT_BLANK';
    values?: any[];
    backgroundColor?: { red: number; green: number; blue: number; alpha?: number };
    textFormat?: {
      foregroundColor?: { red: number; green: number; blue: number; alpha?: number };
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
    };
  };
}

export interface DataValidationRule {
  range: string;
  condition: {
    type: 'NUMBER_GREATER' | 'NUMBER_GREATER_THAN_EQ' | 'NUMBER_LESS' | 'NUMBER_LESS_THAN_EQ' |
          'NUMBER_EQ' | 'NUMBER_NOT_EQ' | 'NUMBER_BETWEEN' | 'NUMBER_NOT_BETWEEN' |
          'TEXT_LENGTH' | 'TEXT_EQ' | 'TEXT_CONTAINS' | 'DATE_EQ' | 'DATE_BEFORE' | 'DATE_AFTER' |
          'DATE_BETWEEN' | 'DATE_NOT_BETWEEN' | 'ONE_OF_RANGE' | 'ONE_OF_LIST' | 'CUSTOM_FORMULA';
    values?: any[];
    strict?: boolean;
  };
  inputMessage?: string;
  helpText?: string;
  showCustomUi?: boolean;
}

export interface FilterCriteria {
  condition: {
    type: 'NUMBER_GREATER' | 'NUMBER_GREATER_THAN_EQ' | 'NUMBER_LESS' | 'NUMBER_LESS_THAN_EQ' |
          'NUMBER_EQ' | 'NUMBER_NOT_EQ' | 'NUMBER_BETWEEN' | 'NUMBER_NOT_BETWEEN' |
          'TEXT_CONTAINS' | 'TEXT_NOT_CONTAINS' | 'TEXT_STARTS_WITH' | 'TEXT_ENDS_WITH' |
          'TEXT_EQ' | 'TEXT_NOT_EQ' | 'BLANK' | 'NOT_BLANK' | 'CUSTOM_FORMULA';
    values?: any[];
  };
}

export interface SortSpec {
  range: string;
  sortSpecs: Array<{
    dimensionIndex: number;
    sortOrder: 'ASCENDING' | 'DESCENDING';
  }>;
}

export interface TableSpec {
  range: string;
  name?: string;
  headers?: boolean;
  style?: {
    tableStyle: 'LIGHT' | 'MEDIUM' | 'DARK';
    showRowStripes?: boolean;
    showColumnStripes?: boolean;
    showFirstColumn?: boolean;
    showLastColumn?: boolean;
  };
}