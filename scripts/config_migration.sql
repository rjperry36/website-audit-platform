-- Markets Table
CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    flag_icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Markets
INSERT INTO markets (id, label, currency, flag_icon) VALUES
('UK', 'United Kingdom', 'GBP', '🇬🇧'),
('US', 'United States', 'USD', '🇺🇸'),
('DE', 'Germany', 'EUR', '🇩🇪'),
('FR', 'France', 'EUR', '🇫🇷'),
('JP', 'Japan', 'JPY', '🇯🇵'),
('CN', 'China', 'CNY', '🇨🇳')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- Initiative Tags Table
CREATE TABLE IF NOT EXISTS initiative_tags (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Tags
INSERT INTO initiative_tags (id, label, color) VALUES
('LIFECYCLE', 'LIFECYCLE', '#14B8A6'),
('LOCAL', 'LOCAL', '#F59E0B'),
('GLOBAL', 'GLOBAL', '#3B82F6'),
('CLUB', 'CLUB', '#6366F1'),
('LOYALTY', 'LOYALTY', '#8B5CF6'),
('PROMOTION', 'PROMOTION', '#10B981')
ON CONFLICT (id) DO UPDATE SET color = EXCLUDED.color;

-- Standard Objectives Table
CREATE TABLE IF NOT EXISTS standard_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    default_kpi TEXT,
    default_target TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Objectives
INSERT INTO standard_objectives (label, default_kpi, default_target) VALUES
('Brand Awareness', 'Impressions', '1M'),
('Lead Generation', 'Qualified Leads', '500'),
('User Acquisition', 'App Installs', '10k'),
('Retention', 'Churn Rate', '1%'),
('Revenue Growth', 'ARR', '$100k');

-- AI Rules Table
CREATE TABLE IF NOT EXISTS ai_rules (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'accessibility', 'mobile', 'visual', 'experience'
    rule_name TEXT NOT NULL,
    description TEXT NOT NULL,
    priority_level TEXT CHECK (priority_level IN ('mandatory', 'advisory')),
    impact TEXT,
    recommendation TEXT,
    thresholds JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed AI Rules (Sample from ux.json)
INSERT INTO ai_rules (id, category, rule_name, description, priority_level, impact, recommendation, thresholds) VALUES
('UX-A11Y-001', 'accessibility', 'Color Contrast Ratio', 'Text-to-background contrast meets WCAG AA standards', 'mandatory', 'Critical for users with visual impairments', 'Ensure text has 4.5:1 contrast ratio (3:1 for large text)', '{"normal": 4.5, "large": 3.0}'),
('UX-MOB-001', 'mobile', 'Viewport Meta Tag', 'Page has proper viewport meta tag for mobile responsiveness', 'mandatory', 'Page will not be mobile-responsive without viewport tag', 'Add <meta name=''viewport'' content=''width=device-width, initial-scale=1''>', NULL),
('UX-VIS-001', 'visual', 'Visual Hierarchy', 'Clear visual hierarchy guides user attention', 'advisory', 'Users cannot quickly scan and understand content', 'Use size, color, and spacing to create clear hierarchy', NULL)
ON CONFLICT (id) DO NOTHING;
