
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
