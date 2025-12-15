/**
 * AI-powered Data Insights Engine for Phase 2A
 * Provides advanced statistical analysis, pattern detection, and business insights
 */

export interface DataPattern {
  type: 'trend' | 'seasonal' | 'cyclical' | 'outlier' | 'correlation' | 'distribution';
  description: string;
  confidence: number;
  details: any;
  recommendation?: string;
}

export interface DataInsight {
  category: 'performance' | 'trend' | 'opportunity' | 'risk' | 'pattern';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
  supportingData?: any;
}

export interface AnomalyDetection {
  value: number;
  row: number;
  column: number;
  anomalyType: 'statistical' | 'contextual' | 'collective';
  severity: 'high' | 'medium' | 'low';
  zscore?: number;
  explanation: string;
}

export interface TrendPrediction {
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  direction: number;
  confidence: number;
  predictedValues: number[];
  seasonality?: {
    detected: boolean;
    period?: number;
    strength?: number;
  };
}

export interface DataQualityAssessment {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  overall: number;
  issues: Array<{
    type: 'missing' | 'duplicate' | 'inconsistent' | 'invalid' | 'outlier';
    count: number;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export class DataInsightsEngine {
  private cache: Map<string, any> = new Map();

  /**
   * Analyze data patterns in a range
   */
  async analyzeDataPatterns(
    data: any[][],
    options: {
      includeHeaders?: boolean;
      columnTypes?: string[];
      confidenceThreshold?: number;
    } = {}
  ): Promise<DataPattern[]> {
    const patterns: DataPattern[] = [];
    const { includeHeaders = true, confidenceThreshold = 0.7 } = options;

    const dataRows = includeHeaders ? data.slice(1) : data;

    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const columnData = dataRows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');

      if (columnData.length === 0) continue;

      // Detect numeric patterns
      if (this.isNumericColumn(columnData)) {
        const numericData = columnData.map(val => parseFloat(val.toString())).filter(val => !isNaN(val));

        // Trend analysis
        const trendPattern = this.detectTrend(numericData);
        if (trendPattern.confidence >= confidenceThreshold) {
          patterns.push(trendPattern);
        }

        // Seasonality detection
        const seasonalPattern = this.detectSeasonality(numericData);
        if (seasonalPattern.confidence >= confidenceThreshold) {
          patterns.push(seasonalPattern);
        }

        // Outlier detection
        const outlierPatterns = this.detectOutliers(numericData, colIndex);
        patterns.push(...outlierPatterns.filter(p => p.confidence >= confidenceThreshold));

        // Distribution analysis
        const distributionPattern = this.analyzeDistribution(numericData, colIndex);
        if (distributionPattern.confidence >= confidenceThreshold) {
          patterns.push(distributionPattern);
        }
      }

      // Detect text patterns
      if (this.isTextColumn(columnData)) {
        const textPatterns = this.analyzeTextPatterns(columnData, colIndex);
        patterns.push(...textPatterns.filter(p => p.confidence >= confidenceThreshold));
      }
    }

    // Cross-column correlation analysis
    const correlationPatterns = this.detectCorrelations(dataRows);
    patterns.push(...correlationPatterns.filter(p => p.confidence >= confidenceThreshold));

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate business insights from data
   */
  async suggestDataInsights(
    data: any[][],
    context?: {
      domain?: 'sales' | 'finance' | 'marketing' | 'operations' | 'general';
      timeframe?: string;
      businessGoals?: string[];
    }
  ): Promise<DataInsight[]> {
    const insights: DataInsight[] = [];
    const patterns = await this.analyzeDataPatterns(data);

    for (const pattern of patterns) {
      switch (pattern.type) {
        case 'trend':
          if (pattern.details.direction > 0) {
            insights.push({
              category: 'performance',
              title: 'Positive Growth Trend Detected',
              description: `Data shows a ${pattern.details.strength} upward trend with ${(pattern.confidence * 100).toFixed(0)}% confidence`,
              significance: pattern.details.strength > 0.7 ? 'high' : 'medium',
              confidence: pattern.confidence,
              actionable: true,
              recommendation: 'Consider scaling resources to maintain momentum or investigate factors driving growth',
              supportingData: pattern.details
            });
          } else if (pattern.details.direction < -0.3) {
            insights.push({
              category: 'risk',
              title: 'Declining Performance Detected',
              description: `Data indicates a concerning downward trend`,
              significance: 'high',
              confidence: pattern.confidence,
              actionable: true,
              recommendation: 'Immediate analysis recommended to identify root causes and implement corrective measures',
              supportingData: pattern.details
            });
          }
          break;

        case 'seasonal':
          insights.push({
            category: 'pattern',
            title: 'Seasonal Pattern Identified',
            description: `Regular cyclical behavior detected with ${pattern.details.period}-period cycles`,
            significance: 'medium',
            confidence: pattern.confidence,
            actionable: true,
            recommendation: 'Plan inventory, staffing, and marketing campaigns around identified seasonal patterns',
            supportingData: pattern.details
          });
          break;

        case 'outlier':
          if (pattern.details.severity === 'high') {
            insights.push({
              category: 'opportunity',
              title: 'Exceptional Performance Instances',
              description: `Identified ${pattern.details.count} significant outliers that may represent breakthrough moments`,
              significance: 'high',
              confidence: pattern.confidence,
              actionable: true,
              recommendation: 'Investigate high-performing outliers to identify replicable success factors',
              supportingData: pattern.details
            });
          }
          break;

        case 'correlation':
          insights.push({
            category: 'pattern',
            title: 'Strong Data Relationship Found',
            description: `Strong ${pattern.details.strength > 0 ? 'positive' : 'negative'} correlation detected between variables`,
            significance: Math.abs(pattern.details.strength) > 0.8 ? 'high' : 'medium',
            confidence: pattern.confidence,
            actionable: true,
            recommendation: 'Leverage this relationship for predictive modeling and strategic decision-making',
            supportingData: pattern.details
          });
          break;
      }
    }

    // Generate domain-specific insights
    if (context?.domain) {
      const domainInsights = this.generateDomainInsights(data, context.domain, patterns);
      insights.push(...domainInsights);
    }

    return insights.sort((a, b) => {
      const severityWeight = { high: 3, medium: 2, low: 1 };
      return (severityWeight[b.significance] * b.confidence) - (severityWeight[a.significance] * a.confidence);
    });
  }

  /**
   * Detect anomalies in data
   */
  async detectAnomalies(
    data: any[][],
    options: {
      method?: 'zscore' | 'iqr' | 'isolation';
      threshold?: number;
      includeHeaders?: boolean;
    } = {}
  ): Promise<AnomalyDetection[]> {
    const { method = 'zscore', threshold = 2.5, includeHeaders = true } = options;
    const anomalies: AnomalyDetection[] = [];

    const dataRows = includeHeaders ? data.slice(1) : data;

    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const columnData = dataRows.map((row, rowIndex) => ({
        value: row[colIndex],
        rowIndex: rowIndex + (includeHeaders ? 1 : 0)
      })).filter(item => item.value !== null && item.value !== undefined && item.value !== '');

      if (!this.isNumericColumn(columnData.map(item => item.value))) continue;

      const numericData = columnData.map(item => ({
        value: parseFloat(item.value.toString()),
        rowIndex: item.rowIndex
      })).filter(item => !isNaN(item.value));

      switch (method) {
        case 'zscore':
          const zscoreAnomalies = this.detectZScoreAnomalies(numericData, colIndex, threshold);
          anomalies.push(...zscoreAnomalies);
          break;

        case 'iqr':
          const iqrAnomalies = this.detectIQRAnomalies(numericData, colIndex);
          anomalies.push(...iqrAnomalies);
          break;

        case 'isolation':
          const isolationAnomalies = this.detectIsolationAnomalies(numericData, colIndex);
          anomalies.push(...isolationAnomalies);
          break;
      }
    }

    return anomalies.sort((a, b) => {
      const severityWeight = { high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity];
    });
  }

  /**
   * Predict future trends
   */
  async predictTrends(
    data: any[][],
    options: {
      forecastPeriods?: number;
      includeHeaders?: boolean;
      columnIndex?: number;
    } = {}
  ): Promise<TrendPrediction[]> {
    const { forecastPeriods = 5, includeHeaders = true, columnIndex } = options;
    const predictions: TrendPrediction[] = [];

    const dataRows = includeHeaders ? data.slice(1) : data;
    const columnsToAnalyze = columnIndex !== undefined ? [columnIndex] : Array.from({ length: data[0].length }, (_, i) => i);

    for (const colIndex of columnsToAnalyze) {
      const columnData = dataRows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');

      if (!this.isNumericColumn(columnData)) continue;

      const numericData = columnData.map(val => parseFloat(val.toString())).filter(val => !isNaN(val));

      if (numericData.length < 3) continue;

      const prediction = this.calculateTrendPrediction(numericData, forecastPeriods);
      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * Assess data quality
   */
  async classifyDataQuality(
    data: any[][],
    options: {
      includeHeaders?: boolean;
      expectedTypes?: string[];
    } = {}
  ): Promise<DataQualityAssessment> {
    const { includeHeaders = true } = options;
    const dataRows = includeHeaders ? data.slice(1) : data;

    let totalCells = 0;
    let completeCells = 0;
    let validCells = 0;
    let consistentCells = 0;
    const issues: DataQualityAssessment['issues'] = [];

    // Analyze each column
    for (let colIndex = 0; colIndex < data[0].length; colIndex++) {
      const columnData = dataRows.map(row => row[colIndex]);
      totalCells += columnData.length;

      // Completeness analysis
      const nonEmptyValues = columnData.filter(val => val !== null && val !== undefined && val !== '');
      completeCells += nonEmptyValues.length;

      if (nonEmptyValues.length < columnData.length) {
        issues.push({
          type: 'missing',
          count: columnData.length - nonEmptyValues.length,
          description: `Column ${colIndex + 1} has missing values`,
          severity: (columnData.length - nonEmptyValues.length) / columnData.length > 0.2 ? 'high' : 'medium'
        });
      }

      // Consistency analysis
      const dataTypes = this.analyzeColumnDataTypes(nonEmptyValues);
      const dominantType = Object.keys(dataTypes).reduce((a, b) => dataTypes[a] > dataTypes[b] ? a : b);
      const consistentCount = dataTypes[dominantType];
      consistentCells += consistentCount;

      if (consistentCount < nonEmptyValues.length) {
        issues.push({
          type: 'inconsistent',
          count: nonEmptyValues.length - consistentCount,
          description: `Column ${colIndex + 1} has mixed data types`,
          severity: (nonEmptyValues.length - consistentCount) / nonEmptyValues.length > 0.1 ? 'high' : 'medium'
        });
      }

      // Validity analysis (for numeric columns)
      if (this.isNumericColumn(nonEmptyValues)) {
        const validNumbers = nonEmptyValues.filter(val => !isNaN(parseFloat(val.toString())));
        validCells += validNumbers.length;

        if (validNumbers.length < nonEmptyValues.length) {
          issues.push({
            type: 'invalid',
            count: nonEmptyValues.length - validNumbers.length,
            description: `Column ${colIndex + 1} has invalid numeric values`,
            severity: 'medium'
          });
        }
      } else {
        validCells += nonEmptyValues.length; // Non-numeric columns are considered valid if not empty
      }

      // Duplicate detection
      const uniqueValues = new Set(nonEmptyValues.map(val => val.toString()));
      if (uniqueValues.size < nonEmptyValues.length) {
        issues.push({
          type: 'duplicate',
          count: nonEmptyValues.length - uniqueValues.size,
          description: `Column ${colIndex + 1} has duplicate values`,
          severity: 'low'
        });
      }
    }

    const completeness = totalCells > 0 ? completeCells / totalCells : 1;
    const accuracy = totalCells > 0 ? validCells / totalCells : 1;
    const consistency = totalCells > 0 ? consistentCells / totalCells : 1;
    const validity = completeness * accuracy; // Simplified validity calculation

    return {
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      validity: Math.round(validity * 100) / 100,
      overall: Math.round((completeness + accuracy + consistency + validity) * 25) / 100,
      issues
    };
  }

  // Private helper methods
  private isNumericColumn(data: any[]): boolean {
    if (data.length === 0) return false;
    const numericCount = data.filter(val => !isNaN(parseFloat(val.toString()))).length;
    return numericCount / data.length > 0.8;
  }

  private isTextColumn(data: any[]): boolean {
    return !this.isNumericColumn(data);
  }

  private detectTrend(data: number[]): DataPattern {
    if (data.length < 3) {
      return { type: 'trend', description: 'Insufficient data for trend analysis', confidence: 0, details: {} };
    }

    // Simple linear regression for trend detection
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const totalSumSquares = data.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = data.reduce((sum, yi, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    const trendStrength = Math.abs(slope) / (data.reduce((sum, val) => sum + Math.abs(val), 0) / n);

    return {
      type: 'trend',
      description: slope > 0 ? 'Increasing trend detected' : slope < 0 ? 'Decreasing trend detected' : 'No significant trend',
      confidence: Math.max(0, Math.min(1, rSquared)),
      details: {
        slope,
        intercept,
        rSquared,
        direction: slope,
        strength: trendStrength
      },
      recommendation: slope > 0 ? 'Monitor for sustained growth opportunities' : slope < 0 ? 'Investigate potential issues causing decline' : 'Data appears stable'
    };
  }

  private detectSeasonality(data: number[]): DataPattern {
    if (data.length < 12) {
      return { type: 'seasonal', description: 'Insufficient data for seasonality analysis', confidence: 0, details: {} };
    }

    // Simple autocorrelation for seasonality detection
    const periods = [4, 7, 12, 24]; // Common seasonal periods
    let bestPeriod = 0;
    let bestCorrelation = 0;

    for (const period of periods) {
      if (data.length < period * 2) continue;

      const correlation = this.calculateAutocorrelation(data, period);
      if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    const isSignificant = Math.abs(bestCorrelation) > 0.3;

    return {
      type: 'seasonal',
      description: isSignificant ? `Seasonal pattern detected with ${bestPeriod}-period cycle` : 'No significant seasonality detected',
      confidence: Math.abs(bestCorrelation),
      details: {
        period: bestPeriod,
        correlation: bestCorrelation,
        strength: Math.abs(bestCorrelation)
      }
    };
  }

  private detectOutliers(data: number[], columnIndex: number): DataPattern[] {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);

    const outliers = data.map((val, index) => ({
      value: val,
      index,
      zscore: Math.abs((val - mean) / stdDev)
    })).filter(item => item.zscore > 2);

    if (outliers.length === 0) {
      return [];
    }

    const severity = outliers.length / data.length > 0.1 ? 'high' : outliers.length / data.length > 0.05 ? 'medium' : 'low';

    return [{
      type: 'outlier',
      description: `${outliers.length} outliers detected in column ${columnIndex + 1}`,
      confidence: Math.min(1, outliers.length / data.length * 5),
      details: {
        count: outliers.length,
        severity,
        outliers: outliers.slice(0, 5), // Limit to first 5 for performance
        threshold: 2
      }
    }];
  }

  private analyzeDistribution(data: number[], columnIndex: number): DataPattern {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Skewness calculation
    const skewness = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / data.length;

    // Kurtosis calculation
    const kurtosis = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / data.length - 3;

    let distributionType = 'normal';
    if (Math.abs(skewness) > 1) {
      distributionType = skewness > 0 ? 'right-skewed' : 'left-skewed';
    } else if (Math.abs(kurtosis) > 1) {
      distributionType = kurtosis > 0 ? 'heavy-tailed' : 'light-tailed';
    }

    return {
      type: 'distribution',
      description: `Data follows a ${distributionType} distribution`,
      confidence: 0.8,
      details: {
        mean,
        variance,
        stdDev,
        skewness,
        kurtosis,
        type: distributionType
      }
    };
  }

  private analyzeTextPatterns(data: any[], columnIndex: number): DataPattern[] {
    const patterns: DataPattern[] = [];
    const textData = data.map(val => val.toString());

    // Length patterns
    const lengths = textData.map(text => text.length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const lengthVariance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;

    if (lengthVariance < avgLength * 0.1) {
      patterns.push({
        type: 'distribution',
        description: 'Consistent text length pattern detected',
        confidence: 0.8,
        details: { avgLength, variance: lengthVariance, type: 'consistent_length' }
      });
    }

    // Format patterns (email, phone, etc.)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[\d\s\-\(\)]+$/;
    const urlPattern = /^https?:\/\/.+/;

    const emailCount = textData.filter(text => emailPattern.test(text)).length;
    const phoneCount = textData.filter(text => phonePattern.test(text)).length;
    const urlCount = textData.filter(text => urlPattern.test(text)).length;

    if (emailCount / textData.length > 0.8) {
      patterns.push({
        type: 'distribution',
        description: 'Email format pattern detected',
        confidence: emailCount / textData.length,
        details: { type: 'email', count: emailCount }
      });
    }

    if (phoneCount / textData.length > 0.8) {
      patterns.push({
        type: 'distribution',
        description: 'Phone number format pattern detected',
        confidence: phoneCount / textData.length,
        details: { type: 'phone', count: phoneCount }
      });
    }

    return patterns;
  }

  private detectCorrelations(data: any[][]): DataPattern[] {
    const patterns: DataPattern[] = [];
    const numericColumns: { index: number; data: number[] }[] = [];

    // Identify numeric columns
    for (let i = 0; i < data[0].length; i++) {
      const columnData = data.map(row => row[i]).filter(val => val !== null && val !== undefined && val !== '');
      if (this.isNumericColumn(columnData)) {
        const numericData = columnData.map(val => parseFloat(val.toString())).filter(val => !isNaN(val));
        numericColumns.push({ index: i, data: numericData });
      }
    }

    // Calculate correlations between numeric columns
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const correlation = this.calculateCorrelation(numericColumns[i].data, numericColumns[j].data);

        if (Math.abs(correlation) > 0.5) {
          patterns.push({
            type: 'correlation',
            description: `${Math.abs(correlation) > 0.8 ? 'Strong' : 'Moderate'} ${correlation > 0 ? 'positive' : 'negative'} correlation between columns ${numericColumns[i].index + 1} and ${numericColumns[j].index + 1}`,
            confidence: Math.abs(correlation),
            details: {
              column1: numericColumns[i].index,
              column2: numericColumns[j].index,
              strength: correlation,
              type: correlation > 0 ? 'positive' : 'negative'
            }
          });
        }
      }
    }

    return patterns;
  }

  private calculateAutocorrelation(data: number[], lag: number): number {
    if (data.length <= lag) return 0;

    const n = data.length - lag;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }

    for (let i = 0; i < data.length; i++) {
      denominator += Math.pow(data[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private detectZScoreAnomalies(data: { value: number; rowIndex: number }[], columnIndex: number, threshold: number): AnomalyDetection[] {
    const values = data.map(item => item.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    return data.filter(item => {
      const zscore = Math.abs((item.value - mean) / stdDev);
      return zscore > threshold;
    }).map(item => ({
      value: item.value,
      row: item.rowIndex,
      column: columnIndex,
      anomalyType: 'statistical' as const,
      severity: Math.abs((item.value - mean) / stdDev) > threshold * 1.5 ? 'high' as const : 'medium' as const,
      zscore: (item.value - mean) / stdDev,
      explanation: `Value ${item.value} is ${Math.abs((item.value - mean) / stdDev).toFixed(2)} standard deviations from the mean`
    }));
  }

  private detectIQRAnomalies(data: { value: number; rowIndex: number }[], columnIndex: number): AnomalyDetection[] {
    const values = data.map(item => item.value).sort((a, b) => a - b);
    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(item => item.value < lowerBound || item.value > upperBound)
      .map(item => ({
        value: item.value,
        row: item.rowIndex,
        column: columnIndex,
        anomalyType: 'statistical' as const,
        severity: (item.value < q1 - 3 * iqr || item.value > q3 + 3 * iqr) ? 'high' as const : 'medium' as const,
        explanation: `Value ${item.value} is outside the IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`
      }));
  }

  private detectIsolationAnomalies(data: { value: number; rowIndex: number }[], columnIndex: number): AnomalyDetection[] {
    // Simplified isolation forest algorithm
    const values = data.map(item => item.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    // Use distance from cluster center as isolation score
    return data.filter(item => {
      const distance = Math.abs(item.value - mean) / stdDev;
      return distance > 2; // Simplified threshold
    }).map(item => ({
      value: item.value,
      row: item.rowIndex,
      column: columnIndex,
      anomalyType: 'contextual' as const,
      severity: Math.abs(item.value - mean) / stdDev > 3 ? 'high' as const : 'medium' as const,
      explanation: `Value ${item.value} is isolated from the main data cluster`
    }));
  }

  private calculateTrendPrediction(data: number[], forecastPeriods: number): TrendPrediction {
    // Simple linear extrapolation
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predictions
    const predictedValues = Array.from({ length: forecastPeriods }, (_, i) =>
      slope * (n + i) + intercept
    );

    // Calculate confidence based on R-squared
    const yMean = sumY / n;
    const totalSumSquares = data.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = data.reduce((sum, yi, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    // Determine trend direction
    let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 'stable';
    if (Math.abs(slope) > 0.1) {
      trend = slope > 0 ? 'increasing' : 'decreasing';
    }

    // Check for volatility
    const volatility = Math.sqrt(residualSumSquares / n);
    const dataRange = Math.max(...data) - Math.min(...data);
    if (volatility / dataRange > 0.2) {
      trend = 'volatile';
    }

    return {
      trend,
      direction: slope,
      confidence: Math.max(0, Math.min(1, rSquared)),
      predictedValues,
      seasonality: {
        detected: false // Would need more sophisticated analysis
      }
    };
  }

  private generateDomainInsights(data: any[][], domain: string, patterns: DataPattern[]): DataInsight[] {
    const insights: DataInsight[] = [];

    switch (domain) {
      case 'sales':
        // Sales-specific insights
        const salesTrends = patterns.filter(p => p.type === 'trend');
        for (const trend of salesTrends) {
          if (trend.details.direction > 0) {
            insights.push({
              category: 'performance',
              title: 'Sales Growth Opportunity',
              description: 'Positive sales trend indicates market demand or effective strategies',
              significance: 'high',
              confidence: trend.confidence,
              actionable: true,
              recommendation: 'Scale successful products/regions and analyze growth drivers for replication'
            });
          }
        }
        break;

      case 'finance':
        // Financial insights
        const outliers = patterns.filter(p => p.type === 'outlier');
        for (const outlier of outliers) {
          insights.push({
            category: 'risk',
            title: 'Financial Anomaly Detected',
            description: 'Unusual financial values require investigation',
            significance: 'high',
            confidence: outlier.confidence,
            actionable: true,
            recommendation: 'Review transactions and verify data accuracy for compliance'
          });
        }
        break;

      case 'marketing':
        // Marketing insights
        const seasonal = patterns.filter(p => p.type === 'seasonal');
        for (const season of seasonal) {
          insights.push({
            category: 'opportunity',
            title: 'Marketing Campaign Timing',
            description: 'Seasonal patterns suggest optimal campaign periods',
            significance: 'medium',
            confidence: season.confidence,
            actionable: true,
            recommendation: 'Align marketing spend and campaigns with identified seasonal peaks'
          });
        }
        break;
    }

    return insights;
  }

  private analyzeColumnDataTypes(data: any[]): { [type: string]: number } {
    const types: { [type: string]: number } = {
      number: 0,
      string: 0,
      boolean: 0,
      date: 0
    };

    for (const value of data) {
      if (typeof value === 'number' || !isNaN(parseFloat(value.toString()))) {
        types.number++;
      } else if (typeof value === 'boolean' || value === 'true' || value === 'false') {
        types.boolean++;
      } else if (this.isDateString(value.toString())) {
        types.date++;
      } else {
        types.string++;
      }
    }

    return types;
  }

  private isDateString(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.length > 4;
  }
}