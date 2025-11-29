import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Trophy, TrendingUp, Users, Star, Code2, 
  Zap, Award, X, Menu, Flame, ChevronRight, Filter,
  Briefcase, Brain, Link as LinkIcon, Cloud, Palette,
  Server, Shield, Database, Smartphone, Gamepad2, Cpu,
  CheckCircle2, ChevronLeft, Terminal, Activity, Layers, Layout, Sigma,
  ShieldCheck, Search, Medal, RotateCcw, Crown
} from 'lucide-react';

// --- Types ---
interface Developer {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  bio?: string;
  total_stars_earned: number;
  followers_count: number;
  public_repos_count: number;
  dominant_language: string;
  badges: Array<{ type: string; category?: string }>;
  personas: Record<string, number>;
  is_rising_star: boolean;
  is_hall_of_fame: boolean;
  is_trending_expert: boolean;
  is_badge_holder: boolean;
  company?: string;
  is_organization?: boolean;
  velocity_score?: number;
  primary_work?: {
    repos: Array<{ name: string; stars: number }>;
  };
  language_expertise?: {
    expertise: Array<{
      language: string;
      level: string;
      repos_count: number;
    }>;
  };
}

const API_BASE = '/api';

const langColors: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', 
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d',
};

const personaConfig: Record<string, { label: string; icon: any; color: string }> = {
  ai_whisperer: { label: 'AI Whisperer', icon: Brain, color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  ml_engineer: { label: 'ML Engineer', icon: Activity, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  data_scientist: { label: 'Data Scientist', icon: Database, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  computational_scientist: { label: 'Comp. Scientist', icon: Sigma, color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  data_engineer: { label: 'Data Engineer', icon: Server, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  chain_architect: { label: 'Chain Architect', icon: LinkIcon, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  cloud_native: { label: 'Cloud Native', icon: Cloud, color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  devops_deamon: { label: 'DevOps Deamon', icon: Layers, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
  systems_architect: { label: 'Systems Architect', icon: Cpu, color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
  backend_behemoth: { label: 'Backend Behemoth', icon: Server, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  frontend_wizard: { label: 'Frontend Wizard', icon: Layout, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  ux_engineer: { label: 'UX Engineer', icon: Palette, color: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20' },
  mobile_maestro: { label: 'Mobile Maestro', icon: Smartphone, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  security_sentinel: { label: 'Security Sentinel', icon: Shield, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  game_guru: { label: 'Game Guru', icon: Gamepad2, color: 'text-lime-400 bg-lime-400/10 border-lime-400/20' },
  iot_tinkerer: { label: 'IoT Tinkerer', icon: Cpu, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  tooling_titan: { label: 'Tooling Titan', icon: Terminal, color: 'text-gray-300 bg-gray-500/10 border-gray-500/20' },
  algorithm_alchemist: { label: 'Algorithm Alchemist', icon: Code2, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  qa_automator: { label: 'QA Automator', icon: CheckCircle2, color: 'text-teal-400 bg-teal-400/10 border-teal-400/20' },
  enterprise_architect: { label: 'Enterprise Architect', icon: Briefcase, color: 'text-blue-300 bg-blue-300/10 border-blue-300/20' },
};

type ViewType = 'top' | 'rising' | 'expert' | 'badge';

function normalizeBadge(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); 
}

const formatNumber = (num: any) => {
  if (!num) return "0"
  const val = typeof num === "string" ? parseInt(num) : num
  if (val >= 1000000) return (val/1000000).toFixed(1).replace(/\.0$/, "") + "M"
  if (val >= 1000) return (val/1000).toFixed(1).replace(/\.0$/, "") + "K"
  return val.toString()
}

function getClaimToFame(dev: Developer): string {
  if (dev.primary_work?.repos?.[0]) {
    const repo = dev.primary_work.repos[0];
    return `Created ${repo.name} • ${formatNumber(repo.stars)} stars`;
  }
  if (dev.language_expertise?.expertise?.[0]) {
    const exp = dev.language_expertise.expertise[0];
    return `${exp.language} ${exp.level} • ${exp.repos_count} projects`;
  }
  if (dev.bio && dev.bio.length > 0) {
    return dev.bio.slice(0, 60) + (dev.bio.length > 60 ? '...' : '');
  }
  return `${dev.public_repos_count} public repositories`;
}

const viewThemes = {
  top: {
    bgGradient: 'from-amber-500/5 via-yellow-500/5 to-orange-500/5',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-400',
    icon: Trophy,
    metricLabel: 'Followers',
    emptyIcon: '👑',
    emptyText: 'The legends of open source',
    cardHoverGlow: 'hover:shadow-amber-500/20'
  },
  expert: {
    bgGradient: 'from-indigo-500/5 via-purple-500/5 to-pink-500/5',
    borderColor: 'border-indigo-500/30',
    accentColor: 'text-indigo-400',
    icon: Briefcase,
    metricLabel: 'Expertise',
    emptyIcon: '🎯',
    emptyText: 'Domain specialists and tech leaders',
    cardHoverGlow: 'hover:shadow-indigo-500/20'
  },
  rising: {
    bgGradient: 'from-emerald-500/5 via-cyan-500/5 to-blue-500/5',
    borderColor: 'border-emerald-500/30',
    accentColor: 'text-emerald-400',
    icon: Zap,
    metricLabel: 'Velocity',
    emptyIcon: '🚀',
    emptyText: 'Tomorrow\'s open source stars',
    cardHoverGlow: 'hover:shadow-emerald-500/20'
  },
  badge: {
    bgGradient: 'from-yellow-500/5 via-orange-500/5 to-red-500/5',
    borderColor: 'border-yellow-500/30',
    accentColor: 'text-yellow-400',
    icon: Medal,
    metricLabel: 'Followers',
    emptyIcon: '🎖️',
    emptyText: 'Award-winning community leaders',
    cardHoverGlow: 'hover:shadow-yellow-500/20'
  }
};

function DeveloperList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const personaScrollRef = useRef<HTMLDivElement>(null);
  const badgeScrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewType, setViewType] = useState<ViewType>(() => {
    const type = searchParams.get('type');
    if (type === 'rising') return 'rising';
    if (type === 'expert') return 'expert';
    if (type === 'badge') return 'badge'; 
    return 'top';
  });
  
  const [selectedLang, setSelectedLang] = useState<string | null>(() => {
    return sessionStorage.getItem(`filter_lang_${viewType}`) || null;
  });

  const [selectedPersona, setSelectedPersona] = useState<string | null>(() => {
    // CRITICAL FIX: Only restore saved persona if the view is 'expert'
    const type = searchParams.get('type');
    if (type === 'expert') {
        return sessionStorage.getItem(`filter_persona_${type}`) || null;
    }
    return null;
  });

  const [selectedBadge, setSelectedBadge] = useState<string | null>(() => {
    // RESTORE: Check session storage on load if we are in badge view
    const type = searchParams.get('type');
    if (type === 'badge') {
        return sessionStorage.getItem(`filter_badge_${type}`) || null;
    }
    return null;
  });

  const [devs, setDevs] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showBadgeLeftArrow, setShowBadgeLeftArrow] = useState(false);
  const [showBadgeRightArrow, setShowBadgeRightArrow] = useState(true);

  // --- 2. Persistence Effects ---
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_pos_dev_${viewType}`, window.scrollY.toString());
    };
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => { handleScroll(); throttleTimer = null; }, 100);
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [viewType]);

  useEffect(() => {
    // 1. Language Persistence
    if (selectedLang) sessionStorage.setItem(`filter_lang_${viewType}`, selectedLang);
    else sessionStorage.removeItem(`filter_lang_${viewType}`);

    // 2. Persona Persistence (Experts only)
    if (viewType === 'expert') {
      if (selectedPersona) sessionStorage.setItem(`filter_persona_${viewType}`, selectedPersona);
      else sessionStorage.removeItem(`filter_persona_${viewType}`);
    } else {
      sessionStorage.removeItem(`filter_persona_expert`);
    }

    // 3. Badge Persistence (Badge view only) [NEW CODE HERE]
    if (viewType === 'badge') {
      if (selectedBadge) sessionStorage.setItem(`filter_badge_${viewType}`, selectedBadge);
      else sessionStorage.removeItem(`filter_badge_${viewType}`);
    } else {
      sessionStorage.removeItem(`filter_badge_badge`);
    }

  }, [selectedLang, selectedPersona, selectedBadge, viewType]); // <--- Added selectedBadge here

  useEffect(() => {
    const typeParam = searchParams.get('type');
    let newView: ViewType = 'top';
    if (typeParam === 'rising') newView = 'rising';
    if (typeParam === 'expert') newView = 'expert';
    if (typeParam === 'badge') newView = 'badge';
    
    setViewType(newView);

    // 1. Restore Language
    const savedLang = sessionStorage.getItem(`filter_lang_${newView}`);
    
    // 2. Restore Persona
    let savedPersona: string | null = null;
    if (newView === 'expert') {
      savedPersona = sessionStorage.getItem(`filter_persona_${newView}`);
    }

    // 3. Restore Badge [NEW CODE HERE]
    let savedBadge: string | null = null;
    if (newView === 'badge') {
      savedBadge = sessionStorage.getItem(`filter_badge_${newView}`);
    }
    
    setSelectedLang(savedLang);
    setSelectedPersona(savedPersona);
    setSelectedBadge(savedBadge); // <--- Use the variable, not null
    
  }, [searchParams]);

  useLayoutEffect(() => {
    if (!isLoading && devs.length > 0) {
      const savedPosition = sessionStorage.getItem(`scroll_pos_dev_${viewType}`);
      if (savedPosition) window.scrollTo(0, parseInt(savedPosition, 10));
    }
  }, [isLoading, viewType, devs]);

  // --- 3. Data Fetching ---
  useEffect(() => {
    fetchDevelopers();
  }, [viewType, selectedLang, selectedPersona, searchQuery, selectedBadge]);

  useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [searchQuery]);

  const fetchDevelopers = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE}/developers?type=${viewType}`; 
      
      if (selectedLang) url += `&language=${encodeURIComponent(selectedLang)}`;
      if (selectedPersona) url += `&persona=${encodeURIComponent(selectedPersona)}`;
      if (selectedBadge) url += `&badge=${encodeURIComponent(selectedBadge)}`; 
      
      const res = await fetch(url);
      const json = await res.json();
      
      let filtered = json.data || [];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((dev: Developer) => 
          dev.login.toLowerCase().includes(query) ||
          dev.name?.toLowerCase().includes(query) ||
          dev.bio?.toLowerCase().includes(query)
        );
      }
      
      setDevs(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. Scroll & UI Handlers ---
  const handleScrollArrows = () => {
    if (personaScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = personaScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleBadgeScrollArrows = () => {
    if (badgeScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = badgeScrollRef.current;
      setShowBadgeLeftArrow(scrollLeft > 0);
      setShowBadgeRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const ref = personaScrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScrollArrows);
      handleScrollArrows();
      return () => ref.removeEventListener('scroll', handleScrollArrows);
    }
  }, [viewType]);

  useEffect(() => {
    const ref = badgeScrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleBadgeScrollArrows);
      handleBadgeScrollArrows();
      return () => ref.removeEventListener('scroll', handleBadgeScrollArrows);
    }
  }, [viewType]);

  const scrollPersonas = (direction: 'left' | 'right') => {
    if (personaScrollRef.current) {
      const amount = 300;
      personaScrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const scrollBadges = (direction: 'left' | 'right') => {
    if (badgeScrollRef.current) {
      const amount = 300;
      badgeScrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const handleSidebarClick = (view: string) => {
    setIsMobileMenuOpen(false);
    if (view === 'top-repos') navigate('/?view=top-repos');
    if (view === 'trending-repos') navigate('/?view=trending-repos');
    if (view === 'growing-repos') navigate('/?view=growing-repos');
    if (view === 'top-devs') { navigate('/developers?type=top'); setViewType('top'); }
    if (view === 'expert-devs') { navigate('/developers?type=expert'); setViewType('expert'); }
    if (view === 'growing-devs') { navigate('/developers?type=rising'); setViewType('rising'); }
    if (view === 'badge-devs') { navigate('/developers?type=badge'); setViewType('badge'); }
  };

  const handleHomeClick = () => {
      navigate('/');
  };

  const clearAllFilters = () => {
    setSelectedLang(null);
    setSelectedPersona(null);
    setSelectedBadge(null);
    setSearchQuery('');
  };

  const SidebarItem = ({ id, icon: Icon, label, activeId }: any) => {
    const isActive = activeId === id;
    return (
      <button
        onClick={() => handleSidebarClick(id)}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg shadow-purple-500/20 border border-white/10'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent hover:border-gray-700/50'
        }`}
      >
        <div className="flex items-center gap-3 z-10">
          <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-gray-500 group-hover:text-purple-400'}`} />
          <span className={`font-medium tracking-wide ${isActive ? 'text-white' : ''}`}>{label}</span>
        </div>
        {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
      </button>
    );
  };

  const DevSkeleton = () => (
    <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/30 flex items-center gap-6 animate-pulse">
        <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
        <div className="w-16 h-16 bg-gray-700/50 rounded-full"></div>
        <div className="flex-1 space-y-2">
            <div className="w-1/3 h-5 bg-gray-700/50 rounded"></div>
            <div className="w-1/4 h-3 bg-gray-800/50 rounded"></div>
        </div>
        <div className="flex gap-2">
            <div className="w-20 h-10 bg-gray-800/50 rounded"></div>
            <div className="w-20 h-10 bg-gray-800/50 rounded"></div>
        </div>
    </div>
  );

  const DeveloperCard = ({ 
    dev, 
    index, 
    currentView, 
    hideRank 
  }: { 
    dev: Developer; 
    index: number; 
    currentView: ViewType;
    hideRank?: boolean;
  }) => {
    const rank = index + 1;
    const theme = viewThemes[currentView];
    
    const getMetricValue = () => {
      if (currentView === 'top' || currentView === 'badge') return formatNumber(dev.followers_count);
      if (currentView === 'rising') return `+${formatNumber(Math.round(dev.velocity_score || 0))}/mo`;
      if (currentView === 'expert') return dev.language_expertise?.expertise?.length || 0;
    };

    const getMetricIcon = () => {
      if (currentView === 'top' || currentView === 'badge') return <Users className="w-4 h-4" />;
      return null;
    };

    return (
      <div 
        onClick={() => navigate(`/developer/${dev.login}`)}
        className={`group relative bg-gradient-to-br ${theme.bgGradient} backdrop-blur-md rounded-2xl p-6 border ${theme.borderColor} hover:border-opacity-100 transition-all duration-300 cursor-pointer shadow-lg ${theme.cardHoverGlow} hover:scale-[1.01]`}
      >
        {!hideRank && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-purple-400 group-hover:border-purple-500/50 transition-all">
            #{rank}
          </div>
        )}

        {(currentView === 'top' || currentView === 'badge') && (
           <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-md border border-white/5 ${theme.accentColor}`}>
              {getMetricIcon()}
              <span className="font-bold text-sm">{getMetricValue()}</span>
           </div>
        )}

        <div className="flex items-center gap-4 ml-10">
          <div className="relative flex-shrink-0">
            <img 
              src={dev.avatar_url} 
              alt={dev.login} 
              className="w-14 h-14 rounded-full border-2 border-gray-700 group-hover:border-purple-500/50 transition-colors" 
            />
            {dev.is_rising_star && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 p-1 rounded-full border-2 border-gray-900">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            )}
            {dev.is_organization && (
              <div className="absolute -bottom-1 -right-1 bg-purple-500 p-1 rounded-full border-2 border-gray-900">
                <Users className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition truncate">
                {dev.name || dev.login}
              </h3>
              <span className="text-xs text-gray-500 font-medium">@{dev.login}</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-2 line-clamp-1 group-hover:text-gray-300 transition">
              {getClaimToFame(dev)}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {currentView === 'expert' ? (
                (() => {
                  const topPersona = Object.entries(dev.personas || {})
                    .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
                  if (topPersona && topPersona[1] > 0) {
                    const [key] = topPersona;
                    const config = personaConfig[key];
                    if (config) return (<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${config.color}`}><config.icon className="w-3.5 h-3.5" />{config.label}</span>);
                  }
                  return dev.dominant_language ? (<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-gray-400 bg-gray-500/10 border-gray-500/20"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[dev.dominant_language] || '#6366f1' }} />{dev.dominant_language}</span>) : null;
                })()
              ) : currentView === 'badge' ? (
                dev.badges?.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                    <Medal className="w-3 h-3" />
                    {b.type}
                  </span>
                ))
              ) : (
                <>
                  {dev.badges && dev.badges.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      {dev.badges[0].type}
                    </span>
                  )}
                  {dev.dominant_language && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-gray-400 bg-gray-500/10 border-gray-500/20">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[dev.dominant_language] || '#6366f1' }} />
                      {dev.dominant_language}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="sm:hidden mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase font-bold">{theme.metricLabel}</span>
          <span className={`text-lg font-bold ${theme.accentColor}`}>{getMetricValue()}</span>
        </div>
      </div>
    );
  };

  const getActiveId = () => {
    if (viewType === 'expert') return 'expert-devs';
    if (viewType === 'rising') return 'growing-devs';
    if (viewType === 'badge') return 'badge-devs';
    return 'top-devs';
  };

  return (
    <div className="min-h-screen bg-[#0B0C15] text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]"></div>
      </div>

       <header className="sticky top-0 z-50 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
                 {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
               </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <button onClick={handleHomeClick} className="cursor-pointer text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">
                  Git<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Hop</span>
                </h1>
              </button>
            </div>
            <div className="text-sm font-bold text-gray-500">Developer Intelligence</div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto relative z-10">
         <aside className="hidden lg:block w-72 sticky top-24 h-[calc(100vh-6rem)] p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Repositories</h3>
              <nav className="space-y-2">
                <SidebarItem id="top-repos" icon={Star} label="Top Rated" activeId={getActiveId()} />
                <SidebarItem id="trending-repos" icon={Flame} label="Trending Now" activeId={getActiveId()} />
                <SidebarItem id="growing-repos" icon={TrendingUp} label="Fast Growing" activeId={getActiveId()} />
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Developers</h3>
              <nav className="space-y-2">
                <SidebarItem id="top-devs" icon={Users} label="Hall of Fame" activeId={getActiveId()} />
                <SidebarItem id="badge-devs" icon={Award} label="Badge Holders" activeId={getActiveId()} /> 
                <SidebarItem id="expert-devs" icon={Briefcase} label="Trending Experts" activeId={getActiveId()} />
                <SidebarItem id="growing-devs" icon={Zap} label="Rising Stars" activeId={getActiveId()} />
              </nav>
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-[#0B0C15]/95 backdrop-blur-xl pt-24 px-6 animate-in slide-in-from-left-10 duration-200">
             <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Repositories</h3>
                  <div className="space-y-2">
                    <SidebarItem id="top-repos" icon={Star} label="Top Rated" activeId={getActiveId()} />
                    <SidebarItem id="trending-repos" icon={Flame} label="Trending Now" activeId={getActiveId()} />
                    <SidebarItem id="growing-repos" icon={TrendingUp} label="Fast Growing" activeId={getActiveId()} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Developers</h3>
                  <div className="space-y-2">
                    <SidebarItem id="top-devs" icon={Users} label="Hall of Fame" activeId={getActiveId()} />
                    <SidebarItem id="badge-devs" icon={Award} label="Badge Holders" activeId={getActiveId()} />
                    <SidebarItem id="expert-devs" icon={Briefcase} label="Trending Experts" activeId={getActiveId()} />
                    <SidebarItem id="growing-devs" icon={Zap} label="Rising Stars" activeId={getActiveId()} />
                  </div>
                </div>
             </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 py-8 min-w-0">
             <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            {viewType === 'top' && <Trophy className="w-8 h-8 text-yellow-500" />}
                            {viewType === 'expert' && <Briefcase className="w-8 h-8 text-blue-500" />}
                            {viewType === 'rising' && <Zap className="w-8 h-8 text-orange-500" />}
                            {viewType === 'badge' && <Award className="w-8 h-8 text-red-500" />} 
                            
                            {viewType === 'top' && 'Global Hall of Fame'}
                            {viewType === 'expert' && 'Trending Experts'}
                            {viewType === 'rising' && 'Rising Stars'}
                            {viewType === 'badge' && 'Community Leaders'}
                        </h1>
                        <p className="text-gray-400">
                            {viewType === 'top' && 'The most influential developers in open source history.'}
                            {viewType === 'expert' && 'Leaders in trending domains (AI, Rust, Web3).'}
                            {viewType === 'rising' && 'High-velocity talent < 2 years in the game.'}
                            {viewType === 'badge' && 'Developers recognized by major tech organizations.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-12 pr-12 py-4 bg-gray-900/60 border-2 border-white/10 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-base font-medium shadow-lg backdrop-blur-sm"
                        placeholder={`Search ${viewType === 'top' ? 'legends' : viewType === 'expert' ? 'experts' : viewType === 'badge' ? 'badge holders' : 'rising stars'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {(selectedLang || selectedPersona || selectedBadge) && (
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center justify-center px-6 py-4 rounded-2xl border-2 border-white/10 bg-gray-900/60 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-gray-400 font-medium transition-all group"
                      >
                        <RotateCcw className="w-5 h-5 mr-2 group-hover:-rotate-180 transition-transform duration-500" />
                        Clear Filters
                      </button>
                    )}
                  </div>

                  {/* Tech Stack Filter (with Result Count) */}
                  <div className="flex items-center gap-4">

                    {/* Filter Scroll Area */}
                    <div className="relative group flex-1 min-w-0"> {/* min-w-0 is critical for scroll within flex */}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          <div className="flex items-center gap-2 mr-2 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap px-2 border-l border-white/10 ml-2 pl-4">
                             Stack:
                          </div>
                          {['Rust', 'TypeScript', 'Python', 'Go', 'C++', 'Java', 'Kotlin', 'Swift'].map(lang => (
                          <button
                              key={lang}
                              onClick={() => setSelectedLang(selectedLang === lang ? null : lang)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                              selectedLang === lang
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                  : 'bg-gray-800/50 text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-gray-800'
                              }`}
                          >
                              {lang}
                          </button>
                          ))}
                      </div>
                    </div>

                    {/* SIDE TEXT: Result Count */}
                    <div className="shrink-0 pl-1">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                         Found <span className="text-white">{formatNumber(devs.length)}</span> Devs
                       </span>
                    </div>
                  </div>

                  {/* ELEGANT PERSONA FILTER (Visible in Expert View) */}
                  {viewType === 'expert' && (
                    <div className="relative group animate-in slide-in-from-top-4 fade-in duration-500">
                        <div className={`absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-[#0B0C15] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#0B0C15] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />
                        
                        {showLeftArrow && (
                          <button 
                            onClick={() => scrollPersonas('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-gray-800/80 backdrop-blur-md border border-white/10 text-white shadow-lg hover:bg-gray-700 transition-all -ml-2"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {showRightArrow && (
                          <button 
                            onClick={() => scrollPersonas('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-gray-800/80 backdrop-blur-md border border-white/10 text-white shadow-lg hover:bg-gray-700 transition-all -mr-2"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}

                        <div 
                          ref={personaScrollRef}
                          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 snap-x"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
                        >
                            <div className="flex items-center gap-2 mr-2 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky left-0 z-0">
                                <Brain className="w-4 h-4 text-purple-400" /> Role:
                            </div>
                            
                            {Object.entries(personaConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedPersona(selectedPersona === key ? null : key)}
                                className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                                selectedPersona === key
                                    ? `${config.color.replace('bg-opacity-10', 'bg-opacity-20')} border-opacity-50 shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-[1.02]`
                                    : 'bg-gray-800/30 text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-gray-800/60'
                                }`}
                            >
                                <div className={`p-1 rounded-md ${selectedPersona === key ? 'bg-white/10' : 'bg-black/20'}`}>
                                  <config.icon className="w-3.5 h-3.5" />
                                </div>
                                {config.label}
                            </button>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* BADGE FILTER (Visible in Badge View) */}
                  {viewType === 'badge' && (
                    <div className="relative group animate-in slide-in-from-top-4 fade-in duration-500">
                      <div className={`absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-[#0B0C15] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showBadgeLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
                      <div className={`absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#0B0C15] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showBadgeRightArrow ? 'opacity-100' : 'opacity-0'}`} />
                      
                      {showBadgeLeftArrow && (
                        <button 
                          onClick={() => scrollBadges('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-gray-800/80 backdrop-blur-md border border-white/10 text-white shadow-lg hover:bg-gray-700 transition-all -ml-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}
                      {showBadgeRightArrow && (
                        <button 
                          onClick={() => scrollBadges('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-gray-800/80 backdrop-blur-md border border-white/10 text-white shadow-lg hover:bg-gray-700 transition-all -mr-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      <div 
                        ref={badgeScrollRef}
                        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
                      >
                          <div className="flex items-center gap-2 mr-2 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky left-0 z-0">
                              <Award className="w-4 h-4 text-yellow-400" /> Filter:
                          </div>
                          
                          {['GDE', 'GitHub Star', 'MVP', 'AWS Hero', 'Docker Captain','CKA', 'AWS Solutions Architect', 'CISSP', 'PSM', 'CCIE'].map(badge => (
                          <button
                              key={badge}
                              onClick={() => setSelectedBadge(selectedBadge === badge ? null : badge)}
                              className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                              selectedBadge === badge
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-[1.02]'
                                  : 'bg-gray-800/30 text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-gray-800/60'
                              }`}
                          >
                              {badge}
                          </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
             </div>

            {isLoading ? (
              <div className="space-y-4">
                <DevSkeleton />
                <DevSkeleton />
                <DevSkeleton />
              </div>
            ) : devs.length > 0 ? (
              <div className="space-y-4 pb-12 animate-in fade-in duration-500">
                {devs.map((dev, idx) => (
                  <DeveloperCard 
                    key={dev.id} 
                    dev={dev} 
                    index={idx} 
                    currentView={viewType}
                    hideRank={!!(selectedLang || selectedPersona || selectedBadge)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-white/5 border-dashed">
                <div className="text-6xl mb-4">{viewThemes[viewType].emptyIcon}</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">No developers found</h3>
                <p className="text-gray-600 mb-6">{viewThemes[viewType].emptyText}</p>
                
                {(selectedLang || selectedPersona || selectedBadge) && (
                  <div className="flex flex-col gap-3 items-center">
                    <p className="text-sm text-gray-500">Try these alternatives:</p>
                    <div className="flex gap-2">
                      {selectedLang && (
                        <button 
                          onClick={() => setSelectedLang(null)}
                          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-bold transition-colors"
                        >
                          View All {viewType === 'top' ? 'Legends' : viewType === 'expert' ? 'Experts' : viewType === 'badge' ? 'Badge Holders' : 'Stars'}
                        </button>
                      )}
                      {selectedPersona && viewType === 'expert' && (
                        <button 
                          onClick={() => setSelectedPersona(null)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-bold transition-colors"
                        >
                          All Specializations
                        </button>
                      )}
                      {selectedBadge && viewType === 'badge' && (
                        <button 
                          onClick={() => setSelectedBadge(null)}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg text-sm font-bold transition-colors"
                        >
                          All Badge Holders
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

export default DeveloperList;