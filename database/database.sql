-- =============================================================================
-- GITHOP DATABASE SCHEMA v0.7 (Unified)
-- =============================================================================

-- 1. CLEANUP (Drop tables in correct dependency order)
DROP TABLE IF EXISTS developer_top_repos CASCADE;
DROP TABLE IF EXISTS developers CASCADE;
DROP TABLE IF EXISTS repository_languages CASCADE;
DROP TABLE IF EXISTS repository_stats CASCADE;
DROP TABLE IF EXISTS repository_contributors CASCADE;
DROP TABLE IF EXISTS repository_commit_activity CASCADE;
DROP TABLE IF EXISTS repository_commits CASCADE;
DROP TABLE IF EXISTS repositories CASCADE;
DROP TABLE IF EXISTS tops CASCADE;         -- Cleanup old legacy table
DROP TABLE IF EXISTS growings CASCADE;     -- Cleanup old legacy table
DROP TABLE IF EXISTS trendings CASCADE;    -- Cleanup old legacy table
DROP TABLE IF EXISTS repositories_index CASCADE; -- Cleanup old legacy table

-- =============================================================================
-- MODULE 1: REPOSITORIES (The Core)
-- =============================================================================

-- 2. REPOSITORIES MASTER TABLE
-- Merges 'tops', 'growings', 'trendings', and 'repositories_index'
CREATE TABLE repositories (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  full_name VARCHAR(500) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  owner_login VARCHAR(255),
  owner_avatar_url TEXT,
  description TEXT,
  html_url TEXT,
  homepage_url TEXT,
  
  -- Metrics
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  watchers_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  size_kb INTEGER DEFAULT 0,
  
  -- Content
  language VARCHAR(100),
  topics TEXT[],
  license_name VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  pushed_at TIMESTAMPTZ,
  
  -- Status & Features
  is_fork BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  allow_forking BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE,
  visibility VARCHAR(50) DEFAULT 'public',
  has_issues BOOLEAN DEFAULT TRUE,
  has_projects BOOLEAN DEFAULT TRUE,
  has_downloads BOOLEAN DEFAULT TRUE,
  has_wiki BOOLEAN DEFAULT TRUE,
  has_pages BOOLEAN DEFAULT FALSE,
  has_discussions BOOLEAN DEFAULT FALSE,
  
  -- Branch & Network
  default_branch VARCHAR(255),
  subscribers_count INTEGER DEFAULT 0,
  network_count INTEGER DEFAULT 0,
  
  -- Sync Logic
  last_fetched TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status VARCHAR(50) DEFAULT 'complete', -- 'stub' or 'complete'
  
  -- Category Tags (The unified replacement for multiple tables)
  -- Examples: {'top'}, {'growing', 'trending'}, {'stub'}
  categories TEXT[] DEFAULT '{}' 
);

-- Indexes for fast filtering
CREATE INDEX idx_repos_fullname ON repositories(full_name);
CREATE INDEX idx_repos_stars ON repositories(stars_count DESC);
CREATE INDEX idx_repos_categories ON repositories USING GIN (categories);
CREATE INDEX idx_repos_sync_status ON repositories(sync_status);


-- =============================================================================
-- MODULE 2: REPOSITORY SUB-DATA (Linked by repo_github_id)
-- =============================================================================

-- 3. REPOSITORY STATISTICS (Enriched Metrics)
CREATE TABLE repository_stats (
  id SERIAL PRIMARY KEY,
  repo_github_id BIGINT UNIQUE NOT NULL,
  
  -- ... (Existing metrics columns) ...
  commits_last_month INTEGER DEFAULT 0,
  commits_last_year INTEGER DEFAULT 0,
  issues_closed_last_month INTEGER DEFAULT 0,
  pull_requests_merged_last_month INTEGER DEFAULT 0,
  stars_growth_30d INTEGER DEFAULT 0,
  forks_growth_30d INTEGER DEFAULT 0,
  contributors_count INTEGER DEFAULT 0,
  
  activity_score DECIMAL(10, 2) DEFAULT 0,
  health_score DECIMAL(5, 2) DEFAULT 0,
  
  avg_issue_close_time_days DECIMAL(10, 2),
  avg_pr_merge_time_days DECIMAL(10, 2),
  
  days_since_last_commit INTEGER,
  days_since_last_release INTEGER,
  
  latest_release_tag VARCHAR(255),
  latest_release_date TIMESTAMPTZ,
  total_releases INTEGER DEFAULT 0,
  
  contributors_data_type VARCHAR(50) DEFAULT 'all_time',
  
  -- NEW: Tracking Flags for Granular Updates
  commit_activity_fetched BOOLEAN DEFAULT FALSE,
  recent_commits_fetched BOOLEAN DEFAULT FALSE,
  contributors_fetched BOOLEAN DEFAULT FALSE,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LANGUAGES
CREATE TABLE repository_languages (
  id SERIAL PRIMARY KEY,
  repo_github_id BIGINT NOT NULL,
  language_name VARCHAR(100) NOT NULL,
  bytes_count INTEGER NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  UNIQUE(repo_github_id, language_name)
);

-- 5. CONTRIBUTORS
CREATE TABLE repository_contributors (
  id SERIAL PRIMARY KEY,
  repo_github_id BIGINT NOT NULL,         -- The Repository
  contributor_github_id BIGINT NOT NULL,  -- The User
  
  login VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  html_url TEXT,
  contributions INTEGER DEFAULT 0,
  type VARCHAR(50),
  data_source VARCHAR(20),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(repo_github_id, contributor_github_id)
);

-- 6. COMMIT ACTIVITY (Weekly Stats)
CREATE TABLE repository_commit_activity (
  id SERIAL PRIMARY KEY,
  repo_github_id BIGINT NOT NULL,
  week_timestamp BIGINT NOT NULL,
  week_date DATE NOT NULL,
  total_commits INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_github_id, week_timestamp)
);

-- 7. RECENT COMMITS
CREATE TABLE repository_commits (
  id SERIAL PRIMARY KEY,
  repo_github_id BIGINT NOT NULL,
  sha VARCHAR(40) NOT NULL,
  commit_message TEXT NOT NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  author_login VARCHAR(255),
  author_avatar_url TEXT,
  committer_name VARCHAR(255),
  committer_date TIMESTAMPTZ NOT NULL,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  total_changes INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  html_url TEXT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_github_id, sha)
);

-- Indexes for sub-tables
CREATE INDEX idx_stats_repo_gid ON repository_stats(repo_github_id);
CREATE INDEX idx_contrib_repo_gid ON repository_contributors(repo_github_id);
CREATE INDEX idx_activity_repo_gid ON repository_commit_activity(repo_github_id);
CREATE INDEX idx_commits_repo_gid ON repository_commits(repo_github_id);
CREATE INDEX idx_commits_date ON repository_commits(committer_date DESC);
CREATE INDEX idx_langs_repo_gid ON repository_languages(repo_github_id);


-- =============================================================================
-- MODULE 3: DEVELOPER INTELLIGENCE
-- =============================================================================

-- 8. DEVELOPERS MASTER TABLE
CREATE TABLE developers (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  login VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  
  -- Basic Stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  public_repos_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  
  -- Entity Type
  is_organization BOOLEAN DEFAULT FALSE,
  
  -- Impact & Insights
  total_stars_earned INTEGER DEFAULT 0,
  years_active INTEGER DEFAULT 0,
  
  -- Tech Stack DNA
  dominant_language VARCHAR(100),
  language_expertise JSONB DEFAULT '[]', -- NEW: Stores detailed language stats
  
  -- Prestige & Trust
  badges JSONB DEFAULT '[]',
  
  -- Personas (18 Categories)
  personas JSONB DEFAULT '{}',
  
  -- Contributions (Top 5 External)
  contributed_repos JSONB DEFAULT '[]',

  -- Work Analysis
  current_work JSONB DEFAULT '{}', 
  primary_work JSONB DEFAULT '{}',
  
  -- Discovery Flags
  is_rising_star BOOLEAN DEFAULT FALSE,
  scout_source VARCHAR(50) DEFAULT 'hall_of_fame',
  
  -- Behavioral Stats
  consistency_streak INTEGER DEFAULT 0,
  work_schedule VARCHAR(50),
  good_citizen_score INTEGER DEFAULT 0,
  velocity_score DECIMAL(10, 2) DEFAULT 0,
  momentum_score DECIMAL(10, 2) DEFAULT 0,
  
  -- Context
  company VARCHAR(255),
  location VARCHAR(255),
  blog_url TEXT,
  twitter_username VARCHAR(255),
  
  last_fetched TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DEVELOPER TROPHY CASE (Top 3 Owned Repos)
CREATE TABLE developer_top_repos (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  html_url TEXT NOT NULL,
  description TEXT,
  stars_count INTEGER DEFAULT 0,
  language VARCHAR(100),
  
  -- Primary Work Flag 
  is_primary BOOLEAN DEFAULT FALSE,
  
  UNIQUE(developer_id, name)
);

-- Indexes for Developers
CREATE INDEX idx_devs_impact ON developers(total_stars_earned DESC);
CREATE INDEX idx_devs_followers ON developers(followers_count DESC);
CREATE INDEX idx_devs_personas ON developers USING gin (personas);
CREATE INDEX idx_devs_is_org ON developers(is_organization);
CREATE INDEX idx_devs_source ON developers(scout_source);

-- JSONB Indexes for High-Performance Querying on JSON columns
CREATE INDEX idx_devs_current_work ON developers USING gin (current_work);
CREATE INDEX idx_devs_primary_work ON developers USING gin (primary_work);