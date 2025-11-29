import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, BookOpen, AlertTriangle } from 'lucide-react';

interface ReadmeViewerProps {
  content?: string;
  repoFullName?: string; // Used to resolve relative image paths (e.g., 'owner/repo')
}

// --- Lightweight Custom Markdown Renderer (No Dependencies) ---
const SimpleMarkdown = ({ text, repoFullName }: { text: string; repoFullName?: string }) => {
  if (!text) return null;

  // Use 'main' as the default branch if the repo is present
  const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${repoFullName}/main/`;

  // Combined Regex for inline tokens (Images, Links, Bold, Code).
  // We use non-capturing groups (?:...) where possible, and ensure the split is clean.
  // The split() method includes the capturing groups in the result array, so we must rely on
  // the start of the string to identify the token type reliably.
  const INLINE_TOKEN_REGEX = /(\!\[.*?\]\s*\([^\)]+\)|\[.*?\]\s*\([^\)]+\)|\*\*.*?\*\*|`.*?`)/g;


  // Helper for basic inline formatting (Bold, Code, Link, Image)
  const parseInline = (line: string, keyPrefix: string) => {
    // Split the line by the regex, capturing the matched tokens (Images, Links, Bold, Code)
    const parts = line.split(INLINE_TOKEN_REGEX).filter(p => p !== '');
    
    return parts.map((part, index) => {
      // CRITICAL FIX: Add check for undefined/null part content
      if (!part) return null;
      
      const key = `${keyPrefix}-inline-${index}`;

      // 1. Image (Detects ![]() )
      if (part.startsWith('![')) {
        // User requested to hide images completely
        return null;
      }

      // 2. Link (Detects []() )
      if (part.startsWith('[')) {
        const match = part.match(/\[(.*?)\]\s*\(([^\)]+)\)/); // Match: [label](url)
        if (match) {
           const [, label, url] = match;
           
           // SECURITY FIX: Prevent rendering malicious external scripts/iframes
           if (url.toLowerCase().startsWith('javascript:')) {
              return <span key={key} className="text-red-400">**UNSAFE LINK REMOVED**</span>;
           }

           return <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{label}</a>;
        }
      }
      
      // 3. Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      
      // 4. Inline Code
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={key} className="bg-[#161b22] text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      }

      return part; // Return regular text
    });
  };

  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let listItems: string[] = [];

  // Helper to render UL (Unordered List)
  const renderList = (currentElements: any[], items: string[]) => {
    currentElements.push(
      <ul key={`list-${currentElements.length}`} className="list-disc list-outside ml-6 mb-4 text-gray-300 space-y-1">
        {items.map((item, idx) => <li key={idx}>{parseInline(item, `li-${idx}`)}</li>)}
      </ul>
    );
  };
  
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Handle Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-[#161b22] border border-gray-700/50 rounded-md p-4 overflow-x-auto my-4 text-sm text-gray-300 font-mono">
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        if (listItems.length > 0) { renderList(elements, listItems); listItems = []; }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // 2. Handle Headers
    if (line.startsWith('#')) {
      if (listItems.length > 0) { renderList(elements, listItems); listItems = []; }
      const level = line.match(/^#+/)?.[0].length || 1;
      const content = line.replace(/^#+\s*/, '');
      const sizes = { 1: 'text-2xl border-b border-gray-800 pb-2', 2: 'text-xl border-b border-gray-800 pb-2', 3: 'text-lg', 4: 'text-base' };
      const className = `font-bold text-gray-100 mt-6 mb-3 ${sizes[level as keyof typeof sizes] || 'text-base'}`;
      
      elements.push(<h3 key={`h-${i}`} className={className}>{content}</h3>);
      continue;
    }

    // 3. Handle Lists
    if (line.trim().match(/^[-*]\s/)) {
      listItems.push(line.replace(/^[-*]\s/, ''));
      continue;
    } else if (listItems.length > 0) {
      renderList(elements, listItems);
      listItems = [];
    }

    // 4. Handle Blockquotes (Detects >)
    if (line.trim().startsWith('>')) {
      // Simple Blockquote rendering
      const content = line.replace(/^>\s*/, '');
      elements.push(
          <blockquote key={`bq-${i}`} className="border-l-4 border-purple-500 bg-purple-500/5 py-2 px-4 my-4 rounded-r-lg text-gray-400">
             {parseInline(content, `bq-${i}`)}
          </blockquote>
      );
      continue;
    }

    // 5. Handle Empty Lines (ignore)
    if (!line.trim()) continue;
    
    // 6. Handle Paragraphs & Inline elements (like images/links/bold text)
    const processedLine = parseInline(line, `p-${i}`);

    elements.push(<p key={`p-${i}`} className="text-gray-300 leading-relaxed mb-4">{processedLine}</p>);
  }

  // Flush remaining list
  if (listItems.length > 0) renderList(elements, listItems);

  return <div>{elements}</div>;
};


export default function ReadmeViewer({ content, repoFullName }: ReadmeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) {
    return (
      <div className="mt-6 p-8 border border-dashed border-gray-700/50 rounded-xl bg-gray-900/20 text-center">
        <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No README available for this repository.</p>
      </div>
    );
  }

  // Warning for External Content (Charts, Badges, etc.)
  // We look for external URLs that are not hosted by GitHub itself
  const hasExternalContent = content.match(/<img[^>]+src=["'](https?:\/\/(?!raw\.githubusercontent\.com|user-images\.githubusercontent\.com|placehold\.co)[^"']+)["']/i) || content.match(/<iframe|<script/i);


  return (
    <div className="mt-8 group animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header Bar (GitHub Style) */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border border-gray-700/50 rounded-t-xl border-b-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gray-800 rounded-lg">
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-200 tracking-wide">
            README.md
          </h3>
        </div>
        {repoFullName && (
          <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
            {repoFullName}
          </span>
        )}
      </div>

      {/* WARNING BANNER */}
      {hasExternalContent && (
        <div className="px-4 py-2 bg-yellow-900/40 text-yellow-300 text-xs font-medium border-x border-yellow-500/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            External content (e.g., charts, badges) may not render correctly due to security restrictions.
        </div>
      )}


      {/* 2. Content Container */}
      <div className={`relative border border-gray-700/50 rounded-b-xl bg-[#0d1117] transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-none' : 'max-h-[600px] overflow-hidden'
      }`}>
        <div className="px-6 py-8 sm:px-8 sm:py-10 text-sm">
           <SimpleMarkdown text={content} repoFullName={repoFullName} />
        </div>

        {/* 3. Gradient Fade (Only visible when collapsed) */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/90 to-transparent pointer-events-none" />
        )}
      </div>

      {/* 4. Expansion Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group/btn w-full mt-[-1px] py-4 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-[#161b22] border border-gray-700/50 rounded-b-xl border-t-0 hover:bg-gray-800 transition-all shadow-lg"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4 text-purple-400 group-hover/btn:-translate-y-1 transition-transform" /> 
            Collapse Overview
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 text-purple-400 group-hover/btn:translate-y-1 transition-transform" /> 
            Read Full Documentation
          </>
        )}
      </button>
    </div>
  );
}