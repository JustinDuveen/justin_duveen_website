/**
 * Sheet management service for handling sheet metadata and operations
 */

import { GoogleSheetsAuth } from './auth.js';
import { A1NotationParser } from './a1-parser.js';

export interface SheetMetadata {
  sheetId: number;
  title: string;
  index: number;
  gridProperties: {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  };
  properties?: any;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  locale: string;
  timeZone: string;
  sheets: SheetMetadata[];
  namedRanges?: Array<{
    name: string;
    range: any;
  }>;
}

export class SheetManager {
  private spreadsheetCache: Map<string, SpreadsheetMetadata> = new Map();
  private parser: A1NotationParser;

  constructor(private auth: GoogleSheetsAuth) {
    this.parser = new A1NotationParser();
  }

  /**
   * Get or refresh spreadsheet metadata
   */
  async getSpreadsheetMetadata(spreadsheetId: string, forceRefresh = false): Promise<SpreadsheetMetadata> {
    if (!forceRefresh && this.spreadsheetCache.has(spreadsheetId)) {
      return this.spreadsheetCache.get(spreadsheetId)!;
    }

    const sheets = await this.auth.getSheetsClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false
    });

    const spreadsheet = response.data;
    const metadata: SpreadsheetMetadata = {
      spreadsheetId: spreadsheet.spreadsheetId!,
      title: spreadsheet.properties?.title || 'Untitled',
      locale: spreadsheet.properties?.locale || 'en_US',
      timeZone: spreadsheet.properties?.timeZone || 'UTC',
      sheets: spreadsheet.sheets?.map(sheet => ({
        sheetId: sheet.properties?.sheetId || 0,
        title: sheet.properties?.title || 'Untitled',
        index: sheet.properties?.index || 0,
        gridProperties: {
          rowCount: sheet.properties?.gridProperties?.rowCount || 1000,
          columnCount: sheet.properties?.gridProperties?.columnCount || 26,
          frozenRowCount: sheet.properties?.gridProperties?.frozenRowCount,
          frozenColumnCount: sheet.properties?.gridProperties?.frozenColumnCount
        },
        properties: sheet.properties
      })) || [],
      namedRanges: spreadsheet.namedRanges?.map(nr => ({
        name: nr.name || '',
        range: nr.range
      }))
    };

    // Update parser with sheet mapping
    this.parser.updateSheetMapping(metadata.sheets.map(s => ({
      properties: { title: s.title, sheetId: s.sheetId }
    })));

    // Update parser with named ranges
    if (metadata.namedRanges) {
      metadata.namedRanges.forEach(nr => {
        if (nr.name && nr.range) {
          const a1Notation = this.parser.rangeToA1(nr.range, this.getSheetNameById(metadata, nr.range.sheetId));
          this.parser.addNamedRange(nr.name, a1Notation);
        }
      });
    }

    this.spreadsheetCache.set(spreadsheetId, metadata);
    return metadata;
  }

  /**
   * Get sheet by name
   */
  async getSheetByName(spreadsheetId: string, sheetName: string): Promise<SheetMetadata | null> {
    const metadata = await this.getSpreadsheetMetadata(spreadsheetId);
    return metadata.sheets.find(s => s.title === sheetName) || null;
  }

  /**
   * Get sheet by ID
   */
  async getSheetById(spreadsheetId: string, sheetId: number): Promise<SheetMetadata | null> {
    const metadata = await this.getSpreadsheetMetadata(spreadsheetId);
    return metadata.sheets.find(s => s.sheetId === sheetId) || null;
  }

  /**
   * Get sheet name by ID
   */
  getSheetNameById(metadata: SpreadsheetMetadata, sheetId: number): string | undefined {
    return metadata.sheets.find(s => s.sheetId === sheetId)?.title;
  }

  /**
   * Parse A1 notation with proper sheet context
   */
  async parseA1Notation(spreadsheetId: string, notation: string) {
    await this.getSpreadsheetMetadata(spreadsheetId); // Ensure parser is updated
    return this.parser.parse(notation);
  }

  /**
   * Convert GridRange to A1 notation with sheet context
   */
  async rangeToA1(spreadsheetId: string, range: any, sheetId?: number): Promise<string> {
    const metadata = await this.getSpreadsheetMetadata(spreadsheetId);
    const sheetName = sheetId ? this.getSheetNameById(metadata, sheetId) : undefined;
    return this.parser.rangeToA1(range, sheetName);
  }

  /**
   * Validate A1 notation
   */
  async validateA1Notation(spreadsheetId: string, notation: string): Promise<{isValid: boolean, error?: string}> {
    await this.getSpreadsheetMetadata(spreadsheetId);
    return this.parser.validate(notation);
  }

  /**
   * Get A1 notation suggestions
   */
  async getA1Suggestions(spreadsheetId: string, partial: string): Promise<string[]> {
    await this.getSpreadsheetMetadata(spreadsheetId);
    return this.parser.getSuggestions(partial);
  }

  /**
   * Create new sheet
   */
  async createSheet(spreadsheetId: string, title: string, rowCount = 1000, columnCount = 26): Promise<SheetMetadata> {
    const sheets = await this.auth.getSheetsClient();

    const request = {
      addSheet: {
        properties: {
          title,
          gridProperties: {
            rowCount,
            columnCount
          }
        }
      }
    };

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [request] }
    });

    const newSheetProperties = response.data.replies?.[0]?.addSheet?.properties;
    if (!newSheetProperties) {
      throw new Error('Failed to create sheet');
    }

    // Refresh metadata
    await this.getSpreadsheetMetadata(spreadsheetId, true);

    return {
      sheetId: newSheetProperties.sheetId!,
      title: newSheetProperties.title!,
      index: newSheetProperties.index!,
      gridProperties: {
        rowCount: newSheetProperties.gridProperties?.rowCount || rowCount,
        columnCount: newSheetProperties.gridProperties?.columnCount || columnCount,
        frozenRowCount: newSheetProperties.gridProperties?.frozenRowCount,
        frozenColumnCount: newSheetProperties.gridProperties?.frozenColumnCount
      },
      properties: newSheetProperties
    };
  }

  /**
   * Delete sheet
   */
  async deleteSheet(spreadsheetId: string, sheetId: number): Promise<void> {
    const sheets = await this.auth.getSheetsClient();

    const request = {
      deleteSheet: {
        sheetId
      }
    };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [request] }
    });

    // Refresh metadata
    await this.getSpreadsheetMetadata(spreadsheetId, true);
  }

  /**
   * Rename sheet
   */
  async renameSheet(spreadsheetId: string, sheetId: number, newTitle: string): Promise<void> {
    const sheets = await this.auth.getSheetsClient();

    const request = {
      updateSheetProperties: {
        properties: {
          sheetId,
          title: newTitle
        },
        fields: 'title'
      }
    };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [request] }
    });

    // Refresh metadata
    await this.getSpreadsheetMetadata(spreadsheetId, true);
  }

  /**
   * Duplicate sheet
   */
  async duplicateSheet(spreadsheetId: string, sourceSheetId: number, newTitle?: string): Promise<SheetMetadata> {
    const sheets = await this.auth.getSheetsClient();

    const request = {
      duplicateSheet: {
        sourceSheetId,
        insertSheetIndex: undefined, // Add at end
        newSheetName: newTitle
      }
    };

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [request] }
    });

    const duplicatedSheetProperties = response.data.replies?.[0]?.duplicateSheet?.properties;
    if (!duplicatedSheetProperties) {
      throw new Error('Failed to duplicate sheet');
    }

    // Refresh metadata
    await this.getSpreadsheetMetadata(spreadsheetId, true);

    return {
      sheetId: duplicatedSheetProperties.sheetId!,
      title: duplicatedSheetProperties.title!,
      index: duplicatedSheetProperties.index!,
      gridProperties: {
        rowCount: duplicatedSheetProperties.gridProperties?.rowCount || 1000,
        columnCount: duplicatedSheetProperties.gridProperties?.columnCount || 26,
        frozenRowCount: duplicatedSheetProperties.gridProperties?.frozenRowCount,
        frozenColumnCount: duplicatedSheetProperties.gridProperties?.frozenColumnCount
      },
      properties: duplicatedSheetProperties
    };
  }

  /**
   * Get all sheets summary
   */
  async getAllSheets(spreadsheetId: string): Promise<SheetMetadata[]> {
    const metadata = await this.getSpreadsheetMetadata(spreadsheetId);
    return metadata.sheets;
  }

  /**
   * Clear cache for spreadsheet
   */
  clearCache(spreadsheetId?: string): void {
    if (spreadsheetId) {
      this.spreadsheetCache.delete(spreadsheetId);
    } else {
      this.spreadsheetCache.clear();
    }
  }

  /**
   * Get parser instance for advanced operations
   */
  getParser(): A1NotationParser {
    return this.parser;
  }
}