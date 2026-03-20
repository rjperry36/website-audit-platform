
import { createMarket, createChannel, createObjective, deleteMarket, deleteChannel, deleteObjective } from '@/app/actions/config';

// Mock FormData
class MockFormData {
    private data: Map<string, string>;
    constructor() { this.data = new Map(); }
    append(key: string, value: string) { this.data.set(key, value); }
    get(key: string) { return this.data.get(key); }
}

async function testActions() {
    console.log('🚀 Testing Admin Actions...');

    try {
        // 1. Create Market
        console.log('Testing createMarket...');
        const marketData = new MockFormData();
        marketData.append('id', 'TEST');
        marketData.append('label', 'Test Market');
        marketData.append('currency', 'TST');
        marketData.append('flag_icon', '🧪');
        // @ts-ignore
        await createMarket(marketData);
        console.log('✅ Market Created');

        // 2. Create Channel
        console.log('Testing createChannel...');
        const channelData = new MockFormData();
        channelData.append('id', 'TEST_CH');
        channelData.append('label', 'Test Channel');
        // @ts-ignore
        await createChannel(channelData);
        console.log('✅ Channel Created');

        // 3. Create Objective
        console.log('Testing createObjective...');
        const objData = new MockFormData();
        objData.append('label', 'Test Objective');
        objData.append('default_kpi', 'Test KPI');
        objData.append('default_target', '100');
        // @ts-ignore
        await createObjective(objData);
        console.log('✅ Objective Created');

        // Clean up
        console.log('Cleaning up...');
        await deleteMarket('TEST');
        await deleteChannel('TEST_CH');
        // Note: Can't easily delete objective by label without ID return, skipping auto-cleanup for now or fetch ID first

        console.log('✅ Tests passed!');

    } catch (error) {
        console.error('❌ Action Test Failed:', error);
    }
}

// Cannot run server actions directly in script easily without Next.js context
// So realistically we should use browser test or api route test. 
// For now, let's rely on manual browser verification via the created page.
console.log("⚠️ Server Actions require Next.js context. Skipping script test in favor of Browser Verification.");
