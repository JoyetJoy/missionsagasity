-- ============================================================
-- Mission Sagacity - PostgreSQL Schema & Seed Data
-- ============================================================
-- Run this file against your PostgreSQL database:
--   psql -U your_user -d your_db -f schema-and-seed.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'pastor');
CREATE TYPE group_type AS ENUM ('public', 'private');
CREATE TYPE group_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE prayer_category AS ENUM ('personal', 'family', 'community', 'gratitude', 'intercession');
CREATE TYPE recurring_pattern AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE content_type AS ENUM ('photo', 'writing', 'video');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- TABLES
-- ============================================================

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$10$defaulthashplaceholder', -- bcrypt hash
  role user_role NOT NULL DEFAULT 'user',
  pastor_id TEXT, -- links pastor-role users to their sage profile
  avatar TEXT,
  phone VARCHAR(50),
  address TEXT,
  pincode VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sages (internal table name: pastors)
CREATE TABLE pastors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  bio TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  church VARCHAR(255),
  photo TEXT,
  address TEXT,
  pincode VARCHAR(20),
  location_link TEXT,
  specialties TEXT[] DEFAULT '{}',
  years_of_service INTEGER DEFAULT 0,
  donation_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sage Content (videos, photos, writings)
CREATE TABLE pastor_content (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pastor_id TEXT NOT NULL REFERENCES pastors(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  title VARCHAR(500),
  content TEXT,
  url TEXT,
  thumbnail TEXT,
  description TEXT,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sage Books
CREATE TABLE pastor_books (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pastor_id TEXT NOT NULL REFERENCES pastors(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cover_image TEXT,
  page_count INTEGER,
  published_date DATE,
  category VARCHAR(100),
  approval_status approval_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flocks (internal table name: groups)
CREATE TABLE groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  type group_type NOT NULL DEFAULT 'public',
  status group_status NOT NULL DEFAULT 'pending',
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group membership (many-to-many)
CREATE TABLE group_members (
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Group join requests
CREATE TABLE group_join_requests (
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Group content managers
CREATE TABLE group_content_managers (
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Posts (Wisdom Feed)
CREATE TABLE posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT REFERENCES groups(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  file_url TEXT,
  file_name VARCHAR(500),
  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post meetings (embedded in the frontend, separate table in DB)
CREATE TABLE post_meetings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  end_time TIME,
  meet_link TEXT NOT NULL
);

-- Post likes (many-to-many)
CREATE TABLE post_likes (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Post reactions (many-to-many with emoji)
CREATE TABLE post_reactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL, -- emoji character
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id, reaction)
);

-- Comments
CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gatherings (internal table name: prayers)
CREATE TABLE prayers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  end_time TIME,
  category prayer_category DEFAULT 'personal',
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_pattern recurring_pattern,
  image_url TEXT,
  meet_link TEXT,
  group_id TEXT REFERENCES groups(id) ON DELETE SET NULL,
  post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_pastor_id ON users(pastor_id);

CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_groups_created_by ON groups(created_by);

CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);

CREATE INDEX idx_posts_group ON posts(group_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_author ON comments(author_id);

CREATE INDEX idx_prayers_user ON prayers(user_id);
CREATE INDEX idx_prayers_date ON prayers(date);
CREATE INDEX idx_prayers_group ON prayers(group_id);

CREATE INDEX idx_pastor_content_pastor ON pastor_content(pastor_id);
CREATE INDEX idx_pastor_content_status ON pastor_content(approval_status);

CREATE INDEX idx_pastor_books_pastor ON pastor_books(pastor_id);
CREATE INDEX idx_pastor_books_status ON pastor_books(approval_status);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Users (password for all: "password123" - bcrypt hash)
INSERT INTO users (id, name, email, password_hash, role, pastor_id) VALUES
  ('admin-1',       'Admin User',        'admin@sagacity.com',        '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'admin',  NULL),
  ('user-1',        'John Doe',          'john@example.com',          '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'user',   NULL),
  ('user-2',        'Jane Smith',        'jane@example.com',          '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'user',   NULL),
  ('pastor-user-1', 'John Doe',          'pastor.john@church.org',    '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'pastor', 'pastor-1'),
  ('pastor-user-2', 'Jane Smith',        'pastor.jane@church.org',    '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'pastor', 'pastor-2'),
  ('pastor-user-3', 'Michael Thompson',  'pastor.michael@church.org', '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'pastor', 'pastor-3'),
  ('pastor-user-4', 'Sarah Williams',    'pastor.sarah@church.org',   '$2b$10$XQ0EFV6YGkSqQGCZwFLnCuK.hYV1B6VNcMZkMN5G5GqMq9RJF5jGi', 'pastor', 'pastor-4');

-- Sages (Pastors)
INSERT INTO pastors (id, name, title, bio, email, phone, church, photo, specialties, years_of_service, donation_link) VALUES
  ('pastor-1', 'John Doe',          'Senior Sage',    'John has been serving as the Senior Sage for 15 years, leading with wisdom and compassion.', 'john.doe@church.org',  '123-456-7890', 'Grace Church',            'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400', ARRAY['Youth Ministry','Counseling'],            15, 'https://example.com/donate/john-doe'),
  ('pastor-2', 'Jane Smith',        'Youth Sage',     'Jane is dedicated to youth ministry, inspiring the next generation with faith and hope.',     'jane.smith@church.org', '098-765-4321', 'Grace Church',            'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400', ARRAY['Youth Ministry'],                          5, 'https://example.com/donate/jane-smith'),
  ('pastor-3', 'Michael Thompson',  'Associate Sage', 'Michael has a heart for community outreach and missions work.',                              'michael.t@church.org',  '555-234-5678', 'New Hope Fellowship',     'https://images.unsplash.com/photo-1728827895321-7cfad9d63ad1?w=400', ARRAY['Discipleship','Missions','Small Groups'], 10, 'https://example.com/donate/michael-thompson'),
  ('pastor-4', 'Sarah Williams',    'Worship Sage',   'Sarah leads the worship ministry with passion and creativity.',                               'sarah.w@church.org',    '555-987-6543', 'Harvest Community Church','https://images.unsplash.com/photo-1752317591547-745de02a572e?w=400', ARRAY['Worship','Creative Arts','Prayer Ministry'], 8, 'https://example.com/donate/sarah-williams');

-- Sage Content
INSERT INTO pastor_content (id, pastor_id, type, title, content, url, thumbnail, description, approval_status) VALUES
  ('content-1', 'pastor-1', 'video',   'Sunday Sermon: Walking in Faith',   NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1627931552064-36e7c340c02e?w=400', 'Join us for this powerful message about trusting God in uncertain times.', 'approved'),
  ('content-2', 'pastor-1', 'writing', 'Reflections on Grace',              'Grace is not just a concept; it is the very foundation of our relationship with God.', NULL, NULL, 'A reflection on Gods grace in our daily lives', 'approved'),
  ('content-3', 'pastor-1', 'photo',   'Community Worship Night',           NULL, 'https://images.unsplash.com/photo-1662151820001-0c8d949304a4?w=400', NULL, 'What an incredible night of worship with our community!', 'approved'),
  ('content-4', 'pastor-2', 'photo',   'Youth Bible Study',                 NULL, 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400', NULL, 'Our youth group diving deep into Gods Word this week!', 'approved'),
  ('content-5', 'pastor-2', 'writing', 'Hope for the Next Generation',      'Our youth are the future of the church, and I am constantly amazed by their passion.', NULL, NULL, NULL, 'approved'),
  ('content-6', 'pastor-3', 'writing', 'The Power of Small Groups',         'There is something powerful about gathering together in small, intimate groups to study Gods Word.', NULL, NULL, NULL, 'approved'),
  ('content-7', 'pastor-3', 'photo',   'Mission Trip to Guatemala',         NULL, 'https://images.unsplash.com/photo-1760992004000-69b29eb0384c?w=400', NULL, 'Our team spent two weeks serving communities in Guatemala.', 'approved'),
  ('content-8', 'pastor-4', 'writing', 'The Heart of Worship',              'Worship is not about the songs we sing or the instruments we play. It is about the posture of our hearts.', NULL, NULL, NULL, 'approved'),
  ('content-9', 'pastor-4', 'photo',   'Worship Night Live',                NULL, 'https://images.unsplash.com/photo-1672638224571-9af5104f4755?w=400', NULL, 'An incredible evening of worship and prayer.', 'approved');

-- Sage Books (sample from pastor-1 and pastor-2)
INSERT INTO pastor_books (id, pastor_id, title, description, price, cover_image, page_count, published_date, category, approval_status) VALUES
  ('book-1',  'pastor-1', 'Walking in Faith: A 30-Day Devotional',                    'A powerful devotional guide for a 30-day journey through Scripture.',                           14.99, 'https://images.unsplash.com/photo-1610072175222-14ff9b858f5b?w=400', 180, '2024-06-15', 'Devotional',       'approved'),
  ('book-2',  'pastor-1', 'Grace Unlimited: Understanding Gods Love',                  'An in-depth exploration of Gods grace and how it transforms our lives.',                        19.99, 'https://images.unsplash.com/photo-1761426479793-ed866b69bd40?w=400', 256, '2023-11-01', 'Theology',         'approved'),
  ('book-3',  'pastor-1', 'The Prayer Warriors Handbook',                              'A practical guide to deepening your prayer life.',                                              9.99, 'https://images.unsplash.com/photo-1766250533363-01b974b2ba32?w=400', 120, '2025-01-20', 'Prayer',           'approved'),
  ('book-5',  'pastor-1', 'Marriage Gods Way: A Biblical Guide for Couples',            'A comprehensive guide for building a Christ-centered marriage.',                               16.99, 'https://images.unsplash.com/photo-1750963595457-f6f2b65bf572?w=400', 310, '2024-02-14', 'Counseling',       'approved'),
  ('book-6',  'pastor-1', 'Songs of the Spirit: Worship Through the Psalms',            'A devotional journey through the Book of Psalms.',                                            11.99, 'https://images.unsplash.com/photo-1672638224571-9af5104f4755?w=400', 195, '2025-08-12', 'Bible Study',      'approved'),
  ('book-7',  'pastor-1', 'Leading Like Jesus: Servant Leadership in the Church',       'Learn principles of servant leadership modeled by Christ himself.',                            22.99, 'https://images.unsplash.com/photo-1699817361584-88756e5ffc44?w=400', 280, '2023-05-20', 'Leadership',       'approved'),
  ('book-14', 'pastor-1', 'Unlocking the Old Testament: A Sages Guide to Ancient Texts','Journey through the Old Testament with clarity and depth.',                                    24.99, 'https://images.unsplash.com/photo-1770310257388-c9cb96ac8d73?w=400', 420, '2023-03-10', 'Bible Study',      'approved'),
  ('book-15', 'pastor-1', 'The Art of Forgiveness: Letting Go and Moving Forward',      'Combines biblical teaching and real-life stories about forgiveness.',                           13.99, 'https://images.unsplash.com/photo-1638866412154-71a64b5e46c1?w=400', 190, '2024-10-05', 'Christian Living', 'approved'),
  ('book-16', 'pastor-1', 'Raising Kingdom Kids: A Parents Blueprint',                  'A practical parenting guide with God-centered values.',                                        15.99, 'https://images.unsplash.com/flagged/photo-1595523667810-367dd72653b6?w=400', 235, '2025-06-18', 'Parenting', 'approved'),
  ('book-4',  'pastor-2', 'Ignite: Faith for the Next Generation',                     'A dynamic guide for young believers looking to grow in their faith.',                           12.99, 'https://images.unsplash.com/photo-1772038288458-c469cd946bf2?w=400', 200, '2025-03-10', 'Youth Ministry',   'approved'),
  ('book-8',  'pastor-2', 'Finding Your Purpose: A Teens Guide to Gods Plan',           'Written for teens navigating lifes biggest questions.',                                        10.99, 'https://images.unsplash.com/photo-1769184615203-78b35efc984b?w=400', 165, '2025-09-01', 'Youth Ministry',   'approved'),
  ('book-9',  'pastor-2', 'Social Media & The Soul: Navigating Digital Life with Faith','Practical wisdom for setting digital boundaries.',                                              8.99, 'https://images.unsplash.com/photo-1571916234808-adf437ac1644?w=400', 140, '2026-01-15', 'Christian Living', 'approved'),
  ('book-10', 'pastor-3', 'The Disciples Journey: From Believer to World-Changer',     'A comprehensive 12-week discipleship curriculum.',                                             17.99, 'https://images.unsplash.com/photo-1650437732428-9854461455d4?w=400', 240, '2024-09-15', 'Discipleship',     'approved'),
  ('book-11', 'pastor-3', 'Beyond the Walls: Taking Church to the Community',           'A rallying call for churches to engage their communities.',                                    15.99, 'https://images.unsplash.com/photo-1765947382559-93260e5d6c89?w=400', 215, '2025-04-22', 'Missions',         'approved'),
  ('book-12', 'pastor-3', 'Rest for the Restless: Finding Peace in a Busy World',       'Rediscover the biblical practice of Sabbath rest.',                                           13.99, 'https://images.unsplash.com/photo-1760857224786-15621b02ea64?w=400', 175, '2025-11-10', 'Christian Living', 'approved'),
  ('book-13', 'pastor-3', 'Small Group Leaders Toolkit',                                'The essential handbook for small group ministry leaders.',                                       7.99, 'https://images.unsplash.com/photo-1733710087753-3f9aff2d6493?w=400',  98, '2024-01-08', 'Leadership',       'approved'),
  ('book-20', 'pastor-4', 'A New Song: Rediscovering Worship in the Modern Church',     'A thoughtful exploration of worship in contemporary church culture.',                          16.49, 'https://images.unsplash.com/photo-1668786977637-f2cede057905?w=400', 220, '2024-07-20', 'Worship',          'approved'),
  ('book-21', 'pastor-4', 'Prayers in the Dark: Finding Light When Life Hurts',          'A raw and honest book about praying through hardship.',                                       12.99, 'https://images.unsplash.com/photo-1579913735975-5f4b3f9e1c1e?w=400', 160, '2025-02-28', 'Prayer',           'approved'),
  ('book-22', 'pastor-4', 'The Creative Christian: Using Your Gifts for Gods Glory',     'Encourages creatives to see their talents as gifts from God.',                                14.99, 'https://images.unsplash.com/photo-1619968747465-f56008f0da50?w=400', 185, '2025-10-15', 'Christian Living', 'approved'),
  ('book-23', 'pastor-4', 'Still Waters: A 21-Day Journey to Inner Peace',              'A 21-day devotional guiding readers into quiet presence of God.',                              10.99, 'https://images.unsplash.com/photo-1761491499504-46df069334c1?w=400', 110, '2026-02-01', 'Devotional',       'approved'),
  ('book-24', 'pastor-4', 'New Beginnings: 40 Days of Renewal and Restoration',          'A 40-day devotional about Gods promises of renewal.',                                        18.99, 'https://images.unsplash.com/photo-1763060869007-fc10548b0aae?w=400', 250, '2024-12-25', 'Devotional',       'approved'),
  ('book-25', 'pastor-4', 'Wilderness Worship: Encountering God in the Mountains',      'Theology, personal stories, and breathtaking imagery about creation.',                        19.99, 'https://images.unsplash.com/photo-1710453650585-05d2f4b966c4?w=400', 195, '2025-05-10', 'Theology',         'approved');

-- Flocks (Groups)
INSERT INTO groups (id, name, subtitle, description, type, status, created_by, avatar) VALUES
  ('group-1', 'Technology Enthusiasts', 'AI, Web Dev, Cloud, IoT',          'Discuss latest tech trends and innovations.',                      'public',  'approved', 'user-1', 'https://images.unsplash.com/photo-1683813479742-4730f91fa3ec?w=400'),
  ('group-2', 'Book Club',             'Fiction, Non-Fiction, Theology, Poetry', 'Share and discuss your favorite books.',                      'public',  'approved', 'user-2', 'https://images.unsplash.com/photo-1709924168698-620ea32c3488?w=400'),
  ('group-3', 'Private Investors',     'Stocks, Crypto, Real Estate',      'Exclusive investment discussions for serious investors.',           'private', 'approved', 'user-1', 'https://images.unsplash.com/photo-1769028871759-8099b7474ac4?w=400');

-- Group Members
INSERT INTO group_members (group_id, user_id) VALUES
  ('group-1', 'user-1'),
  ('group-1', 'user-2'),
  ('group-2', 'user-2'),
  ('group-3', 'user-1');

-- Group Join Requests
INSERT INTO group_join_requests (group_id, user_id) VALUES
  ('group-3', 'user-2');

-- Group Content Managers
INSERT INTO group_content_managers (group_id, user_id) VALUES
  ('group-1', 'user-1'),
  ('group-2', 'user-2'),
  ('group-3', 'user-1');

-- Posts
INSERT INTO posts (id, group_id, author_id, content, image_url, image_urls, comments_enabled) VALUES
  ('post-1', 'group-1', 'user-1', 'What do you think about the latest AI developments? The progress in large language models has been incredible!', NULL, '{}', TRUE),
  ('post-2', 'group-2', 'user-2', 'Just finished reading "The Midnight Library". Highly recommend it! What books are you currently reading?', NULL, '{}', TRUE),
  ('post-3', 'group-1', 'user-2', 'Check out this amazing workspace setup! Perfect for productivity and creativity.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', '{}', TRUE),
  ('post-4', 'group-2', 'user-1', 'My recent trip to the mountains was absolutely breathtaking! Here are some highlights from the journey.', NULL, ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800','https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'], TRUE),
  ('post-5', 'group-1', 'user-1', 'Exploring new technologies and tools for our next project. Heres a sneak peek at what were working with!', NULL, ARRAY['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800','https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800','https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'], TRUE);

-- Post Likes
INSERT INTO post_likes (post_id, user_id) VALUES
  ('post-1', 'user-2'),
  ('post-3', 'user-1'),
  ('post-4', 'user-2'),
  ('post-5', 'user-2');

-- Post Reactions
INSERT INTO post_reactions (id, post_id, user_id, reaction) VALUES
  (gen_random_uuid()::text, 'post-1', 'user-2', E'\U0001F680'),
  (gen_random_uuid()::text, 'post-1', 'user-2', E'\U0001F4A1'),
  (gen_random_uuid()::text, 'post-2', 'user-2', E'\U0001F4DA'),
  (gen_random_uuid()::text, 'post-3', 'user-1', E'\U0001F525'),
  (gen_random_uuid()::text, 'post-4', 'user-2', E'\U0001F60A'),
  (gen_random_uuid()::text, 'post-4', 'user-2', E'\U00002764'),
  (gen_random_uuid()::text, 'post-5', 'user-2', E'\U0001F389');

-- Comments
INSERT INTO comments (id, post_id, author_id, content) VALUES
  ('comment-1', 'post-1', 'user-2', 'Absolutely agree! The possibilities are endless.'),
  ('comment-4', 'post-4', 'user-2', 'Stunning views! Where is this?');

-- Gatherings (Prayers)
INSERT INTO prayers (id, user_id, title, description, date, time, end_time, category, is_recurring, recurring_pattern) VALUES
  ('prayer-1', 'user-1', 'Morning Prayer',           'Start the day with gratitude and guidance',        CURRENT_DATE,     '06:00', '06:30', 'personal',  TRUE,  'daily'),
  ('prayer-2', 'user-1', 'Family Blessing',          'Pray for family health and happiness',             CURRENT_DATE,     '19:00', '19:30', 'family',    FALSE, NULL),
  ('prayer-3', 'user-1', 'Community Service Prayer', 'Pray for those in need in our community',          CURRENT_DATE + 3, '12:00', '13:00', 'community', FALSE, NULL),
  ('prayer-4', 'user-1', 'Evening Gratitude',        'Express thanks for the days blessings',            CURRENT_DATE + 1, '20:30', '21:00', 'gratitude', TRUE,  'daily'),
  ('prayer-5', 'user-1', 'Sunday Worship',           'Weekly gathering prayer',                          CURRENT_DATE + 7, '10:00', '11:30', 'community', TRUE,  'weekly');

-- Foreign key: link users.pastor_id back to pastors
ALTER TABLE users ADD CONSTRAINT fk_users_pastor FOREIGN KEY (pastor_id) REFERENCES pastors(id) ON DELETE SET NULL;

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Public feed: posts from approved public groups + global broadcasts
CREATE OR REPLACE VIEW public_feed AS
SELECT
  p.*,
  COALESCE(g.name, 'Mission Sagacity') AS group_name,
  COALESCE(g.type, 'public') AS group_type,
  u.name AS author_name,
  u.avatar AS author_avatar
FROM posts p
LEFT JOIN groups g ON g.id = p.group_id
JOIN users u ON u.id = p.author_id
WHERE p.group_id IS NULL
   OR (g.status = 'approved' AND g.type = 'public')
ORDER BY p.created_at DESC;

-- User feed: posts from groups user belongs to + public groups + global broadcasts
CREATE OR REPLACE FUNCTION user_feed(p_user_id TEXT)
RETURNS TABLE (
  id TEXT, group_id TEXT, author_id TEXT, content TEXT,
  image_url TEXT, image_urls TEXT[], file_url TEXT, file_name VARCHAR,
  comments_enabled BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  group_name VARCHAR, group_type group_type, author_name VARCHAR, author_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.group_id, p.author_id, p.content,
    p.image_url, p.image_urls, p.file_url, p.file_name,
    p.comments_enabled, p.created_at, p.updated_at,
    COALESCE(g.name, 'Mission Sagacity'::VARCHAR), COALESCE(g.type, 'public'::group_type), u.name, u.avatar
  FROM posts p
  LEFT JOIN groups g ON g.id = p.group_id
  JOIN users u ON u.id = p.author_id
  WHERE p.group_id IS NULL
    OR (
      g.status = 'approved'
      AND (
        g.type = 'public'
        OR EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = p_user_id)
      )
    )
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;