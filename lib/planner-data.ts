import { ReactNode } from 'react';

import { InitiativeType } from './initiatives';

export interface PlannerResource {
    label: string;
    url: string;
}

export interface PlannerEvent {
    id: string;
    title: string;
    startWeek: number; // Global week number (e.g., 8 to 60)
    durationWeeks: number;
    type: InitiativeType | string;
    rowId: string; // Kept for legacy compatibility if needed, though filtering uses type now
    // New Fields for Rich Hover
    description?: string;
    tags?: string[];
    outcome?: string;
    resources?: PlannerResource[];
    imageUrl?: string;
}

export interface PlannerRow {
    id: string;
    label?: string; // Optional label for the row
}

export interface MonthData {
    name: string;
    startWeek: number;
    endWeek: number;
}

// 12 Months of data starting from AUG (Week 8)
export const months: MonthData[] = [
    { name: 'AUG', startWeek: 8, endWeek: 11 },
    { name: 'SEP', startWeek: 12, endWeek: 16 },
    { name: 'OCT', startWeek: 17, endWeek: 20 },
    { name: 'NOV', startWeek: 21, endWeek: 24 },
    { name: 'DEC', startWeek: 25, endWeek: 29 },
    { name: 'JAN', startWeek: 30, endWeek: 33 },
    { name: 'FEB', startWeek: 34, endWeek: 37 },
    { name: 'MAR', startWeek: 38, endWeek: 42 },
    { name: 'APR', startWeek: 43, endWeek: 46 },
    { name: 'MAY', startWeek: 47, endWeek: 51 },
    { name: 'JUN', startWeek: 52, endWeek: 55 },
    { name: 'JUL', startWeek: 56, endWeek: 59 },
];

// Generate weeks from start of Aug (8) to end of July (59)
export const weeks = Array.from({ length: 59 - 8 + 1 }, (_, i) => i + 8);

// Helper to generate consistent mock data for new fields
const mockResources = [
    { label: 'Global Playbook', url: '#' },
    { label: 'Asset Toolkit', url: '#' },
    { label: 'Figma Templates', url: '#' },
];

export const staticEvents: PlannerEvent[] = [
    // --- ROW 1: Local & Launch ---
    {
        id: '1', title: "WOMEN'S DAYS", startWeek: 12, durationWeeks: 4, type: 'LOCAL', rowId: 'row1',
        description: 'Global campaign celebrating achievements of women in our community.',
        outcome: 'Expected +5% engagement on social channels.',
        tags: ['Community', 'Social', 'Brand'],
        resources: mockResources,
        imageUrl: '/placeholder-campaign.jpg'
    },
    {
        id: '101', title: "Summer Kickoff", startWeek: 22, durationWeeks: 3, type: 'LOCAL', rowId: 'row1',
        description: 'Local activation events for the start of the summer season.',
        outcome: 'Drive +10% footfall to retail locations.',
        tags: ['Retail', 'Summer', 'Activation']
    },
    { id: '102', title: "Store Opening: London", startWeek: 35, durationWeeks: 4, type: 'LOCAL', rowId: 'row1' },
    { id: '103', title: "Winter Festival", startWeek: 48, durationWeeks: 5, type: 'LOCAL', rowId: 'row1' },

    // --- ROW 2: Promotions & Sales ---
    {
        id: '201', title: "Black Friday Cyber Monday", startWeek: 21, durationWeeks: 2, type: 'PROMOTION', rowId: 'row2',
        description: 'Major annual sales event across all digital channels.',
        outcome: 'Target: $2.5M Revenue (+15% YoY)',
        tags: ['Sales', 'Global', 'High Impact'],
        resources: mockResources
    },
    { id: '202', title: "Summer Sale", startWeek: 26, durationWeeks: 4, type: 'PROMOTION', rowId: 'row2' },
    { id: '203', title: "Spring Flash Sale", startWeek: 40, durationWeeks: 1, type: 'PROMOTION', rowId: 'row2' },
    { id: '204', title: "Holiday Bundle Promo", startWeek: 50, durationWeeks: 4, type: 'PROMOTION', rowId: 'row2' },

    // --- ROW 3: Loyalty & Club ---
    {
        id: '301', title: "Loyalty Tier Reveal", startWeek: 10, durationWeeks: 3, type: 'LOYALTY', rowId: 'row3',
        description: 'Launch of new Platinum tier for top customers.',
        outcome: 'Increase retention by 3% among high-value segments.',
        tags: ['Retention', 'Club', 'Launch']
    },
    { id: '302', title: "Double Points Week", startWeek: 18, durationWeeks: 1, type: 'LOYALTY', rowId: 'row3' },
    { id: '303', title: "Club Member Exclusive", startWeek: 30, durationWeeks: 2, type: 'CLUB', rowId: 'row3' },
    { id: '304', title: "Referral Bonus Program", startWeek: 42, durationWeeks: 4, type: 'LOYALTY', rowId: 'row3' },

    // --- ROW 4: E-Commerce & SEO ---
    {
        id: '401', title: "Checkout Redesign", startWeek: 14, durationWeeks: 6, type: 'ECOM', rowId: 'row4',
        description: 'Complete overhaul of checkout UX based on Q1 audit findings.',
        outcome: 'Reduce cart abandonment by 8%.',
        tags: ['UX', 'Conversion', 'Tech']
    },
    { id: '402', title: "Q3 SEO Technical Audit", startWeek: 28, durationWeeks: 4, type: 'SEO', rowId: 'row4' },
    { id: '403', title: "PDP Image Optimization", startWeek: 45, durationWeeks: 3, type: 'ECOM', rowId: 'row4' },
    { id: '404', title: "Core Web Vitals Sprint", startWeek: 52, durationWeeks: 4, type: 'SEO', rowId: 'row4' },

    // --- ROW 5: Social & Articles ---
    { id: '501', title: "Sustainability Report", startWeek: 16, durationWeeks: 2, type: 'ARTICLE', rowId: 'row5' },
    {
        id: '502', title: "Influencer Summer Camp", startWeek: 24, durationWeeks: 8, type: 'SOCIAL', rowId: 'row5',
        description: 'Partnership with 50 top lifestyle influencers for summer content creation.',
        outcome: 'Generate 10M impressions on Instagram/TikTok.',
        tags: ['Social', 'Influencer', 'Content']
    },
    { id: '503', title: "Holiday Gift Guide", startWeek: 46, durationWeeks: 3, type: 'ARTICLE', rowId: 'row5' },
    { id: '504', title: "Brand Story Series", startWeek: 55, durationWeeks: 4, type: 'SOCIAL', rowId: 'row5' },

    // --- ROW 6: Lifecycle & Email ---
    { id: '601', title: "Win-back Automation", startWeek: 20, durationWeeks: 4, type: 'LIFECYCLE', rowId: 'row6' },
    { id: '602', title: "Welcome Series V2", startWeek: 34, durationWeeks: 4, type: 'LIFECYCLE', rowId: 'row6' },
    { id: '603', title: "Cart Abandonment Flow", startWeek: 44, durationWeeks: 3, type: 'LIFECYCLE', rowId: 'row6' },

    // --- ROW 7: Blog Content ---
    { id: '701', title: "Spring Trends 2026", startWeek: 11, durationWeeks: 3, type: 'BLOG', rowId: 'row7' },
    { id: '702', title: "How-To Guides Series", startWeek: 25, durationWeeks: 5, type: 'BLOG', rowId: 'row7' },
    { id: '703', title: "Customer Spotlight", startWeek: 38, durationWeeks: 2, type: 'BLOG', rowId: 'row7' },
    { id: '704', title: "Year in Review", startWeek: 56, durationWeeks: 2, type: 'BLOG', rowId: 'row7' },

    // --- ROW 8: Design & Tech Releases ---
    {
        id: '801', title: "Design System 2.0", startWeek: 15, durationWeeks: 8, type: 'DES_RELEASE', rowId: 'row8',
        description: 'Implementation of the new unified design language across all platforms.',
        outcome: 'Improve dev velocity by 20% and brand consistency.',
        tags: ['Design', 'Tech', 'Infrastructure'],
        resources: mockResources
    },
    { id: '802', title: "Dark Mode Update", startWeek: 32, durationWeeks: 4, type: 'DES_RELEASE', rowId: 'row8' },
    { id: '803', title: "Alpha Platform Launch", startWeek: 50, durationWeeks: 6, type: 'LAUNCH', rowId: 'row8' },

    // --- ROW 9: Miscellaneous ---
    { id: '901', title: "Q2 Planning", startWeek: 9, durationWeeks: 2, type: 'ARTICLE', rowId: 'row9' },
    { id: '902', title: "Team Retreat", startWeek: 40, durationWeeks: 1, type: 'LOCAL', rowId: 'row9' },
];

export const staticRows: PlannerRow[] = [
    { id: 'row1' }, { id: 'row2' }, { id: 'row3' }, { id: 'row4' },
    { id: 'row5' }, { id: 'row6' }, { id: 'row7' }, { id: 'row8' }, { id: 'row9' }
];
