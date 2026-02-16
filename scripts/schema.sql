
-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    owner TEXT,
    tags TEXT[], -- Array of strings
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initiatives Table (Linked to Projects)
CREATE TABLE IF NOT EXISTS initiatives (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    start_week INTEGER NOT NULL,
    duration_weeks INTEGER NOT NULL,
    status TEXT DEFAULT 'planned'
);

-- Briefs Table (New Briefing System)
CREATE TABLE IF NOT EXISTS briefs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    markets TEXT[], -- Array of market codes e.g. ['UK', 'US']
    channel_types TEXT[], -- Array of channel IDs
    start_date DATE NOT NULL,
    end_date DATE, -- Optional
    status TEXT DEFAULT 'planning', -- 'planning' if end_date is null
    tags TEXT[],
    client_brief_url TEXT, -- Path to uploaded file if any
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brief Objectives Table
CREATE TABLE IF NOT EXISTS brief_objectives (
    id TEXT PRIMARY KEY,
    brief_id TEXT REFERENCES briefs(id) ON DELETE CASCADE,
    objective TEXT NOT NULL,
    kpi TEXT,
    target TEXT
);
