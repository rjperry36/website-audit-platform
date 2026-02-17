-- 0. Ensure channels table exists (From previous step)
CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY, -- e.g. 'SEO', 'UX'
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial data (Safe to run multiple times)
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

-- 1. Update channels table with Expert fields
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS expert_role TEXT,
ADD COLUMN IF NOT EXISTS expert_description TEXT,
ADD COLUMN IF NOT EXISTS expert_icon_name TEXT;

-- 2. Create channel_questions table
CREATE TABLE IF NOT EXISTS channel_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
    question_identifier TEXT NOT NULL, -- e.g. 'keywords', 'budget' (used for JSON key)
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'multiselect')),
    options TEXT[], -- Array of strings for select/multiselect
    placeholder TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Seed Expert Data (Channels)
UPDATE channels SET expert_role = 'SEO Specialist', expert_description = 'I ensure your content ranks high and reaches the right organic audience.', expert_icon_name = 'Search' WHERE id = 'SEO';
UPDATE channels SET expert_role = 'Paid Media Strategist', expert_description = 'I maximize ROI across search, social, and display advertising.', expert_icon_name = 'Megaphone' WHERE id = 'PAID_MEDIA';
UPDATE channels SET expert_role = 'Social Media Manager', expert_description = 'I craft engaging organic content to build community and brand loyalty.', expert_icon_name = 'Share2' WHERE id = 'SOCIAL_MEDIA';
UPDATE channels SET expert_role = 'CRM & Automation Expert', expert_description = 'I manage customer lifecycles through email, SMS, and automation.', expert_icon_name = 'Mail' WHERE id = 'ECRM';
UPDATE channels SET expert_role = 'D2C Ecommerce Manager', expert_description = 'I optimize the direct-to-consumer shopping experience.', expert_icon_name = 'ShoppingBag' WHERE id = 'D2C';
UPDATE channels SET expert_role = 'B2B Marketing Lead', expert_description = 'I generate high-quality leads and support sales enablement.', expert_icon_name = 'Briefcase' WHERE id = 'B2B';
UPDATE channels SET expert_role = 'Partner Marketing Specialist', expert_description = 'I enable partners to sell to end consumers effectively.', expert_icon_name = 'Users' WHERE id = 'B2B2C';
UPDATE channels SET expert_role = 'Retail Activation Specialist', expert_description = 'I create physical touchpoints that drive sales in-store.', expert_icon_name = 'MapPin' WHERE id = 'POSM';
UPDATE channels SET expert_role = 'OOH Media Planner', expert_description = 'I manage outdoor advertising for high-impact brand awareness.', expert_icon_name = 'Monitor' WHERE id = 'OOH';
UPDATE channels SET expert_role = 'Consumer Insights Manager', expert_description = 'I gather data to inform strategy and measure success.', expert_icon_name = 'BarChart' WHERE id = 'RESEARCH';
UPDATE channels SET expert_role = 'Events Manager', expert_description = 'I deliver memorable physical and virtual experiences.', expert_icon_name = 'Mic' WHERE id = 'EVENT';
UPDATE channels SET expert_role = 'UX Designer', expert_description = 'I ensure the user journey is intuitive and accessible.', expert_icon_name = 'Layout' WHERE id = 'UX';

-- 4. Seed Questions
-- SEO
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('SEO', 'keywords', 'What are the top 3-5 priority keywords for this campaign?', 'textarea', NULL, 'e.g. "sustainable sneakers", "running shoes review"', 1),
('SEO', 'competitors', 'Are there specific competitor pages we need to outrank?', 'textarea', NULL, 'URLs of competitor pages...', 2),
('SEO', 'technical_constraints', 'Are there any technical SEO constraints or platform limitations?', 'select', ARRAY['None', 'CMS Limitations', 'Slow Page Speed', 'JavaScript heavy', 'Other'], NULL, 3);

-- PAID_MEDIA
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('PAID_MEDIA', 'budget', 'What is the estimated media budget for this initiative?', 'text', NULL, 'e.g. $50k - $100k', 1),
('PAID_MEDIA', 'platforms', 'Which platforms are priority for this campaign?', 'multiselect', ARRAY['Google Ads', 'Meta (FB/IG)', 'LinkedIn', 'TikTok', 'YouTube', 'Display'], NULL, 2),
('PAID_MEDIA', 'kpi_focus', 'Is the primary goal Awareness, Consideration, or Conversion?', 'select', ARRAY['Awareness', 'Consideration', 'Conversion (Leads/Sales)'], NULL, 3);

-- SOCIAL_MEDIA
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('SOCIAL_MEDIA', 'channels', 'Which social channels will we be posting to?', 'multiselect', ARRAY['Instagram', 'LinkedIn', 'TikTok', 'Twitter/X', 'Facebook', 'Pinterest'], NULL, 1),
('SOCIAL_MEDIA', 'content_types', 'What types of content assets are needed?', 'multiselect', ARRAY['Short-form Video (Reels/TikTok)', 'Static Images', 'Carousels', 'Stories', 'Live Video'], NULL, 2),
('SOCIAL_MEDIA', 'influencers', 'Will there be any influencer or creator collaboration?', 'select', ARRAY['Yes', 'No', 'Maybe'], NULL, 3);

-- ECRM
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('ECRM', 'segments', 'Which customer segments are we targeting?', 'text', NULL, 'e.g. New Subscribers, Lapsed Customers, VIPs', 1),
('ECRM', 'automation', 'Do we need to build new automation flows?', 'select', ARRAY['No, one-off send', 'Yes, Welcome Series', 'Yes, Abandoned Cart', 'Yes, Re-engagement', 'Other'], NULL, 2);

-- D2C
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('D2C', 'product_launch', 'Is this tied to a new product launch?', 'select', ARRAY['Yes, New Product', 'No, Existing Range', 'Bundle/Promo'], NULL, 1),
('D2C', 'offer', 'Is there a specific offer or promotion code?', 'text', NULL, 'e.g. 20% OFF, GWP', 2);

-- B2B
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('B2B', 'target_accounts', 'Are we targeting specific accounts or industries? (ABM)', 'textarea', NULL, 'e.g. FinTech, Healthcare, Enterprise', 1),
('B2B', 'lead_magnet', 'Is there a gated asset (Lead Magnet)?', 'select', ARRAY['Whitepaper/Ebook', 'Webinar', 'Case Study', 'Demo Request', 'None'], NULL, 2);

-- B2B2C
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('B2B2C', 'partner_type', 'Which type of partners are we enabling?', 'select', ARRAY['Retailers', 'Distributors', 'Affiliates', 'Resellers'], NULL, 1);

-- POSM
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('POSM', 'formats', 'What formats are required?', 'multiselect', ARRAY['FSDU', 'Counter Top Unit', 'Shelf Wobblers', 'Window Display', 'Digital Screen'], NULL, 1);

-- OOH
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('OOH', 'location', 'What are the key target locations/cities?', 'text', NULL, NULL, 1),
('OOH', 'format', 'Digital or Static OOH?', 'select', ARRAY['Digital (DOOH)', 'Static (Billboards/Posters)', 'Both', 'Transit (Bus/Tube)'], NULL, 2);

-- RESEARCH
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('RESEARCH', 'methodology', 'Preferred research methodology?', 'select', ARRAY['Qualitative (Focus Groups)', 'Quantitative (Survey)', 'Social Listening', 'UX Testing'], NULL, 1);

-- EVENT
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('EVENT', 'type', 'Is this a physical, virtual, or hybrid event?', 'select', ARRAY['Physical', 'Virtual', 'Hybrid'], NULL, 1),
('EVENT', 'attendees', 'Expected number of attendees?', 'text', NULL, 'e.g. 100-500', 2);

-- UX (New)
INSERT INTO channel_questions (channel_id, question_identifier, question_text, question_type, options, placeholder, order_index) VALUES
('UX', 'goals', 'What are the primary UX goals?', 'textarea', NULL, 'e.g. Reduce bounce rate, Improve accessibility', 1),
('UX', 'devices', 'Which value devices are most critical?', 'multiselect', ARRAY['Mobile', 'Desktop', 'Tablet'], NULL, 2);
