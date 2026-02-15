import { ReactNode } from 'react';
import { InitiativeType } from './initiatives';
import projectsData from './projects.json';
import channelTypes from './channel-initiative-types.json';

export interface PlannerResource {
    label: string;
    url: string;
}

// Keep PlannerEvent interface for Timeline compatibility
export interface PlannerEvent {
    id: string;
    title: string;
    startWeek: number; // Global week number (e.g., 8 to 60)
    durationWeeks: number;
    type: InitiativeType | string; // Now maps to Channel ID
    rowId: string; // Deprecated but kept for type compatibility
    // New Fields for Rich Hover
    description?: string;
    tags?: string[];
    outcome?: string;
    resources?: PlannerResource[];
    imageUrl?: string;
    projectId?: string; // Link back to parent project
    owner?: string;
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

// Transform Projects into Timeline Events
/**
 * Generates Timeline Events from Project Data
 *
 * Transforms the hierarchical Project -> Initiative structure from `projects.json`
 * into a flat array of `PlannerEvent` objects suitable for the Timeline visualization.
 *
 * @returns {PlannerEvent[]} Flattened array of events ready for rendering
 */
const generateEvents = (): PlannerEvent[] => {
    const events: PlannerEvent[] = [];

    projectsData.forEach(project => {
        project.initiatives.forEach((init, index) => {
            events.push({
                id: `${project.id}-${index}`, // Unique event ID
                title: init.title,
                startWeek: init.startWeek,
                durationWeeks: init.duration,
                type: init.channelId, // Channel is now the primary type
                rowId: init.channelId,
                description: project.description,
                tags: project.tags,
                owner: project.owner,
                projectId: project.id,
                // Add mock resources/outcome if needed for demo
                outcome: 'Campaign Outcome TBD'
            });
        });
    });

    return events;
};

export const staticEvents: PlannerEvent[] = generateEvents();

// Generate Rows based on Channels
export const staticRows: PlannerRow[] = channelTypes.map(channel => ({
    id: channel.id,
    label: channel.label
}));
