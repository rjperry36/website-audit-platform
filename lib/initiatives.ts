import channelTypes from './channel-initiative-types.json';
import tagTypes from './initiative-tags.json';

export type InitiativeType = string;

// Convert JSON arrays to Record lookup maps for easy access
export const INITIATIVE_CONFIG: Record<string, { color: string; label: string; description?: string }> =
    channelTypes.reduce((acc, item) => ({
        ...acc,
        [item.id]: { color: item.color, label: item.label, description: item.description }
    }), {});

export const TAG_CONFIG: Record<string, { color: string; label: string }> =
    tagTypes.reduce((acc, item) => ({
        ...acc,
        [item.id]: { color: item.color, label: item.label }
    }), {});

export const getInitiativeStyle = (type: string) => {
    // Normalize type to handle case sensitivity if needed, though exact match is best
    const config = INITIATIVE_CONFIG[type] || INITIATIVE_CONFIG[type.toUpperCase()] || { color: '#4B5563', label: type.toUpperCase() };
    return config;
};

export const getTagStyle = (tagId: string) => {
    const config = TAG_CONFIG[tagId] || { color: '#9CA3AF', label: tagId };
    return config;
};

