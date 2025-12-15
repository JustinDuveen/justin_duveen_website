import { BusinessModel, BusinessContext, RedFlag } from './types.js';

export class BusinessModelValidator {

  // Detect business model from user input
  static detectBusinessModel(description: string): BusinessModel {
    const desc = description.toLowerCase();

    // SaaS indicators
    const saasKeywords = ['subscription', 'recurring', 'saas', 'monthly', 'mrr', 'arr', 'churn', 'seats'];
    const hasSaasKeywords = saasKeywords.some(keyword => desc.includes(keyword));

    // Marketplace indicators
    const marketplaceKeywords = ['marketplace', 'platform', 'commission', 'take rate', 'gmv', 'two-sided', 'buyers', 'sellers'];
    const hasMarketplaceKeywords = marketplaceKeywords.some(keyword => desc.includes(keyword));

    // eCommerce indicators
    const ecommerceKeywords = ['ecommerce', 'e-commerce', 'products', 'inventory', 'shipping', 'orders', 'aov'];
    const hasEcommerceKeywords = ecommerceKeywords.some(keyword => desc.includes(keyword));

    if (hasSaasKeywords && !hasMarketplaceKeywords) return 'saas';
    if (hasMarketplaceKeywords && !hasSaasKeywords) return 'marketplace';
    if (hasEcommerceKeywords && !hasSaasKeywords && !hasMarketplaceKeywords) return 'ecommerce';
    if ((hasSaasKeywords && hasMarketplaceKeywords) || (hasSaasKeywords && hasEcommerceKeywords)) return 'hybrid';

    return 'unknown';
  }

  // Generate clarifying questions based on detected model
  static getClarifyingQuestions(model: BusinessModel): string[] {
    const baseQuestions = [
      'What is your current traction? (revenue, customers, growth rate)',
      'What is your current burn rate and runway?',
      'What funding stage are you at or targeting?'
    ];

    switch (model) {
      case 'saas':
        return [
          ...baseQuestions,
          'What is your pricing model? (per user, per company, usage-based)',
          'What is your current MRR/ARR?',
          'What is your monthly churn rate?',
          'Do you serve enterprise, SMB, or both?',
          'Is it self-serve or sales-driven?',
          'What is your customer acquisition cost and lifetime value?'
        ];

      case 'marketplace':
        return [
          ...baseQuestions,
          'What is your take rate (commission percentage)?',
          'Are you supply-side or demand-side limited?',
          'What is your current GMV and transaction volume?',
          'What does it cost to acquire suppliers vs buyers?',
          'Do you have supply/demand balance issues?'
        ];

      case 'ecommerce':
        return [
          ...baseQuestions,
          'What is your average order value (AOV)?',
          'What is your repeat purchase rate?',
          'Where do you acquire customers and at what cost?',
          'What are your unit economics? (COGS, shipping, fulfillment)',
          'What is your gross margin after all costs?'
        ];

      case 'hybrid':
        return [
          ...baseQuestions,
          'Which revenue streams are primary? (subscription, transaction, product sales)',
          'How do the different revenue models interact?',
          'What are the unit economics for each revenue stream?'
        ];

      default:
        return [
          ...baseQuestions,
          'How do you make money? (describe your revenue model)',
          'What are your key revenue drivers?',
          'How do you acquire and retain customers?'
        ];
    }
  }

  // Validate unit economics and flag red flags
  static validateUnitEconomics(context: BusinessContext): RedFlag[] {
    const redFlags: RedFlag[] = [];
    const { model, unitEconomics } = context;

    switch (model) {
      case 'saas':
        // Churn rate validation
        if (unitEconomics.churn && unitEconomics.churn > 5) {
          redFlags.push({
            metric: 'Monthly Churn Rate',
            value: unitEconomics.churn,
            threshold: 5,
            severity: 'critical',
            explanation: 'Monthly churn above 5% means losing 60%+ customers annually',
            recommendation: 'Focus on product-market fit and customer success before scaling'
          });
        }

        // LTV:CAC ratio validation
        if (unitEconomics.ltv && unitEconomics.cac) {
          const ltvCacRatio = unitEconomics.ltv / unitEconomics.cac;
          if (ltvCacRatio < 3) {
            redFlags.push({
              metric: 'LTV:CAC Ratio',
              value: ltvCacRatio,
              threshold: 3,
              severity: ltvCacRatio < 2 ? 'critical' : 'warning',
              explanation: 'LTV:CAC ratio below 3x indicates insufficient margin for growth',
              recommendation: 'Either reduce CAC through better conversion or increase LTV through pricing/retention'
            });
          }
        }

        // Gross margin validation
        if (unitEconomics.grossMargin && unitEconomics.grossMargin < 60) {
          redFlags.push({
            metric: 'Gross Margin',
            value: unitEconomics.grossMargin,
            threshold: 60,
            severity: 'warning',
            explanation: 'SaaS gross margin below 60% limits scalability',
            recommendation: 'Optimize infrastructure costs and pricing structure'
          });
        }
        break;

      case 'marketplace':
        // Take rate validation
        if (unitEconomics.takeRate && unitEconomics.takeRate < 15) {
          redFlags.push({
            metric: 'Take Rate',
            value: unitEconomics.takeRate,
            threshold: 15,
            severity: 'warning',
            explanation: 'Take rate below 15% may not support sustainable operations',
            recommendation: 'Evaluate value proposition and pricing power'
          });
        }
        break;

      case 'ecommerce':
        // CAC to AOV ratio
        if (unitEconomics.cac && unitEconomics.aov) {
          const cacAovRatio = (unitEconomics.cac / unitEconomics.aov) * 100;
          if (cacAovRatio > 30) {
            redFlags.push({
              metric: 'CAC as % of AOV',
              value: cacAovRatio,
              threshold: 30,
              severity: 'critical',
              explanation: 'CAC above 30% of AOV means losing money on first purchase',
              recommendation: 'Improve organic acquisition or increase AOV through bundling/upsells'
            });
          }
        }
        break;
    }

    return redFlags;
  }

  // Generate business insights based on context
  static generateBusinessInsights(context: BusinessContext): string[] {
    const insights: string[] = [];
    const { model, currentTraction, unitEconomics, fundraising } = context;

    // Growth trajectory insights
    if (currentTraction.revenue && currentTraction.growthRate) {
      const monthsToBreakeven = fundraising.burnRate ?
        Math.log(fundraising.burnRate / currentTraction.revenue) / Math.log(1 + currentTraction.growthRate / 100) :
        null;

      if (monthsToBreakeven) {
        insights.push(`At ${currentTraction.growthRate}% MoM growth, you'll reach $${fundraising.burnRate?.toLocaleString()}/month (breakeven) in ~${Math.ceil(monthsToBreakeven)} months`);
      }
    }

    // Unit economics insights
    if (model === 'saas' && unitEconomics.ltv && unitEconomics.cac) {
      const paybackMonths = unitEconomics.cac / (currentTraction.revenue || 0 / (currentTraction.customers || 1));
      insights.push(`CAC payback period: ~${paybackMonths.toFixed(1)} months (healthy is <15 months)`);
    }

    // Fundraising insights
    if (fundraising.runway && fundraising.runway < 12) {
      insights.push(`⚠️ Low runway (${fundraising.runway} months) - prioritize fundraising or path to profitability`);
    }

    return insights;
  }

  // Generate investor narrative
  static generateInvestorNarrative(context: BusinessContext): string {
    const { model, currentTraction, unitEconomics, fundraising } = context;

    let narrative = `We're a ${model} company `;

    if (currentTraction.revenue && currentTraction.customers) {
      narrative += `with ${currentTraction.customers} customers and $${currentTraction.revenue.toLocaleString()}/month revenue. `;
    }

    if (currentTraction.growthRate) {
      narrative += `Growing ${currentTraction.growthRate}% month-over-month. `;
    }

    if (unitEconomics.ltv && unitEconomics.cac && model === 'saas') {
      const ratio = unitEconomics.ltv / unitEconomics.cac;
      narrative += `Strong unit economics with ${ratio.toFixed(1)}x LTV:CAC ratio. `;
    }

    if (fundraising.burnRate && fundraising.targetRaise) {
      const runway = fundraising.targetRaise / fundraising.burnRate;
      narrative += `Raising $${fundraising.targetRaise.toLocaleString()} for ${runway.toFixed(0)} months runway to reach profitability.`;
    }

    return narrative;
  }
}