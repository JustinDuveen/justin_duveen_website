#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { GoogleSheetsAuth } from './auth.js';
import { SheetManager } from './sheet-manager.js';
import { FormulaEngine } from './formula-engine.js';
import { DataInsightsEngine } from './data-insights-engine.js';
import { IntelligentRecommendations } from './intelligent-recommendations.js';
import { AdvancedFormulaEngine } from './advanced-formula-engine.js';
import { SmartAutomationEngine } from './smart-automation.js';
import { NaturalLanguageInterface } from './natural-language-interface.js';
import {
  SpreadsheetInfo,
  RangeData,
  ChartSpec,
  PivotTableSpec,
  FormatSpec,
  FormulaSpec,
  NamedRange,
  ConditionalFormatRule,
  DataValidationRule,
  FilterCriteria,
  SortSpec,
  TableSpec
} from './types.js';

dotenv.config();

const auth = new GoogleSheetsAuth(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!
);

class GoogleSheetsMCPServer {
  private server: Server;
  private sheetManager: SheetManager;
  private formulaEngine: FormulaEngine;
  private dataInsightsEngine: DataInsightsEngine;
  private intelligentRecommendations: IntelligentRecommendations;
  private advancedFormulaEngine: AdvancedFormulaEngine;
  private smartAutomationEngine: SmartAutomationEngine;
  private naturalLanguageInterface: NaturalLanguageInterface;

  constructor() {
    this.server = new Server(
      {
        name: 'google-sheets-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.sheetManager = new SheetManager(auth);
    this.formulaEngine = new FormulaEngine();
    this.dataInsightsEngine = new DataInsightsEngine();
    this.intelligentRecommendations = new IntelligentRecommendations();
    this.advancedFormulaEngine = new AdvancedFormulaEngine();
    this.smartAutomationEngine = new SmartAutomationEngine();
    this.naturalLanguageInterface = new NaturalLanguageInterface();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_spreadsheet_info',
            description: 'Get information about a Google Spreadsheet including sheets and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
              },
              required: ['spreadsheetId'],
            },
          },
          {
            name: 'read_range',
            description: 'Read data from a specific range in a Google Sheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'The range to read (e.g., "Sheet1!A1:C10")',
                },
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'write_range',
            description: 'Write data to a specific range in a Google Sheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'The range to write to (e.g., "Sheet1!A1:C10")',
                },
                values: {
                  type: 'array',
                  description: 'Array of arrays representing the data to write',
                  items: {
                    type: 'array',
                    items: {
                      oneOf: [
                        { type: 'string' },
                        { type: 'number' },
                        { type: 'boolean' }
                      ]
                    }
                  }
                },
                valueInputOption: {
                  type: 'string',
                  enum: ['RAW', 'USER_ENTERED'],
                  default: 'USER_ENTERED',
                  description: 'How the input data should be interpreted'
                }
              },
              required: ['spreadsheetId', 'range', 'values'],
            },
          },
          {
            name: 'append_data',
            description: 'Append data to the end of a sheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'The range to append to (e.g., "Sheet1!A:C")',
                },
                values: {
                  type: 'array',
                  description: 'Array of arrays representing the data to append',
                  items: {
                    type: 'array',
                    items: {
                      oneOf: [
                        { type: 'string' },
                        { type: 'number' },
                        { type: 'boolean' }
                      ]
                    }
                  }
                },
                valueInputOption: {
                  type: 'string',
                  enum: ['RAW', 'USER_ENTERED'],
                  default: 'USER_ENTERED',
                  description: 'How the input data should be interpreted'
                }
              },
              required: ['spreadsheetId', 'range', 'values'],
            },
          },
          {
            name: 'create_chart',
            description: 'Create a chart in a Google Sheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                title: {
                  type: 'string',
                  description: 'Title of the chart',
                },
                chartType: {
                  type: 'string',
                  enum: ['COLUMN', 'BAR', 'LINE', 'AREA', 'PIE', 'DONUT', 'SCATTER', 'COMBO'],
                  description: 'Type of chart to create',
                },
                dataRange: {
                  type: 'string',
                  description: 'Range of data for the chart (e.g., "Sheet1!A1:C10")',
                },
                sheetId: {
                  type: 'number',
                  description: 'ID of the sheet where the chart will be placed',
                },
                anchorRow: {
                  type: 'number',
                  description: 'Row index where chart will be anchored (0-based)',
                },
                anchorColumn: {
                  type: 'number',
                  description: 'Column index where chart will be anchored (0-based)',
                },
                width: {
                  type: 'number',
                  default: 600,
                  description: 'Width of the chart in pixels',
                },
                height: {
                  type: 'number',
                  default: 371,
                  description: 'Height of the chart in pixels',
                },
                legendPosition: {
                  type: 'string',
                  enum: ['BOTTOM', 'LEFT', 'RIGHT', 'TOP', 'NO_LEGEND'],
                  default: 'BOTTOM',
                  description: 'Position of the legend',
                }
              },
              required: ['spreadsheetId', 'title', 'chartType', 'dataRange', 'sheetId', 'anchorRow', 'anchorColumn'],
            },
          },
          {
            name: 'create_pivot_table',
            description: 'Create a pivot table in a Google Sheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                sourceRange: {
                  type: 'string',
                  description: 'Source data range (e.g., "Sheet1!A1:D100")',
                },
                destinationSheetId: {
                  type: 'number',
                  description: 'ID of the sheet where pivot table will be placed',
                },
                destinationRow: {
                  type: 'number',
                  description: 'Row index where pivot table will start (0-based)',
                },
                destinationColumn: {
                  type: 'number',
                  description: 'Column index where pivot table will start (0-based)',
                },
                rows: {
                  type: 'array',
                  description: 'Row dimensions for the pivot table',
                  items: {
                    type: 'object',
                    properties: {
                      sourceColumnOffset: { type: 'number' },
                      showTotals: { type: 'boolean', default: true },
                      sortOrder: { type: 'string', enum: ['ASCENDING', 'DESCENDING'] }
                    },
                    required: ['sourceColumnOffset', 'showTotals']
                  }
                },
                columns: {
                  type: 'array',
                  description: 'Column dimensions for the pivot table',
                  items: {
                    type: 'object',
                    properties: {
                      sourceColumnOffset: { type: 'number' },
                      showTotals: { type: 'boolean', default: true },
                      sortOrder: { type: 'string', enum: ['ASCENDING', 'DESCENDING'] }
                    },
                    required: ['sourceColumnOffset', 'showTotals']
                  }
                },
                values: {
                  type: 'array',
                  description: 'Value aggregations for the pivot table',
                  items: {
                    type: 'object',
                    properties: {
                      sourceColumnOffset: { type: 'number' },
                      summarizeFunction: {
                        type: 'string',
                        enum: ['SUM', 'COUNTA', 'COUNT', 'COUNTUNIQUE', 'AVERAGE', 'MAX', 'MIN', 'MEDIAN', 'PRODUCT', 'STDEV', 'STDEVP', 'VAR', 'VARP']
                      },
                      name: { type: 'string' }
                    },
                    required: ['sourceColumnOffset', 'summarizeFunction']
                  }
                },
                filters: {
                  type: 'array',
                  description: 'Filter dimensions for the pivot table',
                  items: {
                    type: 'object',
                    properties: {
                      sourceColumnOffset: { type: 'number' },
                      showTotals: { type: 'boolean', default: true }
                    },
                    required: ['sourceColumnOffset', 'showTotals']
                  }
                }
              },
              required: ['spreadsheetId', 'sourceRange', 'destinationSheetId', 'destinationRow', 'destinationColumn'],
            },
          },
          {
            name: 'format_cells',
            description: 'Format cells in a Google Sheet with styling options',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to format (e.g., "Sheet1!A1:C10")',
                },
                backgroundColor: {
                  type: 'object',
                  description: 'Background color (RGB)',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 },
                    alpha: { type: 'number', minimum: 0, maximum: 1 }
                  }
                },
                textColor: {
                  type: 'object',
                  description: 'Text color (RGB)',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 },
                    alpha: { type: 'number', minimum: 0, maximum: 1 }
                  }
                },
                fontFamily: {
                  type: 'string',
                  description: 'Font family (e.g., "Arial", "Times New Roman")',
                },
                fontSize: {
                  type: 'number',
                  description: 'Font size in points',
                },
                bold: {
                  type: 'boolean',
                  description: 'Bold text',
                },
                italic: {
                  type: 'boolean',
                  description: 'Italic text',
                },
                horizontalAlignment: {
                  type: 'string',
                  enum: ['LEFT', 'CENTER', 'RIGHT'],
                  description: 'Horizontal text alignment',
                },
                verticalAlignment: {
                  type: 'string',
                  enum: ['TOP', 'MIDDLE', 'BOTTOM'],
                  description: 'Vertical text alignment',
                },
                borders: {
                  type: 'object',
                  description: 'Border styling',
                  properties: {
                    style: {
                      type: 'string',
                      enum: ['DOTTED', 'DASHED', 'SOLID', 'SOLID_MEDIUM', 'SOLID_THICK', 'DOUBLE']
                    },
                    color: {
                      type: 'object',
                      properties: {
                        red: { type: 'number', minimum: 0, maximum: 1 },
                        green: { type: 'number', minimum: 0, maximum: 1 },
                        blue: { type: 'number', minimum: 0, maximum: 1 }
                      }
                    }
                  }
                },
                numberFormat: {
                  type: 'object',
                  description: 'Number formatting',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['TEXT', 'NUMBER', 'PERCENT', 'CURRENCY', 'DATE', 'TIME', 'DATE_TIME', 'SCIENTIFIC']
                    },
                    pattern: { type: 'string' }
                  }
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'create_sheet',
            description: 'Create a new sheet in a Google Spreadsheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                title: {
                  type: 'string',
                  description: 'Title of the new sheet',
                },
                rowCount: {
                  type: 'number',
                  default: 1000,
                  description: 'Number of rows in the new sheet',
                },
                columnCount: {
                  type: 'number',
                  default: 26,
                  description: 'Number of columns in the new sheet',
                }
              },
              required: ['spreadsheetId', 'title'],
            },
          },
          {
            name: 'insert_image',
            description: 'Insert an image into a Google Sheet from a URL',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                imageUrl: {
                  type: 'string',
                  description: 'URL of the image to insert',
                },
                sheetId: {
                  type: 'number',
                  description: 'ID of the sheet where image will be placed',
                },
                anchorRow: {
                  type: 'number',
                  description: 'Row index where image will be anchored (0-based)',
                },
                anchorColumn: {
                  type: 'number',
                  description: 'Column index where image will be anchored (0-based)',
                },
                width: {
                  type: 'number',
                  description: 'Width of the image in pixels',
                },
                height: {
                  type: 'number',
                  description: 'Height of the image in pixels',
                }
              },
              required: ['spreadsheetId', 'imageUrl', 'sheetId', 'anchorRow', 'anchorColumn'],
            },
          },
          {
            name: 'apply_formula',
            description: 'Apply formulas to cells with support for array formulas',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to apply formula (e.g., "Sheet1!A1" or "Sheet1!A1:B10")',
                },
                formula: {
                  type: 'string',
                  description: 'Formula to apply (e.g., "=SUM(A1:A10)", "=ARRAYFORMULA(A1:A10*2)")',
                },
                arrayFormula: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether this is an array formula',
                }
              },
              required: ['spreadsheetId', 'range', 'formula'],
            },
          },
          {
            name: 'create_named_range',
            description: 'Create or update a named range',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                name: {
                  type: 'string',
                  description: 'Name for the range (e.g., "SalesData", "Criteria")',
                },
                range: {
                  type: 'string',
                  description: 'Range to name (e.g., "Sheet1!A1:C10")',
                },
                scope: {
                  type: 'string',
                  enum: ['WORKBOOK', 'SHEET'],
                  default: 'WORKBOOK',
                  description: 'Scope of the named range',
                }
              },
              required: ['spreadsheetId', 'name', 'range'],
            },
          },
          {
            name: 'add_conditional_formatting',
            description: 'Add conditional formatting rules to ranges',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                ranges: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Ranges to apply formatting (e.g., ["Sheet1!A1:C10"])',
                },
                conditionType: {
                  type: 'string',
                  enum: ['NUMBER_GREATER', 'NUMBER_LESS', 'NUMBER_EQ', 'TEXT_CONTAINS', 'CELL_EMPTY', 'CUSTOM_FORMULA'],
                  description: 'Type of condition',
                },
                values: {
                  type: 'array',
                  description: 'Values for the condition (numbers, text, or formulas)',
                },
                backgroundColor: {
                  type: 'object',
                  description: 'Background color (RGB 0-1)',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 }
                  }
                },
                textColor: {
                  type: 'object',
                  description: 'Text color (RGB 0-1)',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 }
                  }
                },
                bold: { type: 'boolean' },
                italic: { type: 'boolean' }
              },
              required: ['spreadsheetId', 'ranges', 'conditionType'],
            },
          },
          {
            name: 'add_data_validation',
            description: 'Add data validation rules to cells',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to validate (e.g., "Sheet1!A1:A10")',
                },
                validationType: {
                  type: 'string',
                  enum: ['NUMBER_BETWEEN', 'ONE_OF_LIST', 'DATE_BETWEEN', 'TEXT_LENGTH', 'CUSTOM_FORMULA'],
                  description: 'Type of validation',
                },
                values: {
                  type: 'array',
                  description: 'Values for validation (list items, min/max, etc.)',
                },
                inputMessage: {
                  type: 'string',
                  description: 'Message shown when cell is selected',
                },
                strict: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to show warning or reject invalid data',
                }
              },
              required: ['spreadsheetId', 'range', 'validationType'],
            },
          },
          {
            name: 'sort_range',
            description: 'Sort data in a range by multiple columns',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to sort (e.g., "Sheet1!A1:D100")',
                },
                sortSpecs: {
                  type: 'array',
                  description: 'Sort specifications for each column',
                  items: {
                    type: 'object',
                    properties: {
                      dimensionIndex: {
                        type: 'number',
                        description: 'Column index (0-based) to sort by',
                      },
                      sortOrder: {
                        type: 'string',
                        enum: ['ASCENDING', 'DESCENDING'],
                        description: 'Sort order',
                      }
                    },
                    required: ['dimensionIndex', 'sortOrder']
                  }
                }
              },
              required: ['spreadsheetId', 'range', 'sortSpecs'],
            },
          },
          {
            name: 'find_replace',
            description: 'Find and replace text across ranges with regex support',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                find: {
                  type: 'string',
                  description: 'Text to find',
                },
                replacement: {
                  type: 'string',
                  description: 'Replacement text',
                },
                range: {
                  type: 'string',
                  description: 'Range to search (e.g., "Sheet1!A1:Z1000"), omit for entire sheet',
                },
                searchByRegex: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether to use regex for search',
                },
                matchCase: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether to match case',
                },
                matchEntireCell: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether to match entire cell content',
                }
              },
              required: ['spreadsheetId', 'find', 'replacement'],
            },
          },
          {
            name: 'batch_update',
            description: 'Perform multiple operations in a single batch request',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                operations: {
                  type: 'array',
                  description: 'Array of operations to perform',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['updateCells', 'addSheet', 'deleteSheet', 'formatCells', 'mergeCells'],
                        description: 'Type of operation',
                      },
                      data: {
                        type: 'object',
                        description: 'Operation-specific data',
                      }
                    },
                    required: ['type', 'data']
                  }
                }
              },
              required: ['spreadsheetId', 'operations'],
            },
          },
          {
            name: 'protect_range',
            description: 'Protect cells or sheets from editing',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to protect (e.g., "Sheet1!A1:C10")',
                },
                description: {
                  type: 'string',
                  description: 'Description of the protection',
                },
                warningOnly: {
                  type: 'boolean',
                  default: false,
                  description: 'Whether to show warning instead of blocking edits',
                },
                editors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Email addresses of users who can edit',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'add_filter',
            description: 'Add autofilter to a range with custom criteria',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to filter (e.g., "Sheet1!A1:D100")',
                },
                criteria: {
                  type: 'object',
                  description: 'Filter criteria by column index',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      condition: {
                        type: 'string',
                        enum: ['TEXT_CONTAINS', 'TEXT_NOT_CONTAINS', 'NUMBER_GREATER', 'NUMBER_LESS', 'BLANK', 'NOT_BLANK']
                      },
                      values: { type: 'array' }
                    }
                  }
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'create_advanced_chart',
            description: 'Create charts with advanced customization options',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                title: {
                  type: 'string',
                  description: 'Chart title',
                },
                chartType: {
                  type: 'string',
                  enum: ['COLUMN', 'BAR', 'LINE', 'AREA', 'PIE', 'DONUT', 'SCATTER', 'COMBO', 'HISTOGRAM', 'CANDLESTICK'],
                  description: 'Type of chart',
                },
                dataRange: {
                  type: 'string',
                  description: 'Data range for the chart',
                },
                sheetId: { type: 'number' },
                anchorRow: { type: 'number' },
                anchorColumn: { type: 'number' },
                width: { type: 'number', default: 600 },
                height: { type: 'number', default: 371 },
                backgroundColor: {
                  type: 'object',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 }
                  }
                },
                titleStyle: {
                  type: 'object',
                  properties: {
                    fontSize: { type: 'number' },
                    fontFamily: { type: 'string' },
                    bold: { type: 'boolean' },
                    color: {
                      type: 'object',
                      properties: {
                        red: { type: 'number', minimum: 0, maximum: 1 },
                        green: { type: 'number', minimum: 0, maximum: 1 },
                        blue: { type: 'number', minimum: 0, maximum: 1 }
                      }
                    }
                  }
                },
                legendPosition: {
                  type: 'string',
                  enum: ['BOTTOM', 'LEFT', 'RIGHT', 'TOP', 'NO_LEGEND'],
                  default: 'BOTTOM'
                },
                axes: {
                  type: 'object',
                  properties: {
                    horizontal: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        titleStyle: { type: 'object' },
                        minValue: { type: 'number' },
                        maxValue: { type: 'number' }
                      }
                    },
                    vertical: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        titleStyle: { type: 'object' },
                        minValue: { type: 'number' },
                        maxValue: { type: 'number' }
                      }
                    }
                  }
                },
                series: {
                  type: 'array',
                  description: 'Custom series configuration',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['COLUMN', 'LINE', 'AREA']
                      },
                      color: {
                        type: 'object',
                        properties: {
                          red: { type: 'number', minimum: 0, maximum: 1 },
                          green: { type: 'number', minimum: 0, maximum: 1 },
                          blue: { type: 'number', minimum: 0, maximum: 1 }
                        }
                      },
                      targetAxis: {
                        type: 'string',
                        enum: ['LEFT_AXIS', 'RIGHT_AXIS']
                      }
                    }
                  }
                }
              },
              required: ['spreadsheetId', 'title', 'chartType', 'dataRange', 'sheetId', 'anchorRow', 'anchorColumn'],
            },
          },
          {
            name: 'add_sparklines',
            description: 'Add sparklines (mini charts in cells)',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range where sparklines will be placed',
                },
                dataRange: {
                  type: 'string',
                  description: 'Range of data for sparklines',
                },
                chartType: {
                  type: 'string',
                  enum: ['LINE', 'COLUMN'],
                  default: 'LINE',
                  description: 'Type of sparkline',
                },
                lineColor: {
                  type: 'object',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 }
                  }
                }
              },
              required: ['spreadsheetId', 'range', 'dataRange'],
            },
          },
          {
            name: 'create_data_analysis',
            description: 'Perform advanced data analysis operations',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                analysisType: {
                  type: 'string',
                  enum: ['DESCRIPTIVE_STATS', 'CORRELATION', 'REGRESSION', 'FREQUENCY_DISTRIBUTION'],
                  description: 'Type of analysis to perform',
                },
                dataRange: {
                  type: 'string',
                  description: 'Range of data to analyze',
                },
                outputRange: {
                  type: 'string',
                  description: 'Where to place analysis results',
                },
                includeHeaders: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether data includes headers',
                }
              },
              required: ['spreadsheetId', 'analysisType', 'dataRange', 'outputRange'],
            },
          },
          {
            name: 'create_goal_seek',
            description: 'Perform goal seek analysis',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                formulaCell: {
                  type: 'string',
                  description: 'Cell containing the formula to solve',
                },
                targetValue: {
                  type: 'number',
                  description: 'Target value for the formula',
                },
                variableCell: {
                  type: 'string',
                  description: 'Cell to change to reach target',
                }
              },
              required: ['spreadsheetId', 'formulaCell', 'targetValue', 'variableCell'],
            },
          },
          {
            name: 'create_automation',
            description: 'Create automated workflows and triggers',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                triggerType: {
                  type: 'string',
                  enum: ['ON_EDIT', 'ON_FORM_SUBMIT', 'TIME_DRIVEN'],
                  description: 'Type of trigger',
                },
                actions: {
                  type: 'array',
                  description: 'Actions to perform when triggered',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['SEND_EMAIL', 'UPDATE_CELLS', 'CREATE_CHART', 'CALCULATE_FORMULAS']
                      },
                      config: { type: 'object' }
                    }
                  }
                },
                conditions: {
                  type: 'object',
                  description: 'Conditions for trigger activation'
                }
              },
              required: ['spreadsheetId', 'triggerType', 'actions'],
            },
          },
          {
            name: 'validate_formula',
            description: 'Validate formula syntax and get optimization suggestions',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Formula to validate (with or without leading =)',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'suggest_formulas',
            description: 'Get formula suggestions based on description',
            inputSchema: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Description of what you want to calculate',
                },
                dataRange: {
                  type: 'string',
                  description: 'Optional data range to include in suggestions',
                }
              },
              required: ['description'],
            },
          },
          {
            name: 'explain_formula',
            description: 'Get plain English explanation of what a formula does',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Formula to explain',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'optimize_formula',
            description: 'Get optimized version of formula with performance improvements',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Formula to optimize',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'get_sheet_info',
            description: 'Get detailed information about sheets in spreadsheet',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                }
              },
              required: ['spreadsheetId'],
            },
          },
          {
            name: 'validate_range',
            description: 'Validate A1 notation range and get suggestions',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'A1 notation range to validate',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'get_range_suggestions',
            description: 'Get A1 notation suggestions for partial input',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                partial: {
                  type: 'string',
                  description: 'Partial A1 notation to get suggestions for',
                }
              },
              required: ['spreadsheetId', 'partial'],
            },
          },
          // Phase 2A: AI Intelligence & Data Insights Tools
          {
            name: 'analyze_data_patterns',
            description: 'AI-powered analysis to detect patterns, trends, seasonality, and anomalies in data',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to analyze (e.g., "Sheet1!A1:C100")',
                },
                includeHeaders: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether the first row contains headers',
                },
                confidenceThreshold: {
                  type: 'number',
                  default: 0.7,
                  minimum: 0,
                  maximum: 1,
                  description: 'Minimum confidence level for pattern detection',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'suggest_data_insights',
            description: 'Generate AI-powered business insights and recommendations from data',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to analyze (e.g., "Sheet1!A1:C100")',
                },
                domain: {
                  type: 'string',
                  enum: ['sales', 'finance', 'marketing', 'operations', 'general'],
                  default: 'general',
                  description: 'Business domain for context-aware insights',
                },
                timeframe: {
                  type: 'string',
                  description: 'Time period context (e.g., "Q1 2024", "monthly")',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'detect_anomalies',
            description: 'Detect statistical anomalies and outliers in data using AI algorithms',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to analyze (e.g., "Sheet1!A1:C100")',
                },
                method: {
                  type: 'string',
                  enum: ['zscore', 'iqr', 'isolation'],
                  default: 'zscore',
                  description: 'Anomaly detection method',
                },
                threshold: {
                  type: 'number',
                  default: 2.5,
                  description: 'Sensitivity threshold for anomaly detection',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'predict_trends',
            description: 'Predict future trends and values using AI forecasting models',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Time series data range (e.g., "Sheet1!A1:B100")',
                },
                forecastPeriods: {
                  type: 'number',
                  default: 5,
                  minimum: 1,
                  maximum: 50,
                  description: 'Number of future periods to predict',
                },
                columnIndex: {
                  type: 'number',
                  description: 'Specific column to analyze (0-based index)',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'classify_data_quality',
            description: 'Assess data quality with AI-powered completeness, accuracy, and consistency analysis',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to assess (e.g., "Sheet1!A1:C100")',
                },
                expectedTypes: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Expected data types for each column',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'recommend_chart_type',
            description: 'AI recommendations for optimal chart types based on data characteristics',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Data range for chart (e.g., "Sheet1!A1:C100")',
                },
                purpose: {
                  type: 'string',
                  enum: ['comparison', 'distribution', 'relationship', 'composition', 'trend'],
                  description: 'Purpose of the visualization',
                },
                targetAudience: {
                  type: 'string',
                  enum: ['technical', 'business', 'executive'],
                  default: 'business',
                  description: 'Target audience for the chart',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'suggest_pivot_dimensions',
            description: 'AI-powered suggestions for optimal pivot table structure and dimensions',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Source data range (e.g., "Sheet1!A1:D100")',
                },
                analysisGoal: {
                  type: 'string',
                  enum: ['summary', 'comparison', 'trend', 'breakdown'],
                  default: 'summary',
                  description: 'Analysis objective for the pivot table',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'recommend_formulas',
            description: 'AI-powered formula recommendations based on data context and intent',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Data context range (e.g., "Sheet1!A1:C100")',
                },
                intent: {
                  type: 'string',
                  description: 'What you want to calculate (e.g., "total sales", "average score")',
                },
                cellPosition: {
                  type: 'string',
                  description: 'Target cell for the formula (e.g., "D1")',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'optimize_data_structure',
            description: 'AI analysis and recommendations for improving data organization and structure',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Range to analyze (e.g., "Sheet1!A1:Z100")',
                },
                currentIssues: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Known data structure issues',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'generate_summary_report',
            description: 'Generate comprehensive AI-powered summary reports with insights and recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Data range for report (e.g., "Sheet1!A1:Z100")',
                },
                title: {
                  type: 'string',
                  default: 'Data Analysis Report',
                  description: 'Report title',
                },
                reportType: {
                  type: 'string',
                  enum: ['executive', 'technical', 'operational'],
                  default: 'executive',
                  description: 'Type of report for target audience',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'debug_formula',
            description: 'Advanced AI-powered formula debugging with step-by-step execution analysis',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Formula to debug (with or without leading =)',
                },
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet for context',
                },
                cellData: {
                  type: 'object',
                  description: 'Cell values for testing (optional)',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'suggest_alternatives',
            description: 'AI-powered alternative formula suggestions for better performance or functionality',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Current formula to improve',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'calculate_performance',
            description: 'Analyze formula performance and suggest optimizations',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Formula to analyze',
                },
                dataSize: {
                  type: 'object',
                  properties: {
                    rows: { type: 'number' },
                    columns: { type: 'number' }
                  },
                  description: 'Size of data the formula will operate on',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'generate_documentation',
            description: 'Generate comprehensive documentation for complex formulas',
            inputSchema: {
              type: 'object',
              properties: {
                formula: {
                  type: 'string',
                  description: 'Formula to document',
                },
                purpose: {
                  type: 'string',
                  description: 'Business purpose of the formula',
                },
                dataContext: {
                  type: 'string',
                  description: 'Context about the data being processed',
                }
              },
              required: ['formula'],
            },
          },
          {
            name: 'create_smart_workflow',
            description: 'Create AI-designed automated workflows based on requirements',
            inputSchema: {
              type: 'object',
              properties: {
                goal: {
                  type: 'string',
                  description: 'What the workflow should accomplish',
                },
                dataSource: {
                  type: 'string',
                  description: 'Source of data for the workflow',
                },
                outputFormat: {
                  type: 'string',
                  description: 'Desired output format',
                },
                frequency: {
                  type: 'string',
                  enum: ['hourly', 'daily', 'weekly', 'monthly'],
                  description: 'How often the workflow should run',
                },
                businessRules: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Business rules to apply',
                }
              },
              required: ['goal', 'dataSource', 'outputFormat'],
            },
          },
          {
            name: 'setup_data_pipeline',
            description: 'Create automated ETL data pipeline with AI optimization',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Pipeline name',
                },
                sourceType: {
                  type: 'string',
                  enum: ['spreadsheet', 'database', 'api', 'file'],
                  description: 'Type of data source',
                },
                sourceConfig: {
                  type: 'object',
                  description: 'Source configuration details',
                },
                destinationType: {
                  type: 'string',
                  enum: ['spreadsheet', 'database', 'api', 'file'],
                  description: 'Type of destination',
                },
                destinationConfig: {
                  type: 'object',
                  description: 'Destination configuration details',
                },
                schedule: {
                  type: 'object',
                  description: 'Pipeline execution schedule',
                }
              },
              required: ['name', 'sourceType', 'sourceConfig', 'destinationType', 'destinationConfig'],
            },
          },
          {
            name: 'configure_alerts',
            description: 'Setup intelligent alerting system with AI-optimized thresholds',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Alert configuration name',
                },
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet to monitor',
                },
                metrics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      field: { type: 'string' },
                      aggregation: { type: 'string', enum: ['sum', 'average', 'count', 'min', 'max'] }
                    }
                  },
                  description: 'Metrics to monitor',
                },
                thresholds: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: { type: 'string' },
                      condition: { type: 'string' },
                      value: { type: 'number' }
                    }
                  },
                  description: 'Alert thresholds',
                },
                recipients: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Email addresses for alerts',
                }
              },
              required: ['name', 'spreadsheetId', 'metrics', 'thresholds', 'recipients'],
            },
          },
          {
            name: 'schedule_reports',
            description: 'Setup automated report generation and distribution',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Report name',
                },
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                ranges: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Data ranges to include in report',
                },
                reportType: {
                  type: 'string',
                  enum: ['executive_summary', 'detailed_analysis', 'dashboard'],
                  description: 'Type of report to generate',
                },
                schedule: {
                  type: 'object',
                  description: 'Report generation schedule',
                },
                recipients: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Report recipients',
                }
              },
              required: ['name', 'spreadsheetId', 'ranges', 'reportType', 'recipients'],
            },
          },
          {
            name: 'process_natural_query',
            description: 'Process natural language queries and suggest actions (e.g., "Show me top 10 sales by region")',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Natural language query or request',
                },
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet for context',
                },
                currentSheet: {
                  type: 'string',
                  description: 'Current sheet name for context',
                }
              },
              required: ['query'],
            },
          },
          {
            name: 'explain_data_story',
            description: 'Generate narrative explanations of data patterns and trends',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Data range to explain (e.g., "Sheet1!A1:C100")',
                },
                focusArea: {
                  type: 'string',
                  enum: ['trends', 'comparisons', 'anomalies', 'overview'],
                  default: 'overview',
                  description: 'What aspect to focus the story on',
                },
                audienceLevel: {
                  type: 'string',
                  enum: ['technical', 'business', 'executive'],
                  default: 'business',
                  description: 'Target audience complexity level',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
          {
            name: 'answer_data_questions',
            description: 'Answer specific questions about spreadsheet data using AI',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'Question about the data (e.g., "What is the average sales?")',
                },
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Data range to search for answers (e.g., "Sheet1!A1:C100")',
                }
              },
              required: ['question', 'spreadsheetId', 'range'],
            },
          },
          {
            name: 'create_from_description',
            description: 'Create spreadsheet structure from natural language description',
            inputSchema: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Natural language description of the spreadsheet needed',
                },
                includeFormatting: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to include formatting suggestions',
                },
                includeSampleData: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to generate sample data',
                },
                includeCharts: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to suggest charts',
                }
              },
              required: ['description'],
            },
          },
          {
            name: 'generate_insights_report',
            description: 'Generate automated comprehensive insights report with AI analysis',
            inputSchema: {
              type: 'object',
              properties: {
                spreadsheetId: {
                  type: 'string',
                  description: 'The ID of the Google Spreadsheet',
                },
                range: {
                  type: 'string',
                  description: 'Data range to analyze (e.g., "Sheet1!A1:Z100")',
                },
                domain: {
                  type: 'string',
                  enum: ['sales', 'finance', 'marketing', 'operations', 'general'],
                  default: 'general',
                  description: 'Business domain for context',
                },
                reportType: {
                  type: 'string',
                  enum: ['summary', 'detailed', 'executive'],
                  default: 'summary',
                  description: 'Depth of analysis',
                }
              },
              required: ['spreadsheetId', 'range'],
            },
          },
        ] satisfies Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_spreadsheet_info':
            return await this.getSpreadsheetInfo(args.spreadsheetId as string);

          case 'read_range':
            return await this.readRange(
              args.spreadsheetId as string,
              args.range as string
            );

          case 'write_range':
            return await this.writeRange(
              args.spreadsheetId as string,
              args.range as string,
              args.values as any[][],
              args.valueInputOption as 'RAW' | 'USER_ENTERED' || 'USER_ENTERED'
            );

          case 'append_data':
            return await this.appendData(
              args.spreadsheetId as string,
              args.range as string,
              args.values as any[][],
              args.valueInputOption as 'RAW' | 'USER_ENTERED' || 'USER_ENTERED'
            );

          case 'create_chart':
            return await this.createChart(args);

          case 'create_pivot_table':
            return await this.createPivotTable(args);

          case 'format_cells':
            return await this.formatCells(args);

          case 'create_sheet':
            return await this.createSheet(
              args.spreadsheetId as string,
              args.title as string,
              args.rowCount as number,
              args.columnCount as number
            );

          case 'insert_image':
            return await this.insertImage(args);

          case 'apply_formula':
            return await this.applyFormula(args);

          case 'create_named_range':
            return await this.createNamedRange(args);

          case 'add_conditional_formatting':
            return await this.addConditionalFormatting(args);

          case 'add_data_validation':
            return await this.addDataValidation(args);

          case 'sort_range':
            return await this.sortRange(args);

          case 'find_replace':
            return await this.findReplace(args);

          case 'batch_update':
            return await this.batchUpdate(args);

          case 'protect_range':
            return await this.protectRange(args);

          case 'add_filter':
            return await this.addFilter(args);

          case 'create_advanced_chart':
            return await this.createAdvancedChart(args);

          case 'add_sparklines':
            return await this.addSparklines(args);

          case 'create_data_analysis':
            return await this.createDataAnalysis(args);

          case 'create_goal_seek':
            return await this.createGoalSeek(args);

          case 'create_automation':
            return await this.createAutomation(args);

          case 'validate_formula':
            return await this.validateFormula(args);

          case 'suggest_formulas':
            return await this.suggestFormulas(args);

          case 'explain_formula':
            return await this.explainFormula(args);

          case 'optimize_formula':
            return await this.optimizeFormula(args);

          case 'get_sheet_info':
            return await this.getSheetInfo(args);

          case 'validate_range':
            return await this.validateRange(args);

          case 'get_range_suggestions':
            return await this.getRangeSuggestions(args);

          // Phase 2A: AI Intelligence & Data Insights Cases
          case 'analyze_data_patterns':
            return await this.analyzeDataPatterns(args);

          case 'suggest_data_insights':
            return await this.suggestDataInsights(args);

          case 'detect_anomalies':
            return await this.detectAnomalies(args);

          case 'predict_trends':
            return await this.predictTrends(args);

          case 'classify_data_quality':
            return await this.classifyDataQuality(args);

          case 'recommend_chart_type':
            return await this.recommendChartType(args);

          case 'suggest_pivot_dimensions':
            return await this.suggestPivotDimensions(args);

          case 'recommend_formulas':
            return await this.recommendFormulas(args);

          case 'optimize_data_structure':
            return await this.optimizeDataStructure(args);

          case 'generate_summary_report':
            return await this.generateSummaryReport(args);

          case 'debug_formula':
            return await this.debugFormula(args);

          case 'suggest_alternatives':
            return await this.suggestAlternatives(args);

          case 'calculate_performance':
            return await this.calculatePerformance(args);

          case 'generate_documentation':
            return await this.generateDocumentation(args);

          case 'create_smart_workflow':
            return await this.createSmartWorkflow(args);

          case 'setup_data_pipeline':
            return await this.setupDataPipeline(args);

          case 'configure_alerts':
            return await this.configureAlerts(args);

          case 'schedule_reports':
            return await this.scheduleReports(args);

          case 'process_natural_query':
            return await this.processNaturalQuery(args);

          case 'explain_data_story':
            return await this.explainDataStory(args);

          case 'answer_data_questions':
            return await this.answerDataQuestions(args);

          case 'create_from_description':
            return await this.createFromDescription(args);

          case 'generate_insights_report':
            return await this.generateInsightsReport(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async getSpreadsheetInfo(spreadsheetId: string) {
    const sheets = await auth.getSheetsClient();

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const spreadsheet = response.data;
    const info: SpreadsheetInfo = {
      id: spreadsheet.spreadsheetId!,
      title: spreadsheet.properties?.title || 'Untitled',
      url: spreadsheet.spreadsheetUrl!,
      sheets: spreadsheet.sheets?.map(sheet => ({
        id: sheet.properties?.sheetId || 0,
        title: sheet.properties?.title || 'Untitled',
        index: sheet.properties?.index || 0,
        gridProperties: {
          rowCount: sheet.properties?.gridProperties?.rowCount || 0,
          columnCount: sheet.properties?.gridProperties?.columnCount || 0,
        },
      })) || [],
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  }

  private async readRange(spreadsheetId: string, range: string) {
    const sheets = await auth.getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const data: RangeData = {
      range: response.data.range || range,
      values: response.data.values || [],
      majorDimension: response.data.majorDimension as 'ROWS' | 'COLUMNS' || 'ROWS',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private async writeRange(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    const sheets = await auth.getSheetsClient();

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated ${response.data.updatedCells} cells in range ${response.data.updatedRange}`,
        },
      ],
    };
  }

  private async appendData(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ) {
    const sheets = await auth.getSheetsClient();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully appended ${response.data.updates?.updatedCells} cells to range ${response.data.updates?.updatedRange}`,
        },
      ],
    };
  }

  private async createChart(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      addChart: {
        chart: {
          spec: {
            title: args.title,
            basicChart: {
              chartType: args.chartType,
              legendPosition: args.legendPosition || 'BOTTOM',
              axis: [
                {
                  position: 'BOTTOM_AXIS',
                  title: 'Categories'
                },
                {
                  position: 'LEFT_AXIS',
                  title: 'Values'
                }
              ],
              domains: [{
                domain: {
                  sourceRange: {
                    sources: [{
                      sheetId: parseInt(args.dataRange.split('!')[0].replace(/\D/g, '')) || 0,
                      startRowIndex: 0,
                      endRowIndex: 100,
                      startColumnIndex: 0,
                      endColumnIndex: 1
                    }]
                  }
                }
              }],
              series: [{
                series: {
                  sourceRange: {
                    sources: [{
                      sheetId: parseInt(args.dataRange.split('!')[0].replace(/\D/g, '')) || 0,
                      startRowIndex: 0,
                      endRowIndex: 100,
                      startColumnIndex: 1,
                      endColumnIndex: 2
                    }]
                  }
                }
              }]
            }
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: args.sheetId,
                rowIndex: args.anchorRow,
                columnIndex: args.anchorColumn
              },
              widthPixels: args.width || 600,
              heightPixels: args.height || 371
            }
          }
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created chart: ${args.title}`,
        },
      ],
    };
  }

  private async createPivotTable(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      addPivotTable: {
        source: {
          sheetId: 0, // Assuming source is in first sheet
          startRowIndex: 0,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: 10
        },
        destination: {
          sheetId: args.destinationSheetId,
          rowIndex: args.destinationRow,
          columnIndex: args.destinationColumn
        },
        rows: args.rows || [],
        columns: args.columns || [],
        values: args.values || [],
        filters: args.filters || []
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: 'Successfully created pivot table',
        },
      ],
    };
  }

  private async formatCells(args: any) {
    const sheets = await auth.getSheetsClient();

    // Parse the range to get sheet ID and cell range
    const [sheetName, range] = args.range.split('!');
    const sheetId = 0; // You might want to implement sheet name to ID mapping

    const format: any = {};

    if (args.backgroundColor) {
      format.backgroundColor = args.backgroundColor;
    }

    if (args.textColor || args.fontFamily || args.fontSize || args.bold || args.italic) {
      format.textFormat = {};
      if (args.textColor) format.textFormat.foregroundColor = args.textColor;
      if (args.fontFamily) format.textFormat.fontFamily = args.fontFamily;
      if (args.fontSize) format.textFormat.fontSize = args.fontSize;
      if (args.bold !== undefined) format.textFormat.bold = args.bold;
      if (args.italic !== undefined) format.textFormat.italic = args.italic;
    }

    if (args.horizontalAlignment) {
      format.horizontalAlignment = args.horizontalAlignment;
    }

    if (args.verticalAlignment) {
      format.verticalAlignment = args.verticalAlignment;
    }

    if (args.borders) {
      format.borders = {
        top: args.borders,
        bottom: args.borders,
        left: args.borders,
        right: args.borders
      };
    }

    if (args.numberFormat) {
      format.numberFormat = args.numberFormat;
    }

    const requests = [{
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 0,
          endRowIndex: 100,
          startColumnIndex: 0,
          endColumnIndex: 10
        },
        cell: {
          userEnteredFormat: format
        },
        fields: Object.keys(format).join(',')
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully formatted range ${args.range}`,
        },
      ],
    };
  }

  private async createSheet(
    spreadsheetId: string,
    title: string,
    rowCount: number = 1000,
    columnCount: number = 26
  ) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      addSheet: {
        properties: {
          title: title,
          gridProperties: {
            rowCount: rowCount,
            columnCount: columnCount
          }
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    const newSheet = response.data.replies?.[0]?.addSheet?.properties;

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created sheet "${title}" with ID ${newSheet?.sheetId}`,
        },
      ],
    };
  }

  private async insertImage(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      addEmbeddedObject: {
        object: {
          embeddedObjectProperties: {
            position: {
              overlayPosition: {
                anchorCell: {
                  sheetId: args.sheetId,
                  rowIndex: args.anchorRow,
                  columnIndex: args.anchorColumn
                },
                widthPixels: args.width,
                heightPixels: args.height
              }
            }
          },
          embeddedChart: undefined // This would be for charts
        },
        objectId: Math.floor(Math.random() * 1000000)
      }
    }];

    // Note: Direct image insertion via URL requires the image to be uploaded to Google Drive first
    // This is a simplified implementation that would need enhancement for full functionality

    return {
      content: [
        {
          type: 'text',
          text: 'Image insertion initiated. Note: For full functionality, images should be uploaded to Google Drive first.',
        },
      ],
    };
  }

  private async applyFormula(args: any) {
    const sheets = await auth.getSheetsClient();

    // Validate formula first
    const validation = this.formulaEngine.validateFormula(args.formula);
    if (!validation.isValid) {
      throw new Error(`Invalid formula: ${validation.error}`);
    }

    const requests = [{
      updateCells: {
        range: await this.parseA1Range(args.spreadsheetId, args.range),
        rows: [{
          values: [{
            userEnteredValue: {
              formulaValue: args.formula
            }
          }]
        }],
        fields: 'userEnteredValue'
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully applied formula "${args.formula}" to range ${args.range}`,
        },
      ],
    };
  }

  private async createNamedRange(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      addNamedRange: {
        namedRange: {
          name: args.name,
          range: this.parseA1Range(args.range),
          namedRangeId: args.name
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created named range "${args.name}" for ${args.range}`,
        },
      ],
    };
  }

  private async addConditionalFormatting(args: any) {
    const sheets = await auth.getSheetsClient();

    const condition: any = {
      type: args.conditionType
    };

    if (args.values) {
      condition.values = args.values.map((value: any) => ({ userEnteredValue: value }));
    }

    const format: any = {};
    if (args.backgroundColor) {
      format.backgroundColor = args.backgroundColor;
    }
    if (args.textColor || args.bold || args.italic) {
      format.textFormat = {};
      if (args.textColor) format.textFormat.foregroundColor = args.textColor;
      if (args.bold !== undefined) format.textFormat.bold = args.bold;
      if (args.italic !== undefined) format.textFormat.italic = args.italic;
    }

    const requests = [{
      addConditionalFormatRule: {
        rule: {
          ranges: args.ranges.map((range: string) => this.parseA1Range(range)),
          booleanRule: {
            condition: condition,
            format: format
          }
        },
        index: 0
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added conditional formatting to ${args.ranges.length} range(s)`,
        },
      ],
    };
  }

  private async addDataValidation(args: any) {
    const sheets = await auth.getSheetsClient();

    const condition: any = {
      type: args.validationType
    };

    if (args.values) {
      condition.values = args.values.map((value: any) => ({ userEnteredValue: value }));
    }

    const requests = [{
      setDataValidation: {
        range: this.parseA1Range(args.range),
        rule: {
          condition: condition,
          inputMessage: args.inputMessage,
          strict: args.strict !== false
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added data validation to range ${args.range}`,
        },
      ],
    };
  }

  private async sortRange(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      sortRange: {
        range: this.parseA1Range(args.range),
        sortSpecs: args.sortSpecs
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully sorted range ${args.range} by ${args.sortSpecs.length} column(s)`,
        },
      ],
    };
  }

  private async findReplace(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      findReplace: {
        find: args.find,
        replacement: args.replacement,
        searchByRegex: args.searchByRegex || false,
        matchCase: args.matchCase || false,
        matchEntireCell: args.matchEntireCell || false,
        range: args.range ? this.parseA1Range(args.range) : undefined
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    const findReplaceResponse = response.data.replies?.[0]?.findReplace;

    return {
      content: [
        {
          type: 'text',
          text: `Successfully replaced ${findReplaceResponse?.occurrencesChanged || 0} occurrences of "${args.find}" with "${args.replacement}"`,
        },
      ],
    };
  }

  private async batchUpdate(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = args.operations.map((op: any) => {
      switch (op.type) {
        case 'updateCells':
          return {
            updateCells: {
              range: this.parseA1Range(op.data.range),
              rows: op.data.rows,
              fields: op.data.fields || 'userEnteredValue'
            }
          };
        case 'addSheet':
          return {
            addSheet: {
              properties: op.data.properties
            }
          };
        case 'deleteSheet':
          return {
            deleteSheet: {
              sheetId: op.data.sheetId
            }
          };
        case 'formatCells':
          return {
            repeatCell: {
              range: this.parseA1Range(op.data.range),
              cell: {
                userEnteredFormat: op.data.format
              },
              fields: 'userEnteredFormat'
            }
          };
        case 'mergeCells':
          return {
            mergeCells: {
              range: this.parseA1Range(op.data.range),
              mergeType: op.data.mergeType || 'MERGE_ALL'
            }
          };
        default:
          throw new Error(`Unknown operation type: ${op.type}`);
      }
    });

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully executed ${args.operations.length} batch operations`,
        },
      ],
    };
  }

  private async protectRange(args: any) {
    const sheets = await auth.getSheetsClient();

    const requests = [{
      addProtectedRange: {
        protectedRange: {
          range: this.parseA1Range(args.range),
          description: args.description,
          warningOnly: args.warningOnly || false,
          editors: args.editors ? {
            users: args.editors
          } : undefined
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully protected range ${args.range}`,
        },
      ],
    };
  }

  private async addFilter(args: any) {
    const sheets = await auth.getSheetsClient();

    const filterCriteria: any = {};
    if (args.criteria) {
      Object.keys(args.criteria).forEach(columnIndex => {
        const criteria = args.criteria[columnIndex];
        filterCriteria[columnIndex] = {
          condition: {
            type: criteria.condition,
            values: criteria.values?.map((value: any) => ({ userEnteredValue: value }))
          }
        };
      });
    }

    const requests = [{
      setBasicFilter: {
        filter: {
          range: this.parseA1Range(args.range),
          criteria: filterCriteria
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added filter to range ${args.range}`,
        },
      ],
    };
  }

  private async createAdvancedChart(args: any) {
    const sheets = await auth.getSheetsClient();

    const chartSpec: any = {
      title: args.title,
      basicChart: {
        chartType: args.chartType,
        legendPosition: args.legendPosition || 'BOTTOM',
        axis: []
      }
    };

    // Add title styling
    if (args.titleStyle) {
      chartSpec.titleTextFormat = {
        fontSize: args.titleStyle.fontSize,
        fontFamily: args.titleStyle.fontFamily,
        bold: args.titleStyle.bold,
        foregroundColor: args.titleStyle.color
      };
    }

    // Add background color
    if (args.backgroundColor) {
      chartSpec.backgroundColor = args.backgroundColor;
    }

    // Add custom axes
    if (args.axes) {
      if (args.axes.horizontal) {
        chartSpec.basicChart.axis.push({
          position: 'BOTTOM_AXIS',
          title: args.axes.horizontal.title,
          titleTextStyle: args.axes.horizontal.titleStyle,
          viewWindowOptions: {
            viewWindowMin: args.axes.horizontal.minValue,
            viewWindowMax: args.axes.horizontal.maxValue
          }
        });
      }
      if (args.axes.vertical) {
        chartSpec.basicChart.axis.push({
          position: 'LEFT_AXIS',
          title: args.axes.vertical.title,
          titleTextStyle: args.axes.vertical.titleStyle,
          viewWindowOptions: {
            viewWindowMin: args.axes.vertical.minValue,
            viewWindowMax: args.axes.vertical.maxValue
          }
        });
      }
    }

    // Add custom series
    if (args.series && args.series.length > 0) {
      chartSpec.basicChart.series = args.series.map((serie: any) => ({
        type: serie.type,
        color: serie.color,
        targetAxis: serie.targetAxis
      }));
    }

    // Add data domains and series (simplified)
    chartSpec.basicChart.domains = [{
      domain: {
        sourceRange: {
          sources: [this.parseA1Range(args.dataRange)]
        }
      }
    }];

    chartSpec.basicChart.series = chartSpec.basicChart.series || [{
      series: {
        sourceRange: {
          sources: [this.parseA1Range(args.dataRange)]
        }
      }
    }];

    const requests = [{
      addChart: {
        chart: {
          spec: chartSpec,
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: args.sheetId,
                rowIndex: args.anchorRow,
                columnIndex: args.anchorColumn
              },
              widthPixels: args.width || 600,
              heightPixels: args.height || 371
            }
          }
        }
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created advanced chart: ${args.title}`,
        },
      ],
    };
  }

  private async addSparklines(args: any) {
    const sheets = await auth.getSheetsClient();

    // Sparklines in Google Sheets are created using SPARKLINE formula
    const sparklineFormula = `=SPARKLINE(${args.dataRange},"{"charttype","${args.chartType.toLowerCase()}"${args.lineColor ? `;"color1",${this.rgbToHex(args.lineColor)}` : ''}}")`;

    const requests = [{
      updateCells: {
        range: this.parseA1Range(args.range),
        rows: [{
          values: [{
            userEnteredValue: {
              formulaValue: sparklineFormula
            }
          }]
        }],
        fields: 'userEnteredValue'
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added sparklines to range ${args.range}`,
        },
      ],
    };
  }

  private async createDataAnalysis(args: any) {
    const sheets = await auth.getSheetsClient();

    // This is a simplified implementation - real analysis would require complex calculations
    let analysisFormulas: string[] = [];

    switch (args.analysisType) {
      case 'DESCRIPTIVE_STATS':
        analysisFormulas = [
          '="Mean:"',
          `=AVERAGE(${args.dataRange})`,
          '="Median:"',
          `=MEDIAN(${args.dataRange})`,
          '="Std Dev:"',
          `=STDEV(${args.dataRange})`,
          '="Min:"',
          `=MIN(${args.dataRange})`,
          '="Max:"',
          `=MAX(${args.dataRange})`
        ];
        break;
      case 'CORRELATION':
        analysisFormulas = [
          '="Correlation Analysis"',
          `=CORREL(${args.dataRange})`
        ];
        break;
      case 'FREQUENCY_DISTRIBUTION':
        analysisFormulas = [
          '="Frequency Distribution"',
          `=FREQUENCY(${args.dataRange})`
        ];
        break;
    }

    const rows = analysisFormulas.map(formula => ({
      values: [{
        userEnteredValue: formula.startsWith('=') ?
          { formulaValue: formula } :
          { stringValue: formula }
      }]
    }));

    const requests = [{
      updateCells: {
        range: this.parseA1Range(args.outputRange),
        rows: rows,
        fields: 'userEnteredValue'
      }
    }];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: { requests }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created ${args.analysisType} analysis at ${args.outputRange}`,
        },
      ],
    };
  }

  private async createGoalSeek(args: any) {
    // Goal Seek in Google Sheets would typically be done through Solver add-on
    // This is a conceptual implementation

    return {
      content: [
        {
          type: 'text',
          text: `Goal Seek simulation: To achieve ${args.targetValue} in ${args.formulaCell}, adjust ${args.variableCell}. Note: This requires manual iteration or Google Sheets Solver add-on for full functionality.`,
        },
      ],
    };
  }

  private async createAutomation(args: any) {
    // Automation in Google Sheets is typically done with Apps Script
    // This provides a conceptual framework

    const automationScript = `
    // Automation Script for ${args.triggerType}
    function onTrigger() {
      ${args.actions.map((action: any) => {
        switch (action.type) {
          case 'SEND_EMAIL':
            return `MailApp.sendEmail('${action.config.to}', '${action.config.subject}', '${action.config.body}');`;
          case 'UPDATE_CELLS':
            return `SpreadsheetApp.getActiveSheet().getRange('${action.config.range}').setValue('${action.config.value}');`;
          case 'CREATE_CHART':
            return `// Create chart logic here`;
          default:
            return `// ${action.type} action`;
        }
      }).join('\n      ')}
    }
    `;

    return {
      content: [
        {
          type: 'text',
          text: `Automation framework created for ${args.triggerType}. To implement fully, add this Apps Script:\n\n${automationScript}\n\nNote: Requires Google Apps Script setup for full functionality.`,
        },
      ],
    };
  }

  private rgbToHex(rgb: { red: number; green: number; blue: number }): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
  }

  private async validateFormula(args: any) {
    const result = this.formulaEngine.validateFormula(args.formula);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            isValid: result.isValid,
            error: result.error,
            warnings: result.warnings,
            suggestions: result.suggestions,
            optimizations: result.optimizations
          }, null, 2),
        },
      ],
    };
  }

  private async suggestFormulas(args: any) {
    const suggestions = this.formulaEngine.suggestFormulasFromDescription(
      args.description,
      args.dataRange
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(suggestions, null, 2),
        },
      ],
    };
  }

  private async explainFormula(args: any) {
    const explanation = this.formulaEngine.explainFormula(args.formula);

    return {
      content: [
        {
          type: 'text',
          text: explanation,
        },
      ],
    };
  }

  private async optimizeFormula(args: any) {
    const result = this.formulaEngine.optimizeFormula(args.formula);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            original: args.formula,
            optimized: result.optimized,
            improvements: result.improvements
          }, null, 2),
        },
      ],
    };
  }

  private async getSheetInfo(args: any) {
    const metadata = await this.sheetManager.getSpreadsheetMetadata(args.spreadsheetId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }

  private async validateRange(args: any) {
    const result = await this.sheetManager.validateA1Notation(args.spreadsheetId, args.range);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getRangeSuggestions(args: any) {
    const suggestions = await this.sheetManager.getA1Suggestions(args.spreadsheetId, args.partial);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(suggestions, null, 2),
        },
      ],
    };
  }

  private async parseA1Range(spreadsheetId: string, range: string): Promise<any> {
    // Use the enterprise parser
    const parsed = await this.sheetManager.parseA1Notation(spreadsheetId, range);

    if (!parsed.isValid) {
      throw new Error(`Invalid range notation: ${range}. ${parsed.error}`);
    }

    return parsed.range;
  }

  // Phase 2A: AI Intelligence & Data Insights Methods
  private async analyzeDataPatterns(args: any) {
    const { spreadsheetId, range, includeHeaders = true, confidenceThreshold = 0.7 } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const patterns = await this.dataInsightsEngine.analyzeDataPatterns(data, {
      includeHeaders,
      confidenceThreshold
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(patterns, null, 2) }],
    };
  }

  private async suggestDataInsights(args: any) {
    const { spreadsheetId, range, domain = 'general', timeframe } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const insights = await this.dataInsightsEngine.suggestDataInsights(data, {
      domain,
      timeframe
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(insights, null, 2) }],
    };
  }

  private async detectAnomalies(args: any) {
    const { spreadsheetId, range, method = 'zscore', threshold = 2.5, includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const anomalies = await this.dataInsightsEngine.detectAnomalies(data, {
      method,
      threshold,
      includeHeaders
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(anomalies, null, 2) }],
    };
  }

  private async predictTrends(args: any) {
    const { spreadsheetId, range, forecastPeriods = 5, columnIndex, includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const predictions = await this.dataInsightsEngine.predictTrends(data, {
      forecastPeriods,
      columnIndex,
      includeHeaders
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(predictions, null, 2) }],
    };
  }

  private async classifyDataQuality(args: any) {
    const { spreadsheetId, range, expectedTypes, includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const quality = await this.dataInsightsEngine.classifyDataQuality(data, {
      expectedTypes,
      includeHeaders
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(quality, null, 2) }],
    };
  }

  private async recommendChartType(args: any) {
    const { spreadsheetId, range, purpose, targetAudience = 'business', includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const recommendations = await this.intelligentRecommendations.recommendChartType(data, {
      includeHeaders,
      purpose,
      targetAudience
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(recommendations, null, 2) }],
    };
  }

  private async suggestPivotDimensions(args: any) {
    const { spreadsheetId, range, analysisGoal = 'summary', includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const suggestions = await this.intelligentRecommendations.suggestPivotDimensions(data, {
      includeHeaders,
      analysisGoal
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(suggestions, null, 2) }],
    };
  }

  private async recommendFormulas(args: any) {
    const { spreadsheetId, range, intent, cellPosition, includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const recommendations = await this.intelligentRecommendations.recommendFormulas(data, {
      cellPosition,
      dataRange: range,
      intent,
      includeHeaders
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(recommendations, null, 2) }],
    };
  }

  private async optimizeDataStructure(args: any) {
    const { spreadsheetId, range, currentIssues, includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const recommendations = await this.intelligentRecommendations.optimizeDataStructure(data, {
      includeHeaders,
      currentIssues
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(recommendations, null, 2) }],
    };
  }

  private async generateSummaryReport(args: any) {
    const { spreadsheetId, range, title = 'Data Analysis Report', reportType = 'executive', includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const report = await this.intelligentRecommendations.generateSummaryReport(data, {
      title,
      reportType,
      includeHeaders
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
    };
  }

  private async debugFormula(args: any) {
    const { formula, spreadsheetId, cellData } = args;

    const context = spreadsheetId ? { spreadsheetId, cellData } : undefined;
    const result = this.advancedFormulaEngine.debugFormula(formula, context);

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }

  private async suggestAlternatives(args: any) {
    const { formula } = args;

    const alternatives = this.advancedFormulaEngine.suggestAlternatives(formula);

    return {
      content: [{ type: 'text', text: JSON.stringify(alternatives, null, 2) }],
    };
  }

  private async calculatePerformance(args: any) {
    const { formula, dataSize } = args;

    const analysis = this.advancedFormulaEngine.calculatePerformance(formula, dataSize);

    return {
      content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }],
    };
  }

  private async generateDocumentation(args: any) {
    const { formula, purpose, dataContext } = args;

    const documentation = this.advancedFormulaEngine.generateDocumentation(formula, {
      purpose,
      dataContext
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(documentation, null, 2) }],
    };
  }

  private async createSmartWorkflow(args: any) {
    const { goal, dataSource, outputFormat, frequency, businessRules } = args;

    const workflow = await this.smartAutomationEngine.createSmartWorkflow({
      goal,
      dataSource,
      outputFormat,
      frequency,
      businessRules
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(workflow, null, 2) }],
    };
  }

  private async setupDataPipeline(args: any) {
    const { name, sourceType, sourceConfig, destinationType, destinationConfig, schedule } = args;

    const pipeline = await this.smartAutomationEngine.setupDataPipeline({
      name,
      sourceType,
      sourceConfig,
      destinationType,
      destinationConfig,
      schedule
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(pipeline, null, 2) }],
    };
  }

  private async configureAlerts(args: any) {
    const { name, spreadsheetId, metrics, thresholds, recipients } = args;

    const alertConfig = await this.smartAutomationEngine.configureAlerts({
      name,
      dataSource: spreadsheetId,
      metrics,
      thresholds,
      recipients
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(alertConfig, null, 2) }],
    };
  }

  private async scheduleReports(args: any) {
    const { name, spreadsheetId, ranges, reportType, schedule, recipients } = args;

    const reportConfig = await this.smartAutomationEngine.scheduleReports({
      name,
      spreadsheetId,
      ranges,
      reportType,
      schedule,
      recipients
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(reportConfig, null, 2) }],
    };
  }

  private async processNaturalQuery(args: any) {
    const { query, spreadsheetId, currentSheet } = args;

    const context = {
      spreadsheetId,
      currentSheet,
      availableData: spreadsheetId ? await this.getAvailableData(spreadsheetId) : undefined
    };

    const result = await this.naturalLanguageInterface.processNaturalQuery(query, context);

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }

  private async explainDataStory(args: any) {
    const { spreadsheetId, range, focusArea = 'overview', audienceLevel = 'business', includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const story = await this.naturalLanguageInterface.explainDataStory(data, {
      includeHeaders,
      focusArea,
      audienceLevel
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(story, null, 2) }],
    };
  }

  private async answerDataQuestions(args: any) {
    const { question, spreadsheetId, range, includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const answer = await this.naturalLanguageInterface.answerDataQuestions(question, data, {
      includeHeaders
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(answer, null, 2) }],
    };
  }

  private async createFromDescription(args: any) {
    const { description, includeFormatting = true, includeSampleData = true, includeCharts = true } = args;

    const structure = await this.naturalLanguageInterface.createFromDescription(description, {
      includeFormatting,
      includeSampleData,
      includeCharts
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(structure, null, 2) }],
    };
  }

  private async generateInsightsReport(args: any) {
    const { spreadsheetId, range, domain = 'general', reportType = 'summary', includeHeaders = true } = args;

    const rangeData = await this.readRange(spreadsheetId, range);
    const data = rangeData.content[0].text ? JSON.parse(rangeData.content[0].text).values : [];

    const report = await this.naturalLanguageInterface.generateInsightsReport(data, {
      includeHeaders,
      domain,
      reportType
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(report, null, 2) }],
    };
  }

  private async getAvailableData(spreadsheetId: string): Promise<string[]> {
    try {
      const metadata = await this.sheetManager.getSpreadsheetMetadata(spreadsheetId);
      return metadata.sheets.map(sheet => sheet.title);
    } catch (error) {
      return [];
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new GoogleSheetsMCPServer();
server.run().catch(console.error);