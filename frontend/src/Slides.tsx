import { useState, useEffect, useRef, useMemo } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// --- TYPES ---
type SlideType = 'title' | 'simple' | 'split' | 'list' | 'code' | 'table' | 'grid';

interface Quote {
  text: string;
  author: string;
}

interface GridItem {
  title: string;
  icon: string; // SVG key
  description: string;
}

interface SlideData {
  type: SlideType;
  title: string;
  subtitle?: string;
  developers?: string[];
  content?: string;
  items?: string[];
  quote?: Quote;
  language?: string;
  description?: string[];
  code?: string;
  imageSrc?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  gridItems?: GridItem[];
  theme?: 'analysis' | 'architecture';
  leftContent?: { title: string; text: string };
  rightContent?: { title: string; text: string };
}

// --- DATA ---
const slides: SlideData[] = [
  // ==========================================
  // PHASE 1: ANALYSIS & REQUIREMENTS (12 Slides - Cyan/Blue Theme)
  // ==========================================
  {
    type: 'title',
    title: 'GitHop',
    subtitle: 'From Requirements to Reality',
    developers: ['Imad BOUTBAOUCHT', 'Ilias SKIRIBA'],
    content: 'Project Analysis & Implementation Review • Oct 2025',
    theme: 'analysis'
  },
  {
    type: 'simple',
    title: 'What is GitHop?',
    content: 'GitHop is a social intelligence engine for Open Source. It aggregates scattered GitHub activity into a curated, algorithmic feed—transforming raw data into meaningful developer personas and trending insights.',
    theme: 'analysis'
  },
  {
    type: 'split',
    title: 'Project Motivation',
    subtitle: 'Gap Analysis',
    theme: 'analysis',
    leftContent: {
      title: 'The Problem',
      text: 'Developers suffer from information overload. GitHub Trending is superficial, lacking semantic filtering. Identifying active peers or finding specific stacks requires manual, time-consuming excavation.'
    },
    rightContent: {
      title: 'The Solution',
      text: 'A unified "Social Feed" for code. We implemented a system that aggregates Repositories, Developers, and Topics, powered by Vector Search (AI) and automated background workers to curate quality over quantity.'
    }
  },
  {
    type: 'grid',
    title: 'Market Validation',
    subtitle: 'Feasibility Study Results',
    theme: 'analysis',
    gridItems: [
      { title: 'Usage Frequency', icon: 'chart', description: '87.5% of surveyed developers use GitHub tools weekly.' },
      { title: 'Feature Demand', icon: 'filter', description: '100% requested advanced filtering (Topic/Language).' },
      { title: 'UX Preference', icon: 'layout', description: '62.5% preferred a combined "Feed + Dashboard" view.' },
      { title: 'Verdict', icon: 'check', description: 'Greenlit. Vision validated by user research.' }
    ]
  },
  {
    type: 'table',
    title: 'FR: Data Aggregation',
    subtitle: 'SRS Section 3.1',
    theme: 'analysis',
    tableHeaders: ['ID', 'Requirement', 'Status', 'Implementation Detail'],
    tableRows: [
      ['FR-1.1', 'Hybrid API (REST+GraphQL)', 'PASSED', 'githubService.ts uses fetch & graphql-request'],
      ['FR-1.2', 'Calculate Ranking Metrics', 'PASSED', 'Custom Scoring Algo in githubService.ts'],
      ['FR-1.3', 'Handle Rate Limiting', 'PASSED', 'Sleep/Retry logic in commitWorker.ts']
    ]
  },
  {
    type: 'table',
    title: 'FR: Repo Intelligence',
    subtitle: 'SRS Section 3.2',
    theme: 'analysis',
    tableHeaders: ['ID', 'Requirement', 'Status', 'Implementation Detail'],
    tableRows: [
      ['FR-2.1', 'Exploration Score', 'PASSED', 'Weighted: Stars(100x) + Forks(50x)'],
      ['FR-3.1', 'Growth Velocity', 'PASSED', 'Score = stargazers / ageInDays'],
      ['FR-X', 'README Analysis', 'PASSED', 'readmeWorkerService.ts fetches context']
    ]
  },
  {
    type: 'table',
    title: 'FR: Dev Intelligence',
    subtitle: 'SRS Section 3.3',
    theme: 'analysis',
    tableHeaders: ['ID', 'Requirement', 'Status', 'Implementation Detail'],
    tableRows: [
      ['FR-4.1', 'Rank Devs by Topic', 'PASSED', 'Regex Keyword Analysis in devWorker.ts'],
      ['FR-5.1', 'Identify Trends', 'PASSED', 'BigQuery Integration (newService.ts)'],
      ['FR-5.2', 'Auto-Tagging', 'PASSED', 'Badges (GDE, MVP) assigned via Bio']
    ]
  },
  {
    type: 'code',
    title: 'Advanced Features',
    subtitle: 'Semantic Search Agent',
    theme: 'analysis',
    description: [
        'Requirement: "Advanced Filtering"',
        'Implementation: Google Gemini AI + Vector Embeddings',
        'Result: Natural Language Querying'
    ],
    code: `// searchAgentService.ts
// User: "Find me a React starter kit for AI"

// 1. AI Parsing (Gemini Flash)
const intent = await gemini.parse(query);
// Result: { language: 'React', topic: 'AI' }

// 2. Vector Search (pgvector)
const embeddings = await embed(query);
const results = await db.vectorQuery(embeddings, intent);`
  },
  {
    type: 'table',
    title: 'Non-Functional Reqs',
    subtitle: 'SRS Section 7',
    theme: 'analysis',
    tableHeaders: ['Requirement', 'Target', 'Status', 'Evidence'],
    tableRows: [
      ['Performance', '< 2s Load Time', 'PASSED', 'Pre-fetched JSON data'],
      ['Reliability', 'API Outage Safety', 'PASSED', 'Try/Catch blocks in Workers'],
      ['Scalability', 'Concurrent Users', 'PASSED', 'DB Connection Pooling (db.ts)'],
      ['Security', 'Secure Creds', 'PASSED', 'dotenv & gitignore used']
    ]
  },
  {
    type: 'grid',
    title: 'Tech Feasibility',
    subtitle: 'Plan vs Reality',
    theme: 'analysis',
    gridItems: [
      { title: 'Backend', icon: 'server', description: 'Plan: Node.js\nReality: Node + Express + TypeScript' },
      { title: 'Database', icon: 'database', description: 'Plan: PostgreSQL\nReality: PG + pgvector (AI)' },
      { title: 'Data Sources', icon: 'network', description: 'Plan: GitHub API\nReality: REST + GraphQL + BigQuery' },
      { title: 'Verdict', icon: 'shield', description: 'Architecture Exceeded Expectations.' }
    ]
  },
  {
    type: 'list',
    title: 'Schedule & Process',
    subtitle: 'Timeline: 6 Weeks',
    theme: 'analysis',
    items: [
      '<b>Foundation:</b> Setup DB & CI/CD ✅',
      '<b>Data Arch:</b> Designed Repo/Dev Schemas ✅',
      '<b>Backend Core:</b> Implemented Workers & Services ✅',
      '<b>Risk Mitigation:</b> Implemented "Stub Hydration" to bypass API Rate Limits ✅'
    ]
  },
  {
    type: 'simple',
    title: 'Analysis Conclusion',
    content: '100% of Critical Requirements Met. Ready for Technical Deep Dive.',
    theme: 'analysis'
  },

  // ==========================================
  // PHASE 2: ARCHITECTURE & TESTING (13 Slides - Purple/Pink Theme)
  // ==========================================
  {
    type: 'simple',
    title: 'Technical Architecture',
    content: 'Exploring the Design Patterns and Testing Strategy behind the requirements.',
    theme: 'architecture'
  },
  // DESIGN PATTERNS (8 SLIDES)
  {
    type: 'code',
    title: 'Singleton Pattern',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Creational',
      'Ensures a class has only one instance.',
      'Critical for managing the Database Connection Pool.'
    ],
    code: `// src/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20 // Limit connections
});

// The single instance export
export default pool;`
  },
  {
    type: 'code',
    title: 'Strategy Pattern',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Behavioral',
      'Swaps algorithms at runtime.',
      'Context: Deciding between a "Full Refresh" vs "Quick Update".'
    ],
    code: `// src/services/workerService.ts
public async runJobs(strategy: 'FULL' | 'QUICK') {
    if (strategy === 'FULL') {
        // Strategy A: Heavy resource usage
        await this.updateAllHistories(); 
    } else {
        // Strategy B: Optimized for speed
        await this.updateRecentOnly(); 
    }
}`
  },
  {
    type: 'code',
    title: 'Adapter Pattern',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Structural',
      'Makes incompatible interfaces work together.',
      'Adapts BigQuery data shapes to our PostgreSQL schema.'
    ],
    code: `// BigQuery returns: { star_count: 500 }
// App expects: { stargazers_count: 500 }

const adapter = (bqRow: any): Repo => ({
    name: bqRow.repo_name,
    // The adaptation layer
    stargazers_count: bqRow.star_count, 
    updated_at: new Date()
});`
  },
  {
    type: 'code',
    title: 'Observer Pattern',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Behavioral',
      'Notifies subscribers of state changes.',
      'Used for real-time system logging and error tracking.'
    ],
    code: `// src/db.ts
// Subject: The DB Pool
pool.on('connect', (client) => {
  // Observer 1: Logger
  console.log("✅ Client Connected");
});

pool.on('error', (err) => {
  // Observer 2: Error Tracker
  console.error("❌ Unexpected Error", err);
});`
  },
  // --- MISSING PATTERNS RE-INSERTED ---
  {
    type: 'code',
    title: 'Chain of Responsibility',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Behavioral',
      'Passes requests along a chain of handlers.',
      'AI Fallback Logic: Tries Cheap Model (Flash) -> Fails -> Tries Strong Model (Pro).'
    ],
    code: `try {
    // Link 1: Fast Model
    return await askGeminiFlash(prompt);
} catch (e) {
    console.warn("Flash failed, escalating...");
    // Link 2: Strong Model
    return await askGeminiPro(prompt);
}`
  },
  {
    type: 'code',
    title: 'Builder Pattern',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Creational',
      'Constructs complex objects step-by-step.',
      'Used to build dynamic SQL queries for the Smart Search.'
    ],
    code: `// Start with base
let query = new QueryBuilder('repos');

// Step-by-step construction
if (filter.lang) query.where('language', filter.lang);
if (filter.stars) query.where('stars', '>', filter.stars);

// Finalize
const sql = query.build();`
  },
  {
    type: 'code',
    title: 'Template Method',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Behavioral',
      'Defines the skeleton of an algorithm.',
      'Standardizes how we sync Weekly vs Monthly trends.'
    ],
    code: `abstract class TrendSync {
    // The Template (Fixed steps)
    async sync() {
        const data = await this.fetchData(); // Abstract
        await this.save(data); // Concrete
    }
}

class WeeklySync extends TrendSync {
    fetchData() { return ghArchive.getDays(7); }
}`
  },
  {
    type: 'code',
    title: 'Facade Pattern',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Structural',
      'Hides complexity behind a simple interface.',
      'The WorkerService wraps complex background job logic.'
    ],
    code: `// Complex Subsystems:
// - RedisQueue
// - GitHubAPI
// - DB Update Logic

// Facade:
export class WorkerFacade {
    static async startAll() {
        // Orchestrates all subsystems effortlessly
        await queue.clean();
        await api.hydrate();
    }
}`
  },
  // TESTING SLIDES (3 SLIDES)
  {
    type: 'code',
    title: 'Unit Testing',
    subtitle: 'White-Box Testing',
    language: 'typescript',
    theme: 'architecture',
    description: [
        'Method: White-Box Testing (Internal Logic Known)',
        'Target: Developer Persona Engine',
        'Goal: Verify logic isolation.'
    ],
    code: `describe('Persona Engine', () => {
  test('classifies AI Whisperer', () => {
    const bio = "I love LLMs and GPT";
    const result = calculatePersona(bio);
    
    expect(result.ai_whisperer).toBeGreaterThan(0);
    expect(result.frontend_wizard).toBe(0);
  });
});

/* TERMINAL OUTPUT:
 PASS  tests/persona.test.ts
 ✓ classifies AI Whisperer (4ms)
*/`
  },
  {
    type: 'code',
    title: 'Boundary Value Analysis',
    subtitle: 'Edge Case Validation',
    language: 'typescript',
    theme: 'architecture',
    description: [
        'Method: Boundary Testing',
        'Target: Scoring Algorithm',
        'Goal: Handle 0 inputs (New Repo).'
    ],
    code: `test('Handles Zero-State Repo', () => {
    const zeroRepo = { stars: 0, forks: 0 };
    const score = calculateScore(zeroRepo);
    
    // Boundary Check
    expect(score).toBe(0); 
    expect(Number.isNaN(score)).toBe(false);
});

/* TERMINAL OUTPUT:
 PASS  tests/scoring.test.ts
 ✓ Handles Zero-State Repo (2ms)
*/`
  },
  {
    type: 'table',
    title: 'Test Case Artifacts',
    subtitle: 'Black-Box Testing',
    theme: 'architecture',
    tableHeaders: ['ID', 'Input', 'Expected', 'Actual', 'Status'],
    tableRows: [
        ['TC-01', '"React Twitter Clone"', 'List of React Repos', '5 Results Found', 'PASS ✅'],
        ['TC-02', '"" (Empty String)', 'Error 400', 'Error 400', 'PASS ✅'],
        ['TC-03', '"Cobol Mainframe"', 'Empty List []', 'Empty List []', 'PASS ✅']
    ]
  },
  // SUMMARY
  {
    type: 'simple',
    title: 'Conclusion',
    content: 'GitHop is fully implemented, tested, and ready for deployment.',
    theme: 'architecture'
  }
];

// --- ICONS (SVG MAPPING) ---
const Icons: Record<string, React.ReactNode> = {
  chart: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
  ),
  filter: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
  ),
  layout: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
  ),
  check: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  server: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
  ),
  database: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
  ),
  network: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
  ),
  shield: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  )
};

function Slides() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];
  const currentTheme = currentSlide.theme || 'architecture';
  const progressPercentage = ((currentSlideIndex + 1) / slides.length) * 100;

  // --- LOGIC ---

  const highlightedCode = useMemo(() => {
    if (currentSlide.type !== 'code' || !currentSlide.code) return '';
    if (currentSlide.language) {
      try {
        return hljs.highlight(currentSlide.code, { language: currentSlide.language }).value;
      } catch (e) {
        return currentSlide.code;
      }
    }
    return hljs.highlightAuto(currentSlide.code).value;
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) setCurrentSlideIndex(prev => prev - 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
    };
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [currentSlideIndex]);

  // --- THEME COLORS ---
  const isAnalysis = currentTheme === 'analysis';
  const accentGradient = isAnalysis 
    ? 'from-cyan-400 via-blue-500 to-cyan-400' 
    : 'from-purple-400 via-pink-400 to-purple-400';
  
  const accentText = isAnalysis ? 'text-cyan-400' : 'text-purple-400';
  const accentBorder = isAnalysis ? 'border-cyan-500/50' : 'border-purple-500/50';
  const ambientBg = isAnalysis ? 'bg-cyan-900/10' : 'bg-purple-900/10';

  return (
    <>
      <style>{`
        .slide-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .slide-scroll::-webkit-scrollbar-track { background: #0B0C15; }
        .slide-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        
        .hljs { background: transparent !important; }

        .bg-grid-pattern {
            background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 50px 50px;
        }

        .glass-panel {
           background: rgba(13, 14, 23, 0.85);
           backdrop-filter: blur(24px);
           -webkit-backdrop-filter: blur(24px);
           border: 1px solid rgba(255, 255, 255, 0.05);
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-enter { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="w-full h-full min-h-screen flex items-center justify-center bg-[#0B0C15] p-4 font-sans text-gray-300 relative overflow-hidden bg-grid-pattern">
        
        <div className={`absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${ambientBg}`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 ${ambientBg}`}></div>

        <div 
          ref={containerRef}
          className={`flex flex-col glass-panel transition-all duration-500 overflow-hidden relative ${
            isFullscreen 
              ? 'w-full h-full rounded-none border-0' 
              : 'w-full max-w-7xl aspect-video rounded-xl'
          }`}
        >
          {/* DECORATIVE HUD LINES */}
          <div className="absolute top-0 left-8 w-px h-full bg-white/5 pointer-events-none"></div>
          <div className="absolute top-0 right-8 w-px h-full bg-white/5 pointer-events-none"></div>
          <div className="absolute top-8 left-0 w-full h-px bg-white/5 pointer-events-none"></div>
          <div className="absolute bottom-8 left-0 w-full h-px bg-white/5 pointer-events-none"></div>

          {/* PROGRESS BAR */}
          <div className="h-1 bg-gray-800 w-full shrink-0 relative z-20">
            <div 
              className={`h-full bg-gradient-to-r ${accentGradient} shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex-1 p-12 md:p-16 flex flex-col relative z-10 overflow-hidden">
            <div key={currentSlideIndex} className="h-full flex flex-col w-full animate-enter">
              
              {/* --- 1. TITLE SLIDE --- */}
              {currentSlide.type === 'title' && (
                <div className="h-full flex flex-col justify-center items-center text-center relative">
                  <div className="mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur uppercase tracking-widest text-xs font-mono text-gray-400">
                    System Initialization
                  </div>

                  <h1 className={`font-black tracking-tighter mb-4 bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent bg-[length:200%_auto] ${
                    isFullscreen ? 'text-9xl' : 'text-8xl'
                  }`}>
                    {currentSlide.title}
                  </h1>

                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

                  <h2 className={`text-gray-100 mb-2 font-medium tracking-widest uppercase ${
                    isFullscreen ? 'text-3xl' : 'text-2xl'
                  }`}>
                    {currentSlide.subtitle}
                  </h2>
                  <p className="text-gray-500 font-mono mb-12">{currentSlide.content}</p>

                  <div className="flex gap-8 mt-4">
                    {currentSlide.developers?.map(dev => (
                      <div key={dev} className="flex flex-col items-center group">
                        <span className={`text-sm font-bold tracking-widest ${accentText} group-hover:text-white transition-colors`}>{dev}</span>
                        <span className="text-[10px] text-gray-600 uppercase">Engineer</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 2. SIMPLE SLIDE (DEFINITION/CONCLUSION) --- */}
              {currentSlide.type === 'simple' && (
                 <div className="h-full flex flex-col justify-center items-center text-center px-12 relative">
                    <div className={`absolute w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none`}></div>
                    <div className={`absolute w-[400px] h-[400px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none`}></div>

                    <h2 className={`font-bold mb-12 text-white ${isFullscreen ? 'text-7xl' : 'text-6xl'}`}>
                       {currentSlide.title}
                    </h2>
                    {currentSlide.content && (
                      <p className={`text-gray-300 max-w-5xl font-light leading-relaxed ${isFullscreen ? 'text-4xl' : 'text-3xl'}`}>
                         {currentSlide.content}
                      </p>
                    )}
                 </div>
              )}

              {/* --- 3. SPLIT SLIDE (PROBLEM/SOLUTION) --- */}
              {currentSlide.type === 'split' && (
                <div className="h-full flex flex-col">
                  <div className="mb-12 border-b border-white/10 pb-4">
                     <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}>
                        {currentSlide.title}
                     </h2>
                     <p className={`${accentText} font-mono text-sm uppercase tracking-widest`}>// {currentSlide.subtitle}</p>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-12 items-center">
                      {/* Left: Problem */}
                      <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-xl h-full flex flex-col relative group hover:border-red-500/40 transition-colors">
                          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-red-500 pointer-events-none">!</div>
                          <h3 className="text-2xl font-bold text-red-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                             <div className="w-2 h-2 bg-red-500 rounded-full"></div> {currentSlide.leftContent?.title}
                          </h3>
                          <p className="text-gray-300 text-lg leading-relaxed flex-1">
                              {currentSlide.leftContent?.text}
                          </p>
                      </div>

                      {/* Right: Solution */}
                      <div className={`bg-cyan-500/5 border ${accentBorder} p-8 rounded-xl h-full flex flex-col relative group hover:border-opacity-50 transition-colors`}>
                          <div className={`absolute top-0 right-0 p-4 opacity-10 text-9xl font-black pointer-events-none ${accentText}`}>{isAnalysis ? '✓' : '✧'}</div>
                          <h3 className={`text-2xl font-bold mb-6 uppercase tracking-wider flex items-center gap-2 ${accentText}`}>
                             <div className={`w-2 h-2 rounded-full ${isAnalysis ? 'bg-cyan-500' : 'bg-purple-500'}`}></div> {currentSlide.rightContent?.title}
                          </h3>
                          <p className="text-gray-300 text-lg leading-relaxed flex-1">
                              {currentSlide.rightContent?.text}
                          </p>
                      </div>
                  </div>
                </div>
              )}

              {/* --- 4. GRID SLIDE (MARKET/FEASIBILITY) --- */}
              {currentSlide.type === 'grid' && (
                <div className="h-full flex flex-col">
                  <div className="mb-10 border-b border-white/10 pb-4">
                     <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}>
                        {currentSlide.title}
                     </h2>
                     <p className={`${accentText} font-mono text-sm uppercase`}>{currentSlide.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 h-full content-start">
                     {currentSlide.gridItems?.map((item, i) => (
                        <div key={i} className={`bg-[#0A0B10] p-6 rounded-lg border border-white/5 hover:${accentBorder} transition-all duration-300 flex items-start gap-6 group`}>
                           <div className={`p-4 rounded-md bg-white/5 text-white group-hover:scale-110 transition-transform duration-300 ${accentText}`}>
                              {Icons[item.icon]}
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">{item.title}</h3>
                              <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-line">{item.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              )}

              {/* --- 5. LIST SLIDE --- */}
              {currentSlide.type === 'list' && (
                <div className="h-full flex flex-col">
                  <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-6xl' : 'text-5xl'}`}>
                    {currentSlide.title}
                  </h2>
                  <p className={`${accentText} mb-8 font-mono`}>{currentSlide.subtitle}</p>
                  
                  <ul className={`space-y-6 text-gray-300 flex-1 overflow-y-auto slide-scroll pr-4 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                    {currentSlide.items?.map((item, idx) => (
                      <li key={idx} className="flex items-start p-4 bg-white/5 rounded border border-transparent hover:border-white/10 transition-all">
                         <span className={`${accentText} mr-4 font-mono font-bold opacity-50`}>0{idx + 1}</span>
                         <span dangerouslySetInnerHTML={{ __html: item }} className="text-gray-100"></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* --- 6. CODE SLIDE --- */}
              {currentSlide.type === 'code' && (
                <div className="h-full flex flex-col">
                   <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
                      <div>
                          <h2 className={`font-bold text-white ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}>
                             {currentSlide.title}
                          </h2>
                          {currentSlide.subtitle && <span className={`${accentText} font-mono text-sm mt-1 block uppercase`}>{currentSlide.subtitle}</span>}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-white/10 px-2 py-1 rounded">
                         {currentSlide.language?.toUpperCase()}
                      </span>
                   </div>
                   
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-8">
                      <div className={`md:w-1/3 overflow-y-auto slide-scroll pr-2 space-y-4 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
                         {currentSlide.description?.map((desc, idx) => (
                           <div key={idx} className={`p-4 bg-black/20 border-l-2 ${accentBorder} text-sm font-mono text-gray-400`}>
                             {desc}
                           </div>
                         ))}
                      </div>

                      <div className="md:w-2/3 flex flex-col rounded border border-white/10 bg-[#0d0e12] shadow-2xl relative">
                         <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                         </div>
                         <div className="flex-1 overflow-auto slide-scroll p-6">
                           <pre className={`font-mono leading-relaxed ${isFullscreen ? 'text-lg' : 'text-sm'}`} dangerouslySetInnerHTML={{ __html: highlightedCode }}></pre>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* --- 7. TABLE SLIDE --- */}
              {currentSlide.type === 'table' && (
                <div className="h-full flex flex-col">
                  <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}>
                     {currentSlide.title}
                  </h2>
                  <p className={`${accentText} mb-6 font-mono text-sm uppercase`}>{currentSlide.subtitle}</p>

                   <div className="flex-1 overflow-hidden rounded border border-white/10 bg-[#0d0e12]">
                       <div className="overflow-auto h-full slide-scroll">
                           <table className="w-full text-left border-collapse">
                               <thead className="sticky top-0 bg-white/5 z-10">
                                   <tr>
                                       {currentSlide.tableHeaders?.map((header, idx) => (
                                           <th key={idx} className={`p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/10`}>{header}</th>
                                       ))}
                                   </tr>
                               </thead>
                               <tbody className="text-gray-300 font-mono text-sm">
                                   {currentSlide.tableRows?.map((row, rIdx) => (
                                       <tr key={rIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                           {row.map((cell, cIdx) => (
                                               <td key={cIdx} className={`p-4 ${cell.includes('PASSED') ? 'text-green-400' : ''}`}>
                                                   {cell}
                                               </td>
                                           ))}
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTER METADATA */}
          <div className="bg-black/20 border-t border-white/5 p-4 flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest z-20">
             <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isAnalysis ? 'bg-cyan-500' : 'bg-purple-500'}`}></span>
                <span>{isAnalysis ? 'Phase: Analysis' : 'Phase: Architecture'}</span>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1">
                  <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="hover:text-white disabled:opacity-30 transition">PREV</button>
                  <span className={`mx-2 ${accentText}`}>
                    {String(currentSlideIndex + 1)} / {String(slides.length)}
                  </span>
                  <button onClick={nextSlide} disabled={currentSlideIndex === slides.length - 1} className="hover:text-white disabled:opacity-30 transition">NEXT</button>
                </div>
                <button onClick={toggleFullscreen} className={`hover:${accentText} transition`} title="Toggle Fullscreen">
                   [ {isFullscreen ? 'EXIT' : 'FULL'} ]
                </button>
             </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Slides;