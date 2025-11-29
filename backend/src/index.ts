import express from "express";
import pool from "./db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import githubService from "./services/githubService.js";
import workerService from './services/workerService.js';
import developerWorkerService from "./services/developerWorkerService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =============================================================================
// HELPER: Resolve Local ID to GitHub ID
// =============================================================================

async function getGithubIdFromLocal(localId: number): Promise<string | null> {
  const res = await pool.query(`SELECT github_id FROM repositories WHERE id = $1`, [localId]);
  if (res.rows.length === 0) return null;
  return res.rows[0].github_id;
}

// Test Endpoint
app.post('/test' , async (req, res) => {
   res.status(202).json({ message: "Test trigger received." });
})

// =============================================================================
// 1. SYNC TRIGGERS (CORE DATA FETCHING)
// =============================================================================

app.post('/fetch-growing', async (req, res) => {
  try {
    await githubService.SaveGrowingRepositories();
    res.status(202).json({ message: "Growing Repositories Fetch Started." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/fetch-trending', async (req, res) => {
  try {
    await githubService.SaveTrendingRepositories();
    res.status(202).json({ message: "Trending Repositories Fetch Started." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync/quick", async (req, res) => {
  try {
    githubService.syncQuick(); // Non-blocking
    res.status(202).json({ message: "Quick sync started successfully." });
  } catch (error: any) {
    console.error("❌ Quick sync trigger error:", error);
    res.status(500).json({ error: "Failed to start quick sync", details: error.message });
  }
});

app.post("/api/sync/comprehensive", async (req, res) => {
  try {
    githubService.syncComprehensive(); // Non-blocking
    res.status(202).json({ message: "Comprehensive sync started successfully." });
  } catch (error: any) {
    console.error("❌ Comprehensive sync trigger error:", error);
    res.status(500).json({ error: "Failed to start comprehensive sync", details: error.message });
  }
});

// =============================================================================
// 2. DEVELOPER TRIGGERS
// =============================================================================

app.post("/api/developers/fetch", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });
    await developerWorkerService.fetchSpecificDeveloper(username);
    res.status(200).json({ message: `Successfully fetched ${username}.` });
  } catch (error: any) {
    console.error("Error manual fetch:", error);
    res.status(500).json({ error: "Failed to fetch developer" });
  }
});

app.post("/api/workers/scout", async (req, res) => {
  try {
    developerWorkerService.runAllMissions();
    res.status(202).json({ message: "Global Developer Scouting Mission Started." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/fetch/oussama", async (req, res) => {
  try {
    await developerWorkerService.fetchSpecificDeveloper("rakaoran");
    res.status(202).json({ message: "RakaOran Developer Scouting Mission Started." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// 3. WORKER TRIGGERS (Background Jobs)
// =============================================================================

// CONTRIBUTORS
app.post("/api/workers/update-contributors", async (req, res) => {
  const mode = req.query.mode as string;
  try {
    if (mode === 'all') {
        await workerService.updateAllContributors();
        res.status(202).json({ message: `Started refreshing ALL contributors.` });
    } else {
        await workerService.updateMissingContributors();
        res.status(202).json({ message: `Started fetching MISSING contributors.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// COMMIT ACTIVITY
app.post("/api/workers/update-commit-activity", async (req, res) => {
  const mode = req.query.mode as string;
  try {
    if (mode === 'all') {
        await workerService.updateAllCommitActivity();
        res.status(202).json({ message: `Started refreshing ALL commit activity.` });
    } else {
        await workerService.updateMissingCommitActivity();
        res.status(202).json({ message: `Started fetching MISSING commit activity.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// RECENT COMMITS
app.post("/api/workers/update-recent-activity", async (req, res) => {
  const mode = req.query.mode as string;
  try {
    if (mode === 'all') {
        await workerService.updateAllRecentCommits();
        res.status(202).json({ message: `Started refreshing ALL recent commits.` });
    } else {
        await workerService.updateMissingRecentCommits();
        res.status(202).json({ message: `Started fetching MISSING recent commits.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MASTER RUNNER
app.post("/api/workers/run-all", async (req, res) => {
  const mode = req.query.mode as string;
  try {
    const forceAll = mode === 'all';
    workerService.runAllJobs(forceAll); 
    res.status(202).json({ message: `All background jobs started (Force All: ${forceAll})` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/workers/runByOrder", async (req, res) => {
  try {
    workerService.runReposOneByOne(); 
    res.status(202).json({ message: `runReposOneByOne started` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// 4. DATA READ ENDPOINTS (API)
// =============================================================================

// DEVELOPER ENDPOINTS

// GET /api/developers
app.get("/api/developers", async (req, res) => {
  try {
    const {
      type = "all",
      language,
      persona,
      badge,
      limit = 20000 
    } = req.query;

    let where = [];
    let params = [];
    let idx = 1;

    // -----------------------------
    // NEW BOOLEAN FILTERING
    // -----------------------------
    if (type === "top") {
      where.push(`d.is_hall_of_fame = TRUE`);
    } 
    else if (type === "expert") {
      where.push(`d.is_trending_expert = TRUE`);
    }
    else if (type === "rising") {
      where.push(`d.is_rising_star = TRUE`);
    }
    else if (type === "badge") {
      where.push(`d.is_badge_holder = TRUE`);
    }
    else {
      where.push(`d.followers_count >= 0`);
    }

    // -----------------------------
    // ADDITIONAL FILTERS
    // -----------------------------
    
    // Language Filter
    if (language) {
      where.push(`d.dominant_language = $${idx}`);
      params.push(language);
      idx++;
    }

    // Persona Filter
    if (persona) {
      where.push(`(d.personas->>$${idx})::int > 0`);
      params.push(persona);
      idx++;
    }

    // Specific Badge Type Filter (e.g. 'MVP', 'GDE')
    if (badge) {
      where.push(`
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(d.badges) AS b
          WHERE LOWER(b->>'type') = LOWER($${idx})
            OR LOWER(b->>'category') = LOWER($${idx})
        )
      `);
      params.push(badge);
      idx++;
    }

    const whereSQL = where.length ? "WHERE " + where.join(" AND ") : "";

    const query = `
      SELECT 
        d.*,
        COALESCE(
          json_agg(
            json_build_object(
              'name', t.name,
              'url', t.html_url,
              'stars', t.stars_count,
              'language', t.language,
              'is_primary', t.is_primary
            ) ORDER BY t.stars_count DESC
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS top_repos
      FROM developers d
      LEFT JOIN developer_top_repos t ON d.id = t.developer_id
      ${whereSQL}
      GROUP BY d.id
      ORDER BY d.followers_count DESC
      LIMIT $${idx};
    `;

    params.push(limit);

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });

  } catch (err) {
    console.error("Error fetching developers:", err);
    res.status(500).json({ error: "Failed to fetch developers" });
  }
});

app.get("/api/developers/:login/details", async (req, res) => {
  try {
    const { login } = req.params;
    const query = `
      SELECT 
        d.*,
        COALESCE(
          json_agg(
            json_build_object(
              'name', t.name,
              'url', t.html_url,
              'stars', t.stars_count,
              'language', t.language,
              'description', t.description,
              'is_primary', t.is_primary
            ) ORDER BY t.stars_count DESC
          ) FILTER (WHERE t.id IS NOT NULL), 
          '[]'
        ) as top_repos
      FROM developers d
      LEFT JOIN developer_top_repos t ON d.id = t.developer_id
      WHERE d.login = $1
      GROUP BY d.id
    `;
    const { rows } = await pool.query(query, [login]);
    if (rows.length === 0) return res.status(404).json({ error: "Developer not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching developer details:', err);
    res.status(500).json({ error: "Failed to fetch developer details" });
  }
});

// REPOSITORY ENDPOINTS (Unified)

app.get("/api/repos/filter", async (req, res) => {
  try {
    const { q, language, topic, min_stars, sort_by, source } = req.query;
    const searchText = q ? `%${q}%` : null;
    
    const whereClauses = [
      `($1::text IS NULL OR r.name ILIKE $1 OR r.description ILIKE $1)`,
      `($2::text IS NULL OR r.language = $2)`,
      `($3::text IS NULL OR $3 = ANY(r.topics))`,
      `r.stars_count >= $4`
    ];
    
    if (source) {
      let category = 'top';
      if (source === 'growings') category = 'growing';
      if (source === 'trendings') category = 'trending';
      whereClauses.push(`'${category}' = ANY(r.categories)`);
    }
    
    const whereClause = whereClauses.join(' AND ');
    
    const queryText = `
      SELECT 
        r.*, 
        rs.days_since_last_commit, rs.activity_score, rs.health_score,
        rs.commits_last_year, rs.latest_release_tag, rs.total_releases
      FROM repositories r
      LEFT JOIN repository_stats rs ON r.github_id = rs.repo_github_id
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN $5 = 'newest' THEN r.created_at END DESC,
        CASE WHEN $5 = 'updated' THEN r.updated_at END DESC,
        r.stars_count DESC
      LIMIT 100
    `;
    
    const { rows } = await pool.query(queryText, [
      searchText, 
      language, 
      topic, 
      min_stars ? parseInt(String(min_stars)) : 0, 
      sort_by
    ]);
    
    res.json({ data: rows });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/api/repos/top", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 1000);
    const lastStars = req.query.lastStars ? parseInt(req.query.lastStars as string) : null;
    const lastId = req.query.lastId ? parseInt(req.query.lastId as string) : null;

    let queryText = `
      SELECT 
        r.*,
        rs.health_score, rs.activity_score, rs.days_since_last_commit,
        rs.commits_last_year, rs.latest_release_tag, rs.total_releases
      FROM repositories r
      LEFT JOIN repository_stats rs ON r.github_id = rs.repo_github_id
      WHERE 'top' = ANY(r.categories)
    `;
    
    const params: (number | string)[] = [];

    if (lastStars !== null && lastId !== null) {
      queryText += ` AND (r.stars_count, r.id) < ($1, $2)`;
      params.push(lastStars, lastId);
    }
    
    queryText += ` ORDER BY r.stars_count DESC, r.id DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const { rows } = await pool.query(queryText, params);
    
    const hasMore = rows.length === limit;
    const nextCursor = hasMore ? { 
      lastStars: rows[rows.length - 1].stars_count, 
      lastId: rows[rows.length - 1].id 
    } : null;

    res.json({ data: rows, nextCursor, hasMore });
  } catch (err) {
    console.error('Error fetching top repos:', err);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

app.get('/api/growings-database', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        r.*,
        rs.health_score, rs.activity_score, rs.days_since_last_commit,
        rs.commits_last_year, rs.latest_release_tag, rs.total_releases
      FROM repositories r
      LEFT JOIN repository_stats rs ON r.github_id = rs.repo_github_id
      WHERE 'growing' = ANY(r.categories)
      ORDER BY r.stars_count DESC, r.id DESC
    `;
    const { rows } = await pool.query(queryText);
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching growing repos:', err);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

app.get('/api/trendings-database', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        r.*,
        rs.health_score, rs.activity_score, rs.days_since_last_commit,
        rs.commits_last_year, rs.latest_release_tag, rs.total_releases
      FROM repositories r
      LEFT JOIN repository_stats rs ON r.github_id = rs.repo_github_id
      WHERE 'trending' = ANY(r.categories)
      ORDER BY r.stars_count DESC, r.id DESC
    `;
    const { rows } = await pool.query(queryText);
    res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching trending repos:', err);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

app.get("/api/repos/search", async (req, res) => {
  try {
    const fullName = req.query.full_name as string;
    if (!fullName) return res.status(400).json({ error: "full_name parameter is required" });

    const query = `
      SELECT r.*, rs.health_score, rs.activity_score
      FROM repositories r
      LEFT JOIN repository_stats rs ON r.github_id = rs.repo_github_id
      WHERE r.full_name = $1
      LIMIT 1
    `;
    
    const { rows } = await pool.query(query, [fullName]);
    if (rows.length === 0) return res.status(404).json({ error: "Repository not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error searching repository:', err);
    res.status(500).json({ error: "Failed to search repository" });
  }
});

// REPO DETAILS (Unified)
app.get("/api/repos/:id/details", async (req, res) => {
  try {
    const repoId = parseInt(req.params.id);
    
    const repoQuery = `
      SELECT 
        r.*,
        rs.commits_last_month, rs.commits_last_year,
        rs.issues_closed_last_month, rs.pull_requests_merged_last_month,
        rs.stars_growth_30d, rs.forks_growth_30d, rs.contributors_count,
        rs.activity_score, rs.health_score,
        rs.avg_issue_close_time_days, rs.avg_pr_merge_time_days,
        rs.days_since_last_commit, rs.latest_release_tag, rs.total_releases
      FROM repositories r
      LEFT JOIN repository_stats rs ON r.github_id = rs.repo_github_id
      WHERE r.id = $1
    `;
    
    const repoResult = await pool.query(repoQuery, [repoId]);
    if (repoResult.rows.length === 0) return res.status(404).json({ error: "Repository not found" });
    
    const repository = repoResult.rows[0];
    const githubId = repository.github_id;
    
    const languagesResult = await pool.query(`
      SELECT language_name, bytes_count, percentage
      FROM repository_languages
      WHERE repo_github_id = $1
      ORDER BY percentage DESC
    `, [githubId]);
    
    res.json({
      ...repository,
      languages: languagesResult.rows,
    });
    
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch repository details" });
  }
});

app.get("/api/repos/:id/contributors", async (req, res) => {
  try {
    const localId = parseInt(req.params.id);
    const githubId = await getGithubIdFromLocal(localId);
    if (!githubId) return res.status(404).json({ error: "Repository not found" });

    const { rows } = await pool.query(
      `SELECT login, avatar_url, html_url, contributions, data_source
       FROM repository_contributors
       WHERE repo_github_id = $1
       ORDER BY contributions DESC `,
      [githubId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contributors:', error);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

app.get("/api/repos/:id/commit-activity", async (req, res) => {
  try {
    const localId = parseInt(req.params.id);
    const githubId = await getGithubIdFromLocal(localId);
    if (!githubId) return res.status(404).json({ error: "Repository not found" });

    const { rows } = await pool.query(
      `SELECT week_date, total_commits
       FROM repository_commit_activity
       WHERE repo_github_id = $1
       ORDER BY week_date ASC`,
      [githubId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching commit activity:', error);
    res.status(500).json({ error: 'Failed to fetch commit activity' });
  }
});

app.get("/api/repos/:id/commits", async (req, res) => {
  try {
    const localId = parseInt(req.params.id);
    const limit = Math.min(parseInt(req.query.limit as string) || 15, 50);
    const githubId = await getGithubIdFromLocal(localId);
    if (!githubId) return res.status(404).json({ error: "Repository not found" });

    const { rows } = await pool.query(
      `SELECT 
        sha, commit_message, author_name, author_email, author_login, author_avatar_url,
        committer_name, committer_date, additions, deletions, total_changes,
        files_changed, html_url, fetched_at
       FROM repository_commits
       WHERE repo_github_id = $1
       ORDER BY committer_date DESC
       LIMIT $2`,
      [githubId, limit]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) as total_repos,
        SUM(stars_count) as total_stars
      FROM repositories
    `);
    
    res.json({
      totalRepositories: parseInt(rows[0].total_repos, 10) || 0,
      totalStars: parseInt(rows[0].total_stars, 10) || 0
    });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: "OK", message: "Database connected" });
  } catch (e) {
    res.status(500).json({ status: "ERROR", message: "Database disconnected" });
  }
});

// =============================================================================
// 5. STATIC FILES & FALLBACK
// =============================================================================

app.use(express.static(path.join(__dirname, "../../public")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`\n🌐 Server running on http://localhost:${port}`);

  if (process.env.SYNC_DATA_ON_STARTUP === 'true') {
    (async () => {
      try {
        const { rows } = await pool.query('SELECT COUNT(*) as count FROM repositories');
        if (parseInt(rows[0].count, 10) === 0) {
          await githubService.syncQuick();
        }
      } catch (error) {
        console.error("❌ Error during startup sync check:", error);
      }
    })();
  }
});