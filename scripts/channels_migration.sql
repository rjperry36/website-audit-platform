-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY, -- e.g. 'SEO', 'UX'
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial data (Upsert to avoid duplicates)
INSERT INTO channels (id, label, color, description) VALUES
('SEO', 'SEO', '#0284C7', 'Search Engine Optimization'),
('PAID_MEDIA', 'PAID MEDIA', '#D97706', 'Paid advertising across search and social'),
('SOCIAL_MEDIA', 'SOCIAL MEDIA', '#DB2777', 'Organic social media content'),
('ECRM', 'ECRM', '#0891B2', 'Email & Customer Relationship Management'),
('D2C', 'D2C', '#059669', 'Direct to Consumer (Ecommerce)'),
('B2B', 'B2B', '#4F46E5', 'Business to Business'),
('B2B2C', 'B2B2C', '#9333EA', 'Business to Business to Consumer'),
('POSM', 'POSM', '#F97316', 'Point of Sale Materials'),
('OOH', 'OOH', '#DC2626', 'Out of Home Advertising'),
('RESEARCH', 'RESEARCH', '#475569', 'Market Research & Insights'),
('EVENT', 'EVENT', '#2563EB', 'Physical & Virtual Events'),
('UX', 'UX', '#8B5CF6', 'User Experience & Design')
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    color = EXCLUDED.color,
    description = EXCLUDED.description;
