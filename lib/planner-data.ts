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
    startWeek: number; // Week number (1-52)
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
    status?: 'planning' | 'planned' | 'active' | 'completed' | 'delayed';
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

// Standard Calendar Year (Jan - Dec)
// Assuming standard 4-4-5 or similar distribution for simplicity:
// Jan: 1-4, Feb: 5-8, Mar: 9-13
// This is a rough approximation for visualization
export const months: MonthData[] = [
    { name: 'JAN', startWeek: 1, endWeek: 4 },
    { name: 'FEB', startWeek: 5, endWeek: 8 },
    { name: 'MAR', startWeek: 9, endWeek: 13 },
    { name: 'APR', startWeek: 14, endWeek: 17 },
    { name: 'MAY', startWeek: 18, endWeek: 21 },
    { name: 'JUN', startWeek: 22, endWeek: 26 },
    { name: 'JUL', startWeek: 27, endWeek: 30 },
    { name: 'AUG', startWeek: 31, endWeek: 34 },
    { name: 'SEP', startWeek: 35, endWeek: 39 },
    { name: 'OCT', startWeek: 40, endWeek: 43 },
    { name: 'NOV', startWeek: 44, endWeek: 47 },
    { name: 'DEC', startWeek: 48, endWeek: 52 },
];

// Generate weeks from 1 to 52
export const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

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
                startWeek: init.startWeek, // Note: Existing data might use Aug-based offsets, might need migration if important
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
