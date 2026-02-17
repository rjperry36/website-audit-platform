import {
    Calendar, Search, Megaphone, Share2, Mail, ShoppingBag,
    Briefcase, Users, MapPin, Monitor, BarChart, Mic, Layout
} from 'lucide-react';

export interface ScopingQuestion {
    id: string; // Database UUID
    question_identifier: string; // Key for JSON response
    question_text: string;
    placeholder?: string;
    question_type: 'text' | 'textarea' | 'select' | 'multiselect';
    options?: string[];
    order_index: number;
}

export interface ChannelExpert {
    id: string; // Channel ID
    role: string;
    description: string;
    icon_name: string;
    questions: ScopingQuestion[];
}

// Map string names from DB to Lucide Components
export const getExpertIcon = (iconName: string) => {
    const icons: Record<string, any> = {
        'Search': Search,
        'Megaphone': Megaphone,
        'Share2': Share2,
        'Mail': Mail,
        'ShoppingBag': ShoppingBag,
        'Briefcase': Briefcase,
        'Users': Users,
        'MapPin': MapPin,
        'Monitor': Monitor,
        'BarChart': BarChart,
        'Mic': Mic,
        'Layout': Layout,
        'Calendar': Calendar
    };
    return icons[iconName] || Calendar; // Default to Calendar
};
