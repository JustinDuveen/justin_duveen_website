# Google Sheets MCP Server - Enterprise Edition

**A comprehensive Google Sheets automation platform** with advanced statistical analysis and 54 enterprise-grade tools. **Now powering production AI agents through Claude Agent SDK integration.**

## 🚀 Version 2.0 - Complete: Statistical Intelligence & Data Analysis

### **🎯 Advanced Statistical Analysis & Automation**
- **📊 Statistical Data Analysis**: Pattern detection, anomaly identification, and trend forecasting using proven statistical methods
- **💡 Intelligent Recommendations**: Data-driven chart suggestions, pivot table optimization, and formula recommendations
- **⚡ Advanced Formula Analysis**: Step-by-step debugging, performance analysis, and documentation generation
- **🔄 Automation & Workflows**: Intelligent workflows, data pipelines, and automated reporting
- **🗣️ Natural Language Interface**: Process queries in plain English and generate data insights

### **✨ Phase 1: Enterprise Infrastructure Foundation**
- **🧠 AI-Powered Formula Engine**: IntelliSense-like suggestions, validation, and optimization
- **📍 Enterprise A1 Parser**: Handles all edge cases, named ranges, and complex notations
- **🗺️ Smart Sheet Management**: Auto-mapping, caching, and metadata management
- **🛡️ Error Recovery System**: Automatic retry with intelligent recovery strategies
- **⚡ Performance Optimization**: Batch operations and efficient API usage

### **📊 Core Data Operations** (Enhanced)
- **Spreadsheet Intelligence**: Deep metadata analysis with sheet mapping
- **Smart Range Operations**: Advanced A1 notation with validation and suggestions
- **Formula Validation**: Real-time syntax checking and optimization recommendations
- **Error-Resilient Updates**: Automatic recovery from common issues

### **🧮 Advanced Formula & AI Assistance**
- **Formula Suggestions**: Intelligent recommendations based on descriptions
- **Syntax Validation**: Real-time error detection and correction
- **Performance Optimization**: Automatic formula improvements (VLOOKUP → INDEX/MATCH)
- **Plain English Explanations**: Understand complex formulas instantly
- **Named Range Management**: Enterprise-grade range naming and references

### **🎨 Professional Visualization**
- **Advanced Chart Engine**: 10+ chart types with full customization
- **Sparklines**: Mini charts within cells for trend analysis
- **Custom Styling**: Colors, fonts, backgrounds, and professional layouts
- **Combination Charts**: Multi-axis visualizations for complex data

### **📈 Business Intelligence**
- **Pivot Table Engine**: Complex data analysis with multiple dimensions
- **Statistical Analysis**: Descriptive stats, correlation, regression analysis
- **Data Insights**: Anomaly detection and trend analysis
- **Goal Seek**: Optimization and what-if analysis

### **⚡ Enterprise Operations**
- **Batch Processing**: Execute hundreds of operations efficiently
- **Smart Error Recovery**: Automatic retry with contextual fixes
- **Range Validation**: Real-time A1 notation checking and suggestions
- **Security & Protection**: Cell and sheet protection with user permissions

## 🤖 **NEW: Production AI Agent Integration**

### **Financial Modeling Agent - Live Demo**

We've built a **production-ready Financial Modeling Agent** using this MCP server + Claude Agent SDK that replaces expensive financial consultants:

```bash
# Clone the complete agent
git clone <financial-modeling-agent-repo>
cd financial-modeling-agent

# One command setup
npm install && npm run build

# See it work
npm run test demo
```

**What it does:**
- 🧠 **Expert Financial Intelligence**: Detects SaaS, marketplace, eCommerce business models
- 📊 **Builds Complete Models**: Assumptions, projections, dashboard, scenarios in 60 seconds
- 🚨 **Red Flag Detection**: "Your 8% churn means losing 60% of customers yearly"
- 💡 **Investor Narratives**: "Growing 15% MoM with 4.2x LTV:CAC ratio, raising $500K for profitability"
- ⚡ **Uses 20 of our 54 tools**: Strategic selection for financial modeling workflows

**Real Example:**
```
👤 "I'm building a SaaS with 500 customers at $100/month, growing 12% monthly"

🤖 Agent creates complete financial model:
   📊 Spreadsheet: 4 professional tabs with charts
   💡 Insights: "Strong 4.2x LTV:CAC ratio, 8-month payback"
   📈 Narrative: "Clear path to profitability at $150K MRR"
   ✅ Result: Investor-ready model in 60 seconds
```

**This demonstrates the power of MCP + Agent SDK for production use cases.**

---

## Setup

### 1. Prerequisites

- Node.js 18+
- A Google Cloud Project with Sheets API enabled
- A Google Service Account with appropriate credentials

### 2. Google Cloud Setup

1. Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Sheets API
3. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name and description
   - Create and download the JSON key file
4. Share your Google Sheets with the service account email address

### 3. Installation

```bash
# Clone or create the project directory
cd google-sheets-mcp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 4. Configuration

Edit `.env` file with your Google Service Account credentials:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_PROJECT_ID=your-google-project-id
```

### 5. Build and Run

```bash
# Build the TypeScript
npm run build

# Run the server
npm start

# Or for development
npm run dev
```

## Usage

### Option 1: With Claude Agent SDK (Recommended for Production)

Build sophisticated AI agents that leverage all 54 tools:

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  settingSources: ['project'], // Loads .claude/settings.json
  allowedTools: [
    'analyze_data_patterns',
    'suggest_data_insights',
    'create_advanced_chart',
    // ... your selected tools
  ]
});

// Agent automatically uses MCP tools through configuration
const result = await agent.callTool('analyze_data_patterns', {
  spreadsheetId: 'your-sheet-id',
  range: 'Data!A1:Z1000'
});
```

Configure in `.claude/settings.json`:
```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["./google-sheets-mcp/dist/index.js"],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_EMAIL": "${GOOGLE_SERVICE_ACCOUNT_EMAIL}",
        "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY": "${GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}",
        "GOOGLE_PROJECT_ID": "${GOOGLE_PROJECT_ID}"
      }
    }
  }
}
```

### Option 2: With Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": ["/path/to/google-sheets-mcp/dist/index.js"],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_EMAIL": "your-service-account@your-project.iam.gserviceaccount.com",
        "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----",
        "GOOGLE_PROJECT_ID": "your-google-project-id"
      }
    }
  }
}
```

## 🛠️ Complete Tool Arsenal (54 Tools)

### **🚀 Statistical Intelligence & Data Insights (22 Tools)**

#### **📊 Statistical Data Analysis Engine** (5 tools)

##### analyze_data_patterns ⭐⭐⭐
Statistical analysis to detect patterns, trends, seasonality, and anomalies in data using linear regression, autocorrelation, and distribution analysis.

##### suggest_data_insights ⭐⭐⭐
Generate data-driven business insights and recommendations from statistical analysis with domain expertise.

##### detect_anomalies ⭐⭐⭐
Detect statistical anomalies and outliers using proven statistical methods (z-score, IQR, isolation forest).

##### predict_trends ⭐⭐⭐
Predict future trends and values using statistical forecasting models with seasonality detection.

##### classify_data_quality ⭐⭐⭐
Assess data quality with statistical completeness, accuracy, and consistency analysis.

#### **💡 Intelligent Recommendations** (5 tools)

##### recommend_chart_type ⭐⭐⭐
Data-driven recommendations for optimal chart types based on data characteristics and purpose.

##### suggest_pivot_dimensions ⭐⭐⭐
Intelligent suggestions for optimal pivot table structure and dimensions based on data analysis.

##### recommend_formulas ⭐⭐⭐
Context-aware formula recommendations based on data patterns and user intent.

##### optimize_data_structure ⭐⭐⭐
Statistical analysis and recommendations for improving data organization and structure.

##### generate_summary_report ⭐⭐⭐
Generate comprehensive data-driven summary reports with insights and recommendations.

#### **⚡ Advanced Formula Analysis** (4 tools)

##### debug_formula ⭐⭐⭐
Advanced formula debugging with step-by-step execution analysis and error detection.

##### suggest_alternatives ⭐⭐⭐
Intelligent alternative formula suggestions for better performance or functionality.

##### calculate_performance ⭐⭐⭐
Analyze formula performance and suggest optimizations with computational complexity analysis.

##### generate_documentation ⭐⭐⭐
Generate comprehensive documentation for complex formulas with examples and assumptions.

#### **🔄 Automation & Workflows** (4 tools)

##### create_smart_workflow ⭐⭐⭐
Create intelligent automated workflows based on requirements and business rules.

##### setup_data_pipeline ⭐⭐⭐
Create automated ETL data pipeline with optimization and quality monitoring.

##### configure_alerts ⭐⭐⭐
Setup intelligent alerting system with statistically-optimized thresholds and notifications.

##### schedule_reports ⭐⭐⭐
Setup automated report generation and distribution with intelligent templates.

#### **🗣️ Natural Language Interface** (4 tools)

##### process_natural_query ⭐⭐⭐
Process natural language queries and suggest actions using intent recognition (e.g., "Show me top 10 sales by region").

##### explain_data_story ⭐⭐⭐
Generate narrative explanations of data patterns and trends based on statistical analysis for different audiences.

##### answer_data_questions ⭐⭐⭐
Answer specific questions about spreadsheet data using statistical analysis with confidence scoring.

##### create_from_description ⭐⭐⭐
Create spreadsheet structure from natural language description with formatting and charts.

##### generate_insights_report ⭐⭐⭐
Generate automated comprehensive insights report with AI analysis and next steps.

### **🎯 NEW: AI-Powered Formula Tools**

#### validate_formula ⭐
Validate formula syntax and get optimization suggestions.

#### suggest_formulas ⭐
Get intelligent formula suggestions based on plain English descriptions.

#### explain_formula ⭐
Get plain English explanations of complex formulas.

#### optimize_formula ⭐
Get performance-optimized versions of formulas with improvement suggestions.

### **🗺️ NEW: Enterprise Sheet Management**

#### get_sheet_info ⭐
Get detailed metadata about all sheets in a spreadsheet.

#### validate_range ⭐
Validate A1 notation and get correction suggestions.

#### get_range_suggestions ⭐
Get intelligent A1 notation suggestions for partial input.

### **📊 Enhanced Data Operations**

#### get_spreadsheet_info
Get comprehensive information about spreadsheets with enhanced metadata.

#### read_range
Read data with automatic range validation and error recovery.

#### write_range
Write data with formula validation and intelligent error handling.

#### append_data
Append data with smart range detection and optimization.

### Advanced Features

#### create_chart
Create various types of charts in a Google Sheet.

**Parameters:**
- `spreadsheetId` (string): The ID of the Google Spreadsheet
- `title` (string): Title of the chart
- `chartType` (string): Type of chart (COLUMN, BAR, LINE, AREA, PIE, DONUT, SCATTER, COMBO)
- `dataRange` (string): Range of data for the chart (e.g., "Sheet1!A1:C10")
- `sheetId` (number): ID of the sheet where the chart will be placed
- `anchorRow` (number): Row index where chart will be anchored (0-based)
- `anchorColumn` (number): Column index where chart will be anchored (0-based)
- `width` (number, optional): Width of the chart in pixels (default: 600)
- `height` (number, optional): Height of the chart in pixels (default: 371)
- `legendPosition` (string, optional): Position of the legend (BOTTOM, LEFT, RIGHT, TOP, NO_LEGEND)

#### create_pivot_table
Create a pivot table in a Google Sheet.

**Parameters:**
- `spreadsheetId` (string): The ID of the Google Spreadsheet
- `sourceRange` (string): Source data range (e.g., "Sheet1!A1:D100")
- `destinationSheetId` (number): ID of the sheet where pivot table will be placed
- `destinationRow` (number): Row index where pivot table will start (0-based)
- `destinationColumn` (number): Column index where pivot table will start (0-based)
- `rows` (array): Row dimensions for the pivot table
- `columns` (array): Column dimensions for the pivot table
- `values` (array): Value aggregations for the pivot table
- `filters` (array, optional): Filter dimensions for the pivot table

#### format_cells
Format cells in a Google Sheet with styling options.

**Parameters:**
- `spreadsheetId` (string): The ID of the Google Spreadsheet
- `range` (string): Range to format (e.g., "Sheet1!A1:C10")
- `backgroundColor` (object, optional): Background color (RGB values 0-1)
- `textColor` (object, optional): Text color (RGB values 0-1)
- `fontFamily` (string, optional): Font family (e.g., "Arial", "Times New Roman")
- `fontSize` (number, optional): Font size in points
- `bold` (boolean, optional): Bold text
- `italic` (boolean, optional): Italic text
- `horizontalAlignment` (string, optional): Horizontal text alignment (LEFT, CENTER, RIGHT)
- `verticalAlignment` (string, optional): Vertical text alignment (TOP, MIDDLE, BOTTOM)
- `borders` (object, optional): Border styling
- `numberFormat` (object, optional): Number formatting

#### create_sheet
Create a new sheet in a Google Spreadsheet.

**Parameters:**
- `spreadsheetId` (string): The ID of the Google Spreadsheet
- `title` (string): Title of the new sheet
- `rowCount` (number, optional): Number of rows in the new sheet (default: 1000)
- `columnCount` (number, optional): Number of columns in the new sheet (default: 26)

#### insert_image
Insert an image into a Google Sheet from a URL.

**Parameters:**
- `spreadsheetId` (string): The ID of the Google Spreadsheet
- `imageUrl` (string): URL of the image to insert
- `sheetId` (number): ID of the sheet where image will be placed
- `anchorRow` (number): Row index where image will be anchored (0-based)
- `anchorColumn` (number): Column index where image will be anchored (0-based)
- `width` (number, optional): Width of the image in pixels
- `height` (number, optional): Height of the image in pixels

## 🎯 Example Usage - Statistical Intelligence

### **🚀 Statistical Intelligence Examples**

#### **📊 Statistical Data Insights**
- `analyze_data_patterns({spreadsheetId, range: "Sales!A1:D1000"})`
  → Returns: Trend analysis, seasonal patterns, outlier detection, correlation insights
- `suggest_data_insights({spreadsheetId, range: "Revenue!A1:Z100", domain: "finance"})`
  → Returns: Business insights, performance indicators, risk assessment, opportunities
- `detect_anomalies({spreadsheetId, range: "Transactions!A1:F5000", method: "isolation"})`
  → Returns: Statistical anomalies with severity levels and explanations
- `predict_trends({spreadsheetId, range: "TimeSeries!A1:B365", forecastPeriods: 30})`
  → Returns: Future predictions with confidence intervals and seasonality

#### **🤖 Intelligent Recommendations**
- `recommend_chart_type({spreadsheetId, range: "Data!A1:C100", purpose: "trend"})`
  → Returns: Optimal chart suggestions with reasoning and best practices
- `suggest_pivot_dimensions({spreadsheetId, range: "Sales!A1:G1000", analysisGoal: "breakdown"})`
  → Returns: Intelligent pivot table structure recommendations
- `recommend_formulas({spreadsheetId, range: "Data!A1:C50", intent: "calculate profit margin"})`
  → Returns: Context-aware formula suggestions with examples

#### **⚡ Advanced Formula Intelligence**
- `debug_formula({formula: "=VLOOKUP(A1,Sheet2!A:C,3,FALSE)"})`
  → Returns: Step-by-step execution analysis with error detection
- `suggest_alternatives({formula: "=VLOOKUP(A1,B:D,2,FALSE)"})`
  → Returns: Performance alternatives with pros/cons analysis
- `calculate_performance({formula: "=SUMPRODUCT((A:A>100)*(B:B))", dataSize: {rows: 10000}})`
  → Returns: Performance analysis with optimization recommendations

#### **🔄 Smart Automation**
- `create_smart_workflow({goal: "weekly sales report", dataSource: "Sales!A:D", outputFormat: "dashboard"})`
  → Returns: AI-designed workflow with automated steps and triggers
- `setup_data_pipeline({name: "CRM Sync", sourceType: "api", destinationType: "spreadsheet"})`
  → Returns: Automated ETL pipeline with quality monitoring
- `configure_alerts({name: "Revenue Alert", metrics: [{field: "revenue", aggregation: "sum"}], thresholds: [{condition: "drops_by", value: 10}]})`
  → Returns: Intelligent alerting system with AI-optimized thresholds

#### **🗣️ Natural Language Interface**
- `process_natural_query({query: "Show me top 10 customers by revenue"})`
  → Returns: Suggested actions, formulas, and visualizations
- `explain_data_story({spreadsheetId, range: "Dashboard!A1:J50", audienceLevel: "executive"})`
  → Returns: Executive summary with key insights and recommendations
- `answer_data_questions({question: "What's our best performing product?", spreadsheetId, range: "Products!A1:E100"})`
  → Returns: Statistical analysis answer with supporting data and confidence score
- `create_from_description({description: "I need a budget tracker for my small business"})`
  → Returns: Complete spreadsheet structure with formulas, formatting, and charts

### **✨ Phase 1: Advanced Formula Assistance**
- "I need a formula to sum sales where region is 'North' and product is 'Widget'"
  → Returns: `=SUMIFS(C:C,A:A,"North",B:B,"Widget")` with explanation
- "Explain this formula: =INDEX(MATCH(A1,B:B,0),C:C)"
  → Returns: Plain English explanation of the lookup logic
- "Optimize this formula: =VLOOKUP(A1,B:D,2,FALSE)"
  → Returns: `=INDEX(C:C,MATCH(A1,B:B,0))` with performance improvements
- "Validate this formula: =SUM(A1:A10,B1:B5"
  → Returns: Syntax error detected, suggests adding closing parenthesis

### **🗺️ Smart Range Operations**
- "Validate this range: 'Sales Data'!A1:Z100"
  → Returns: Range validation with sheet existence check
- "Give me suggestions for: Sheet"
  → Returns: ['Sheet1!A1', 'Sheet2!A1', 'SheetData!A1']
- "Get detailed info about spreadsheet abc123"
  → Returns: Complete metadata with all sheets, named ranges, and properties

### **📊 Enhanced Business Operations**
- "Create an advanced sales dashboard with multiple chart types and conditional formatting"
- "Build a financial model with pivot tables, sparklines, and automated calculations"
- "Set up data validation with dropdown lists and protect sensitive ranges"
- "Generate statistical analysis with correlation and regression on sales data"

### Chart Examples
```
Create a pie chart showing product sales:
- chartType: "PIE"
- dataRange: "Sheet1!A1:B6"
- title: "Product Sales Distribution"

Create a line chart for trend analysis:
- chartType: "LINE"
- dataRange: "Sheet1!A1:C12"
- title: "Monthly Revenue Trends"
```

### Pivot Table Examples
```
Sales analysis pivot table:
- rows: [{ sourceColumnOffset: 0, showTotals: true }] // Product names
- columns: [{ sourceColumnOffset: 1, showTotals: true }] // Regions
- values: [{ sourceColumnOffset: 2, summarizeFunction: "SUM" }] // Sales amounts
```

### Formatting Examples
```
Header formatting:
- backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 }
- textColor: { red: 1, green: 1, blue: 1 }
- bold: true
- horizontalAlignment: "CENTER"

Currency formatting:
- numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" }
```

## License

MIT