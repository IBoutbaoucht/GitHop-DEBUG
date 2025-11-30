-- Add column for README content
ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS readme_snippet TEXT;

-- Optional: Add a text search index for high-performance searching later
-- This allows you to do fast full-text search on the readme content
CREATE INDEX IF NOT EXISTS idx_repos_readme_search ON repositories USING GIN (to_tsvector('english', readme_snippet));