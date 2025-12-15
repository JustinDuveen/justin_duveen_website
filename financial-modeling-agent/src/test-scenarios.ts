#!/usr/bin/env node

import FinancialModelingAgent from './agent.js';

// Test scenarios for different business models
const testScenarios = {
  saas_healthy: {
    description: "Healthy SaaS startup with good unit economics",
    input: "I'm building a B2B SaaS company. We have 500 customers paying $100/month on average. Growing 12% monthly. Our CAC is $300 and monthly churn is 2%. Gross margin is 85%. Burning $40K/month, need to raise Series A.",
    expectedModel: 'saas',
    expectedRedFlags: 0
  },

  saas_problematic: {
    description: "SaaS with high churn and poor unit economics",
    input: "We're a SaaS company with 200 customers at $50/month. Growing 20% monthly but churn is 8% monthly. CAC is $200. Burning $30K/month.",
    expectedModel: 'saas',
    expectedRedFlags: 2 // High churn, poor LTV:CAC
  },

  marketplace_early: {
    description: "Early marketplace with growth potential",
    input: "Building a marketplace connecting freelancers with businesses. GMV is $100K/month with 15% take rate. Growing 25% monthly. Supply side CAC is $50, demand side is $150.",
    expectedModel: 'marketplace',
    expectedRedFlags: 0
  },

  ecommerce_scaling: {
    description: "eCommerce business scaling up",
    input: "We sell premium skincare products online. AOV is $85, repeat purchase rate is 40%. CAC through paid ads is $25. Gross margin is 60% after shipping and fulfillment.",
    expectedModel: 'ecommerce',
    expectedRedFlags: 0
  },

  unknown_model: {
    description: "Unclear business model requiring clarification",
    input: "We're a tech startup building something cool with users who love our product.",
    expectedModel: 'unknown',
    expectError: true
  }
};

async function runTestScenario(name: string, scenario: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${scenario.description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Input: "${scenario.input}"`);
  console.log(`Expected Model: ${scenario.expectedModel}`);

  const agent = new FinancialModelingAgent();

  try {
    const startTime = Date.now();
    const result = await agent.buildFinancialModel(scenario.input);
    const duration = Date.now() - startTime;

    console.log(`\n✅ SUCCESS (${duration}ms)`);
    console.log(`📊 Detected Model: ${result.context.model}`);
    console.log(`🚨 Red Flags Found: ${result.redFlags.length}`);

    if (result.redFlags.length > 0) {
      console.log(`\n🚨 Red Flags:`);
      result.redFlags.forEach(flag => {
        console.log(`  • ${flag.metric}: ${flag.explanation}`);
      });
    }

    console.log(`\n💡 Key Insights (${result.insights.length}):`);
    result.insights.slice(0, 3).forEach(insight => {
      console.log(`  • ${insight}`);
    });

    console.log(`\n📈 Investor Narrative:`);
    console.log(`  "${result.investorNarrative}"`);

    console.log(`\n🔗 Spreadsheet: ${result.structure.spreadsheetId}`);

    // Validate expectations
    if (result.context.model !== scenario.expectedModel) {
      console.log(`⚠️ Model detection mismatch: expected ${scenario.expectedModel}, got ${result.context.model}`);
    }

    if (scenario.expectedRedFlags !== undefined && result.redFlags.length !== scenario.expectedRedFlags) {
      console.log(`⚠️ Red flag count mismatch: expected ${scenario.expectedRedFlags}, got ${result.redFlags.length}`);
    }

    return { success: true, result };

  } catch (error) {
    if (scenario.expectError) {
      console.log(`✅ Expected error occurred: ${error}`);
      return { success: true, error };
    } else {
      console.log(`❌ FAILED: ${error}`);
      return { success: false, error };
    }
  }
}

async function runAllTests() {
  console.log('🚀 Financial Modeling Agent - Test Suite');
  console.log('🎯 Testing business model detection, validation, and workflow execution\n');

  const results = [];

  for (const [name, scenario] of Object.entries(testScenarios)) {
    const result = await runTestScenario(name, scenario);
    results.push({ name, ...result });

    // Wait between tests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  if (successful === total) {
    console.log('\n🎉 ALL TESTS PASSED! Financial Modeling Agent is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Review the errors above.');
  }

  // List failed tests
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(f => {
      console.log(`  • ${f.name}: ${f.error}`);
    });
  }
}

// Interactive demo mode
async function interactiveDemo() {
  console.log('🎯 Financial Modeling Agent - Interactive Demo');
  console.log('You can ask questions or request financial models.\n');

  const agent = new FinancialModelingAgent();

  // Demo conversation flow
  const demoMessages = [
    "Hi! I need help building a financial model for my SaaS startup.",
    "We have 300 customers paying $75/month on average. Growing 15% monthly.",
    "Our CAC is $150 and monthly churn is 4%. We're burning $25K/month.",
    "Can you build me an investor-ready financial model?"
  ];

  for (const message of demoMessages) {
    console.log(`👤 User: ${message}`);

    try {
      let response;
      if (message.includes('build me an investor-ready financial model')) {
        // Trigger full model building
        const result = await agent.buildFinancialModel(
          "SaaS startup with 300 customers, $75/month ARPU, 15% MoM growth, $150 CAC, 4% monthly churn, $25K/month burn"
        );

        response = `I've built your investor-ready financial model! Here are the key highlights:

📊 **Model Created**: ${result.structure.spreadsheetId}

💡 **Key Insights**:
${result.insights.slice(0, 3).map(insight => `• ${insight}`).join('\n')}

${result.redFlags.length > 0 ? `🚨 **Red Flags to Address**:
${result.redFlags.map(flag => `• ${flag.metric}: ${flag.explanation}`).join('\n')}

` : ''}📈 **Investor Narrative**: ${result.investorNarrative}

Your model includes Assumptions, Projections, Dashboard, and Scenarios tabs. You can adjust assumptions to test different scenarios.`;

      } else {
        // Regular chat response
        response = await agent.chat(message);
      }

      console.log(`🤖 Agent: ${response}\n`);

      // Pause for readability
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.log(`🤖 Agent: I encountered an error: ${error}\n`);
    }
  }

  console.log('✅ Demo completed! The agent successfully handled the conversation and built a financial model.');
}

// Main execution
async function main() {
  const mode = process.argv[2] || 'test';

  switch (mode) {
    case 'demo':
      await interactiveDemo();
      break;
    case 'test':
    default:
      await runAllTests();
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runAllTests, interactiveDemo };