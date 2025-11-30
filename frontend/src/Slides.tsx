import { useState, useEffect, useRef, useMemo } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// --- TYPES ---
type SlideType = 'title' | 'simple' | 'list' | 'image' | 'code' | 'table' | 'grid';

interface Quote {
  text: string;
  author: string;
}

interface GridItem {
  title: string;
  icon?: string;
  description: string;
  status?: string; // New: To show 'Plan vs Reality' status
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
  theme?: 'analysis' | 'architecture'; // New: To switch color themes
}

// --- DATA ---
const slides: SlideData[] = [
  // ==========================================
  // PHASE 1: ANALYSIS & REQUIREMENTS (Cyan/Blue Theme)
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
    type: 'grid',
    title: 'Vision & Validation',
    subtitle: 'Market Feasibility Report',
    theme: 'analysis',
    gridItems: [
      { title: 'The Problem', icon: '📉', description: 'GitHub Trending lacks depth. Developers struggle to find active peers and specific tools.' },
      { title: 'The Solution', icon: '🚀', description: 'A "Social Feed" for GitHub. Aggregating Repos, Devs, and Trends.' },
      { title: 'Validation', icon: '📊', description: '87% use GitHub weekly. 100% requested advanced filtering.' },
      { title: 'Status', icon: '✅', description: 'Vision Realized via newService.ts aggregators.' }
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
      ['FR-5.1', 'Identify Trending Topics', 'PASSED', 'BigQuery Integration (newService.ts)'],
      ['FR-5.2', 'Auto-Tagging', 'PASSED', 'Badges (GDE, MVP) assigned via Bio analysis']
    ]
  },
  {
    type: 'table',
    title: 'FR: Data Management',
    subtitle: 'SRS Section 3.5 & 4',
    theme: 'analysis',
    tableHeaders: ['ID', 'Requirement', 'Status', 'Implementation Detail'],
    tableRows: [
      ['FR-8.1', 'Serve from Cache', 'PASSED', 'API queries PostgreSQL, not GitHub directly'],
      ['FR-8.2', 'Background Jobs', 'PASSED', 'node-cron scheduler in scheduler.ts'],
      ['FR-8.3', 'Granular Updates', 'PASSED', 'Daily vs Weekly schedules decoupled']
    ]
  },
  {
    type: 'code',
    title: 'Advanced Features',
    subtitle: 'Smart Semantic Search',
    theme: 'analysis',
    description: [
        'Market Demand: "Advanced Filtering"',
        'Solution: Google Gemini AI + Vector Embeddings',
        'Status: Over-delivered ✅'
    ],
    code: `// searchAgentService.ts
// User: "Find me a React starter kit for AI"

// 1. AI Parsing
const intent = await gemini.parse(query);
// Result: { language: 'React', topic: 'AI' }

// 2. Vector Search
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
      { title: 'Backend', icon: '⚙️', description: 'Plan: Node.js\nReality: Node + Express + TypeScript (Added for safety)' },
      { title: 'Database', icon: '🗄️', description: 'Plan: PostgreSQL\nReality: PG + pgvector (Added for AI)' },
      { title: 'Data Sources', icon: '🌐', description: 'Plan: GitHub API\nReality: REST + GraphQL + BigQuery' },
      { title: 'Verdict', icon: '🏆', description: 'Architecture is significantly more robust than planned.' }
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
    type: 'grid',
    title: 'The "Wow" Factor',
    subtitle: 'Delivering Dream Features',
    theme: 'analysis',
    gridItems: [
      { title: 'AI Integration', icon: '🤖', description: 'Plan: "Project Generator"\nDelivered: Semantic Search & Summarization' },
      { title: 'Skillboard', icon: '🎖️', description: 'Plan: "Show Skills"\nDelivered: Auto-assigned Badges & Personas' },
    ]
  },
  {
    type: 'simple',
    title: 'Analysis Conclusion',
    content: '100% of Critical Requirements Met. Ready for Deployment.',
    theme: 'analysis'
  },

  // ==========================================
  // PHASE 2: ARCHITECTURE (Purple/Pink Theme)
  // ==========================================
  {
    type: 'simple',
    title: 'Technical Deep Dive',
    content: 'Exploring the Design Patterns and Architecture behind the requirements.',
    theme: 'architecture'
  },
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
  {
    type: 'code',
    title: 'Chain of Responsibility',
    language: 'typescript',
    theme: 'architecture',
    description: [
      'Type: Behavioral',
      'Passes requests along a chain of handlers.',
      'AI Fallback Logic: Try Cheap Model -> Fail -> Try Strong Model.'
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
    // The Template
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
  {
    type: 'code',
    title: 'Unit Testing',
    subtitle: 'White-Box Testing',
    language: 'typescript',
    theme: 'architecture',
    description: [
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
  {
    type: 'simple',
    title: 'Thank You',
    content: 'GitHop: Where Requirements Meet Reality.',
    theme: 'architecture'
  }
];

function Slides() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];
  // Default to architecture theme if undefined
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
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentSlideIndex]);

  // --- THEME COLORS ---
  const isAnalysis = currentTheme === 'analysis';
  // Analysis: Cyan/Blue | Architecture: Purple/Pink
  const accentGradient = isAnalysis 
    ? 'from-cyan-400 via-blue-500 to-cyan-400' 
    : 'from-purple-400 via-pink-400 to-purple-400';
  
  const accentText = isAnalysis ? 'text-cyan-400' : 'text-purple-400';
  const accentBorder = isAnalysis ? 'border-cyan-500' : 'border-purple-500';
  const ambientBg = isAnalysis ? 'bg-cyan-900/20' : 'bg-purple-900/20';

  return (
    <>
      <style>{`
        .slide-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .slide-scroll::-webkit-scrollbar-track { background: #0B0C15; }
        .slide-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .slide-scroll::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        
        .hljs { background: transparent !important; }

        .bg-grid-pattern {
            background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .glass-panel {
           background: rgba(11, 12, 21, 0.7);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.08);
           box-shadow: 0 0 40px rgba(0,0,0,0.5);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-enter { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-glow { animation: pulse-glow 3s infinite ease-in-out; }
      `}</style>

      <div className="w-full h-full min-h-screen flex items-center justify-center bg-[#0B0C15] p-4 font-sans text-gray-300 relative overflow-hidden bg-grid-pattern">
        
        {/* AMBIENT GLOWS BASED ON THEME */}
        <div className={`absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] animate-glow pointer-events-none transition-colors duration-1000 ${ambientBg}`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] animate-glow pointer-events-none transition-colors duration-1000 ${ambientBg}`} style={{ animationDelay: '1.5s' }}></div>

        <div 
          ref={containerRef}
          className={`flex flex-col glass-panel transition-all duration-500 overflow-hidden ${
            isFullscreen 
              ? 'w-full h-full rounded-none border-0' 
              : 'w-full max-w-7xl aspect-video rounded-2xl'
          }`}
        >
          {/* PROGRESS BAR */}
          <div className="h-1 bg-gray-800 w-full shrink-0 relative">
            <div 
              className={`h-full bg-gradient-to-r ${accentGradient} shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex-1 p-8 md:p-12 flex flex-col relative z-10 overflow-hidden">
            <div key={currentSlideIndex} className="h-full flex flex-col w-full animate-enter">
              
              {/* --- 1. TITLE SLIDE --- */}
              {currentSlide.type === 'title' && (
                <div className="h-full flex flex-col justify-center items-center text-center relative">
                  <div className={`mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl`}>
                     <span className="text-6xl">{isAnalysis ? '📊' : '👾'}</span>
                  </div>

                  <h1 className={`font-black tracking-tight mb-6 bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent bg-[length:200%_auto] animate-[pulse_4s_infinite] ${
                    isFullscreen ? 'text-9xl' : 'text-8xl'
                  }`}>
                    {currentSlide.title}
                  </h1>

                  <h2 className={`text-gray-400 mb-8 font-medium tracking-[0.2em] uppercase ${
                    isFullscreen ? 'text-3xl' : 'text-xl'
                  }`}>
                    {currentSlide.subtitle}
                  </h2>
                  
                  {currentSlide.content && (
                     <p className={`mb-8 text-gray-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>{currentSlide.content}</p>
                  )}

                  <div className="flex gap-4">
                    {currentSlide.developers?.map(dev => (
                      <span key={dev} className={`px-6 py-2 bg-[#1a1b26] border ${isAnalysis ? 'border-cyan-500/30' : 'border-purple-500/30'} text-gray-200 font-mono rounded-lg shadow-lg`}>
                        {dev}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 2. GRID SLIDE --- */}
              {currentSlide.type === 'grid' && (
                <div className="h-full flex flex-col">
                  <div className="mb-8 border-b border-white/10 pb-4">
                     <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-6xl' : 'text-5xl'}`}>
                        {currentSlide.title}
                     </h2>
                     <p className={`${accentText} font-mono text-lg`}>{currentSlide.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 h-full content-center">
                     {currentSlide.gridItems?.map((item, i) => (
                        <div key={i} className={`bg-gray-800/40 p-6 rounded-xl border border-white/5 hover:${accentBorder} hover:bg-gray-800/60 transition-all duration-300 flex flex-col justify-center group`}>
                           <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                           <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                           <p className="text-gray-400 leading-relaxed whitespace-pre-line">{item.description}</p>
                        </div>
                     ))}
                  </div>
                </div>
              )}

              {/* --- 3. LIST SLIDE --- */}
              {currentSlide.type === 'list' && (
                <div className="h-full flex flex-col">
                  <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-6xl' : 'text-5xl'}`}>
                    {currentSlide.title}
                  </h2>
                  <p className={`${accentText} mb-8 font-mono`}>{currentSlide.subtitle}</p>
                  
                  <ul className={`space-y-6 text-gray-300 flex-1 overflow-y-auto slide-scroll pr-4 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                    {currentSlide.items?.map((item, idx) => (
                      <li key={idx} className="flex items-start p-4 bg-gray-800/30 rounded-lg border border-transparent hover:border-white/10 transition-all">
                         <span className={`${accentText} mr-4 font-bold`}>0{idx + 1}.</span>
                         <span dangerouslySetInnerHTML={{ __html: item }} className="text-gray-100"></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* --- 4. CODE SLIDE --- */}
              {currentSlide.type === 'code' && (
                <div className="h-full flex flex-col">
                   <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
                      <div>
                          <h2 className={`font-bold text-white ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}>
                             {currentSlide.title}
                          </h2>
                          {currentSlide.subtitle && <span className={`${accentText} font-mono text-sm mt-1 block`}>{currentSlide.subtitle}</span>}
                      </div>
                      <span className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1 rounded border border-white/10">
                         {currentSlide.language?.toUpperCase()}
                      </span>
                   </div>
                   
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-8">
                      <div className={`md:w-1/3 overflow-y-auto slide-scroll pr-2 space-y-4 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
                         {currentSlide.description?.map((desc, idx) => (
                           <div key={idx} className={`p-4 bg-gray-800/20 border-l-2 ${accentBorder} rounded-r-lg`}>
                             <p className="text-gray-300 leading-relaxed">{desc}</p>
                           </div>
                         ))}
                      </div>

                      <div className="md:w-2/3 flex flex-col rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e] shadow-2xl">
                         <div className="bg-[#252526] px-4 py-2 flex items-center gap-2 border-b border-black/20">
                           <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                           </div>
                           <span className="ml-4 text-xs text-gray-400 font-mono opacity-60">src/impl.ts</span>
                         </div>
                         <div className="flex-1 overflow-auto slide-scroll p-6 bg-[#1e1e1e]">
                           <pre className={`font-mono leading-relaxed ${isFullscreen ? 'text-lg' : 'text-sm'}`} dangerouslySetInnerHTML={{ __html: highlightedCode }}></pre>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* --- 5. TABLE SLIDE --- */}
              {currentSlide.type === 'table' && (
                <div className="h-full flex flex-col">
                  <h2 className={`font-bold text-white mb-2 ${isFullscreen ? 'text-5xl' : 'text-4xl'}`}>
                     {currentSlide.title}
                  </h2>
                  <p className={`${accentText} mb-6 font-mono`}>{currentSlide.subtitle}</p>

                   <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-gray-900/50">
                       <div className="overflow-auto h-full slide-scroll">
                           <table className="w-full text-left border-collapse">
                               <thead className="sticky top-0 bg-[#1a1b26] z-10 shadow-md">
                                   <tr>
                                       {currentSlide.tableHeaders?.map((header, idx) => (
                                           <th key={idx} className={`p-4 text-xs font-bold ${accentText} uppercase tracking-wider border-b border-white/10`}>{header}</th>
                                       ))}
                                   </tr>
                               </thead>
                               <tbody className="text-gray-300 font-mono text-sm">
                                   {currentSlide.tableRows?.map((row, rIdx) => (
                                       <tr key={rIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                           {row.map((cell, cIdx) => (
                                               <td key={cIdx} className={`p-4 ${cell.includes('PASSED') ? 'text-green-400 font-bold bg-green-900/10' : ''}`}>
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

              {/* --- 6. SIMPLE SLIDE --- */}
              {currentSlide.type === 'simple' && (
                 <div className="h-full flex flex-col justify-center items-center text-center p-8">
                    <h2 className={`font-bold mb-8 bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent ${isFullscreen ? 'text-7xl' : 'text-6xl'}`}>
                       {currentSlide.title}
                    </h2>
                    {currentSlide.content && (
                      <p className={`text-gray-300 max-w-4xl font-light leading-relaxed border-y border-white/5 py-8 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                         {currentSlide.content}
                      </p>
                    )}
                 </div>
              )}

            </div>
          </div>

          <div className="bg-black/40 border-t border-white/5 p-4 flex justify-between items-center text-xs font-mono text-gray-500 uppercase tracking-widest z-20 backdrop-blur-sm">
             <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px] ${isAnalysis ? 'bg-cyan-500 shadow-cyan-500' : 'bg-purple-500 shadow-purple-500'}`}></span>
                <span>{isAnalysis ? 'Analysis Mode' : 'Architecture Mode'}</span>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1">
                  <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="hover:text-white disabled:opacity-30 transition">PREV</button>
                  <span className={`mx-2 ${accentText}`}>
                    {String(currentSlideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
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