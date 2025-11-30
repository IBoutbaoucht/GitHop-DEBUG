import { useState, useEffect, useRef, useMemo } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// --- TYPES ---
type SlideType = 'title' | 'simple' | 'list' | 'image' | 'code';

interface Quote {
  text: string;
  author: string;
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
}

// --- DATA: GITHOP DESIGN PATTERNS ---
const slides: SlideData[] = [
  {
    type: 'title',
    title: 'GitHop',
    subtitle: 'Design Patterns & Architecture',
    developers: ['Oussama Yaqdane', 'Mohamed Taib Lkanit']
  },
  {
    type: 'simple',
    title: 'Architecture Overview',
    content: 'A deep dive into the structural, behavioral, and creational patterns that power GitHop.'
  },
  {
    type: 'code',
    title: 'Singleton Pattern',
    language: 'typescript',
    description: [
      'Type: Creational',
      'Ensures a class has only one instance and provides a global point of access.',
      'Used for GitHubService and Database Pool to prevent resource exhaustion.'
    ],
    code: `// src/services/githubService.ts
class GitHubService {
  // ... Implementation ...
}
// THE SINGLETON INSTANTIATION
export default new GitHubService(); 

// src/db.ts
const pool = new Pool({ ... });
// THE SINGLETON EXPORT
export default pool;`
  },
  {
    type: 'code',
    title: 'Strategy Pattern',
    language: 'typescript',
    description: [
      'Type: Behavioral',
      'Defines a family of algorithms and makes them interchangeable.',
      'The Context (WorkerService) dynamically chooses between full refresh vs partial update strategies.'
    ],
    code: `// THE STRATEGIES (Different Algorithms)
import readmeWorker from "./fetchings/readmeWorker";
import commitWorker from "./fetchings/commitWorker";

// THE CONTEXT (src/services/workerService.ts)
public async runAllJobs(forceUpdateAll = false): Promise<void> {
    await this.hydrateStubs(); // Strategy 1
    
    if (forceUpdateAll) {
        await this.updateAllRecentCommits(); // Strategy 2
        await this.updateAllCommitActivity(); // Strategy 3
    } else {
        await this.updateMissingRecentCommits(); // Strategy 2 (Variant)
    }
}`
  },
  {
    type: 'code',
    title: 'Adapter Pattern',
    language: 'typescript',
    description: [
      'Type: Structural',
      'Converts the interface of a class into another interface the client expects.',
      'Translates raw BigQuery data (star_count) into our internal domain model (stargazers_count).'
    ],
    code: `// src/services/newService.ts
public async syncTrendsFromGHArchive(days: number, tag: string): Promise<void> {
    // 1. THE ADAPTEE (Raw BigQuery Data)
    const [rows] = await job.getQueryResults();

    // 2. THE ADAPTER LOGIC (Transform)
    const rawRepos = rows.map((row: any) => ({
        full_name: row.full_name,
        // Mapping 'star_count' to 'stargazers_count'
        stargazers_count: row.star_count 
    }));

    // 3. TARGET INTERFACE (DB Saver)
    await this.fetchDetailsAndSave(rawRepos, tag);
}`
  },
  {
    type: 'code',
    title: 'Observer Pattern',
    language: 'typescript',
    description: [
      'Type: Behavioral',
      'Defines a subscription mechanism to notify multiple objects about events.',
      'The logging system subscribes to database states (connect/error) for real-time visibility.'
    ],
    code: `// src/db.ts

// THE SUBJECT (The Database Pool)
const pool = new Pool({ ... });

// THE OBSERVERS (Event Listeners)
pool.on('connect', () => {
  console.log("✅ Database client connected");
});

pool.on('error', (err) => {
  console.error("❌ Unexpected error on idle client", err);
});`
  },
  {
    type: 'code',
    title: 'Chain of Responsibility',
    language: 'typescript',
    description: [
      'Type: Behavioral',
      'Passes a request along a chain of handlers.',
      'AI Service tries the fast "Flash" model first. If it fails, it falls back to the robust "Pro" model.'
    ],
    code: `// src/services/aiServices/aiService.ts
try {
    // HANDLER 1: Fast/Cheap Model
    return await tryModel("gemini-2.0-flash");
} catch (error: any) {
    console.warn(\`⚠️ Flash failed... Retrying...\`);
    
    try {
        // HANDLER 2: Fallback Model
        return await tryModel("gemini-pro");
    } catch (fallbackError: any) {
        console.error("❌ All AI models failed.");
        return "Summary unavailable...";
    }
}`
  },
  {
    type: 'code',
    title: 'Builder Pattern',
    language: 'typescript',
    description: [
      'Type: Creational',
      'Constructs complex objects (SQL Queries) step-by-step.',
      'Dynamically appends WHERE clauses based on user intent rather than using one monolithic query.'
    ],
    code: `// src/services/aiServices/searchAgentService.ts

// 1. BASE
let sql = \`SELECT ... FROM repositories WHERE 1=1\`;
const params: any[] = [JSON.stringify(queryEmbedding)];

// 2. STEP-BY-STEP CONSTRUCTION
if (intent.filters.language) {
    sql += \` AND language ILIKE $\${idx}\`;
    params.push(intent.filters.language);
}
if (intent.filters.minStars) {
    sql += \` AND stars_count >= $\${idx}\`;
    params.push(intent.filters.minStars);
}

// 3. FINALIZE
sql += \` ORDER BY similarity DESC LIMIT 30\`;`
  },
  {
    type: 'code',
    title: 'Template Method',
    language: 'typescript',
    description: [
      'Type: Behavioral',
      'Defines the skeleton of an algorithm in a method, deferring some steps to subclasses or parameters.',
      'Weekly and Monthly syncs reuse the same core logic structure.'
    ],
    code: `// src/services/newService.ts

// THE TEMPLATE (The Skeleton)
public async syncTrends(days: number, tag: string): Promise<void> {
    // Step 1: Calculate Date Range
    // Step 2: Query BigQuery
    // Step 3: Enrich and Save Data
}

// THE IMPLEMENTATIONS
public async syncWeekly() { 
    await this.syncTrends(7, 'trending_weekly'); 
}
public async syncMonthly() { 
    await this.syncTrends(30, 'trending_monthly'); 
}`
  },
  {
    type: 'code',
    title: 'Facade Pattern',
    language: 'typescript',
    description: [
      'Type: Structural',
      'Provides a simplified interface to a complex system.',
      'WorkerService hides the complexity of managing 4 different worker types, hydration, and update modes.'
    ],
    code: `// src/services/workerService.ts

// THE FACADE INTERFACE
public async runAllJobs(forceUpdateAll = false): Promise<void> {
    console.log(\`🚀 Starting ALL background jobs...\`);
    
    // Complex logic hidden behind one method call
    await this.hydrateStubs();
    
    if (forceUpdateAll) {
        await this.updateAllRecentCommits();
        await this.updateAllContributors();
    }
    // ...
}`
  },
  {
    type: 'simple',
    title: 'Summary',
    content: 'Robust Architecture = Scalable Software. Thank you.'
  }
];

function Slides() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];
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

  // --- RENDER ---

  return (
    <>
      <style>{`
        .code-scroll::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .code-scroll::-webkit-scrollbar-track {
          background: #1e2127; 
        }
        .code-scroll::-webkit-scrollbar-thumb {
          background: #2C2F33;
          border-radius: 2px;
        }
        .code-scroll::-webkit-scrollbar-thumb:hover {
          background: #7A0F13; 
        }
        .hljs {
          background: transparent !important;
        }
        .villain-card {
          background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeSlide 0.3s ease-out forwards;
        }
      `}</style>

      {/* MAIN CONTAINER */}
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 font-sans text-[#BFC2C7]">
        
        <div 
          ref={containerRef}
          className={`bg-[#0A0A0A] overflow-hidden flex flex-col villain-card transition-all duration-300 ${
            isFullscreen 
              ? 'w-full h-full' 
              : 'w-full max-w-6xl aspect-video border border-[#7A0F13] shadow-[0_0_40px_rgba(193,18,31,0.15)] rounded-sm relative'
          }`}
        >
          {/* Progress Bar */}
          <div className="h-1.5 bg-[#2C2F33] w-full shrink-0">
            <div 
              className="h-full bg-[#C1121F] shadow-[0_0_10px_#C1121F] transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Slide Content */}
          <div className="flex-1 p-12 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#0e0e0e] to-[#0A0A0A]">
            
            <div key={currentSlideIndex} className="h-full flex flex-col w-full animate-fade-in">
              
              {/* === TITLE === */}
              {currentSlide.type === 'title' && (
                <div className="h-full flex flex-col justify-center items-center text-center">
                  <h1 className={`font-bold text-[#C1121F] mb-6 tracking-tight drop-shadow-md uppercase font-mono transition-all duration-300 ${
                    isFullscreen ? 'text-9xl' : 'text-7xl'
                  }`}>
                    {currentSlide.title}
                  </h1>
                  <h2 className={`text-[#D4AF37] mb-12 font-light tracking-widest uppercase border-b border-[#7A0F13] pb-2 transition-all duration-300 ${
                    isFullscreen ? 'text-4xl' : 'text-2xl'
                  }`}>
                    {currentSlide.subtitle}
                  </h2>
                  <div className="flex gap-6">
                    {currentSlide.developers?.map(dev => (
                      <span key={dev} className={`px-6 py-2 bg-[#1a1a1a] border border-[#7A0F13] text-[#BFC2C7] rounded hover:bg-[#7A0F13] hover:text-white transition-all duration-300 cursor-default ${
                        isFullscreen ? 'text-2xl' : 'text-base'
                      }`}>
                        {dev}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* === LIST === */}
              {currentSlide.type === 'list' && (
                <div className="h-full flex flex-col">
                  <h2 className={`font-bold text-[#D4AF37] mb-8 border-b border-[#2C2F33] pb-4 uppercase tracking-wider transition-all duration-300 ${
                    isFullscreen ? 'text-6xl' : 'text-4xl'
                  }`}>
                    {currentSlide.title}
                  </h2>
                  <ul className={`space-y-4 text-[#BFC2C7] flex-1 overflow-y-auto transition-all duration-300 ${
                    isFullscreen ? 'text-3xl' : 'text-xl'
                  }`}>
                    {currentSlide.items?.map((item, idx) => (
                      <li key={idx} className="flex items-start group">
                         <span className="text-[#C1121F] mr-4 transition-transform group-hover:translate-x-1">➤</span>
                         <span 
                           dangerouslySetInnerHTML={{ __html: item }} 
                           className="group-hover:text-white transition-colors"
                         ></span>
                      </li>
                    ))}
                  </ul>
                  {currentSlide.quote && (
                    <div className={`mt-8 p-6 bg-[#0f0f0f] border-l-4 border-[#C1121F] italic text-[#BFC2C7] rounded-r shadow-lg transition-all duration-300 ${
                      isFullscreen ? 'text-2xl' : 'text-base'
                    }`}>
                       <span className="text-[#7A0F13] text-2xl mr-2">"</span>
                       {currentSlide.quote.text}
                       <span className="text-[#7A0F13] text-2xl ml-1">"</span>
                       <div className={`mt-3 font-bold not-italic text-[#D4AF37] uppercase tracking-wide flex items-center gap-2 ${
                         isFullscreen ? 'text-lg' : 'text-sm'
                       }`}>
                          <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
                          {currentSlide.quote.author}
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* === CODE === */}
              {currentSlide.type === 'code' && (
                <div className="h-full flex flex-col">
                   <div className="flex justify-between items-end border-b border-[#2C2F33] pb-4 mb-6">
                      <h2 className={`font-bold text-[#D4AF37] uppercase tracking-wide transition-all duration-300 ${
                        isFullscreen ? 'text-5xl' : 'text-3xl'
                      }`}>
                         {currentSlide.title}
                      </h2>
                      <span className={`text-[#7A0F13] font-mono border border-[#7A0F13] px-2 py-1 rounded ${
                        isFullscreen ? 'text-base' : 'text-xs'
                      }`}>
                         LANG: {currentSlide.language || 'AUTO'}
                      </span>
                   </div>
                   
                   <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-8">
                      <div className={`md:w-5/12 overflow-y-auto text-[#BFC2C7] space-y-4 pr-2 transition-all duration-300 ${
                        isFullscreen ? 'text-2xl' : 'text-lg'
                      }`}>
                         {currentSlide.description?.map((desc, idx) => (
                           <p key={idx} className="leading-relaxed border-l-2 border-[#2C2F33] pl-4 hover:border-[#C1121F] transition-colors">
                             {desc}
                           </p>
                         ))}
                      </div>

                      <div className="md:w-7/12 bg-[#1e2127] rounded border border-[#2C2F33] p-1 overflow-hidden shadow-inner flex flex-col">
                         {/* Header */}
                         <div className="bg-[#15171b] px-3 py-2 flex gap-2 border-b border-[#2C2F33]">
                           <div className="w-3 h-3 rounded-full bg-[#C1121F]"></div>
                           <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                           <div className="w-3 h-3 rounded-full bg-[#2C2F33]"></div>
                         </div>
                         <div className="overflow-auto code-scroll flex-1 p-4">
                           <pre 
                             className={`hljs bg-transparent font-mono whitespace-pre !p-0 transition-all duration-300 ${
                               isFullscreen ? 'text-lg' : 'text-sm'
                             }`}
                             dangerouslySetInnerHTML={{ __html: highlightedCode }}
                           ></pre>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* === IMAGE === */}
              {currentSlide.type === 'image' && (
                 <div className="h-full flex flex-col">
                    <h2 className={`font-bold text-[#D4AF37] mb-6 border-b border-[#2C2F33] pb-4 uppercase transition-all duration-300 ${
                      isFullscreen ? 'text-5xl' : 'text-3xl'
                    }`}>
                       {currentSlide.title}
                    </h2>
                    <div className="flex-1 flex items-center justify-center bg-[#050505] rounded border border-[#2C2F33] relative group">
                       <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C1121F]"></div>
                       <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C1121F]"></div>
                       
                       <div className="text-center w-full h-full flex items-center justify-center p-8">
                          <img 
                            src={currentSlide.imageSrc} 
                            alt={currentSlide.title}
                            className="max-h-[50vh] max-w-full object-contain shadow-2xl rounded-sm border border-[#2C2F33] group-hover:scale-[1.02] transition-transform duration-500"
                          />
                       </div>
                    </div>
                 </div>
              )}

              {/* === SIMPLE === */}
              {currentSlide.type === 'simple' && (
                 <div className="h-full flex flex-col justify-center items-center text-center p-12">
                    <h2 className={`font-bold text-[#C1121F] mb-12 uppercase tracking-tight drop-shadow-[0_2px_10px_rgba(193,18,31,0.5)] transition-all duration-300 ${
                      isFullscreen ? 'text-8xl' : 'text-6xl'
                    }`}>
                       {currentSlide.title}
                    </h2>
                    {currentSlide.content && (
                      <p className={`text-[#BFC2C7] max-w-4xl font-light leading-relaxed border-t border-b border-[#2C2F33] py-8 transition-all duration-300 ${
                        isFullscreen ? 'text-5xl' : 'text-3xl'
                      }`}>
                         {currentSlide.content}
                      </p>
                    )}
                 </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-[#0f0f0f] border-t border-[#2C2F33] p-4 flex justify-between items-center text-[#757575] text-sm font-mono shrink-0">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#C1121F] rounded-full animate-pulse"></span>
                <span className="uppercase tracking-widest text-[#BFC2C7]">GITHOP // SYSTEM</span>
             </div>
             
             <div className="flex gap-4 items-center">
                <button 
                  onClick={toggleFullscreen} 
                  className="p-2 rounded hover:text-[#D4AF37] transition-colors duration-200" 
                  title="Toggle Fullscreen (F)"
                >
                   {!isFullscreen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                   )}
                </button>

                <button 
                  onClick={prevSlide} 
                  disabled={currentSlideIndex === 0}
                  className="p-2 rounded hover:text-[#D4AF37] disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-200"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                   </svg>
                </button>
                
                <span className="text-[#D4AF37]">
                  {currentSlideIndex + 1} <span className="text-[#2C2F33]">/</span> {slides.length}
                </span>
                
                <button 
                  onClick={nextSlide} 
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-2 rounded hover:text-[#D4AF37] disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-200"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                   </svg>
                </button>
             </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Slides;