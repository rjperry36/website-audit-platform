
export interface ChannelConfig {
    id: string;
    label: string;
    color: string;
    description?: string;
}

export interface TagConfig {
    id: string;
    label: string;
    color: string;
}

export interface ProjectInitiative {
    channelId: string;
    startWeek: number;
    duration: number;
    title: string;
    status?: 'planned' | 'active' | 'completed' | 'delayed';
}

export interface Project {
    id: string;
    title: string;
    description: string;
    owner: string;
    tags: string[];
    initiatives: ProjectInitiative[];
}

// Briefing System Types

export interface MarketConfig {
    id: string;
    label: string;
    currency: string;
    flag_icon: string;
    is_active: boolean;
}

export interface StandardObjective {
    id: string;
    label: string;
    default_kpi: string;
    default_target: string;
}

export interface BriefObjective {
    id: string;
    objective: string;
    kpi: string;
    target: string;
}

export type Market = string; // Was union type, now dynamic string

export interface ProjectBrief {
    id: string;
    title: string;
    channelTypes: string[]; // IDs from channel-initiative-types.json
    markets: Market[];
    startDate: string; // ISO Date string
    endDate?: string; // ISO Date string. If undefined, status is 'planning'
    status: 'planning' | 'planned';
    objectives: BriefObjective[];
    tags: string[];
    clientBriefUrl?: string; // URL to uploaded PDF
    createdAt: string;
}
