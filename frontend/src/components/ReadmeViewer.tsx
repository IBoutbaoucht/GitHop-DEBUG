import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, BookOpen, AlertTriangle, ExternalLink } from 'lucide-react';

interface ReadmeViewerProps {
  content?: string;
  repoFullName?: string; // Used to resolve relative image paths (e.g., 'owner/repo')
}

// --- Lightweight Custom Markdown Renderer (No Dependencies) ---
const SimpleMarkdown = ({ text, repoFullName }: { text: string; repoFullName?: string }) => {
  if (!text) return null;

  // Use 'main' as the default branch if the repo is present
  // Fallback to empty string if undefined to prevent https://github.com/undefined
  const safeRepoName = repoFullName || '';
  const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${safeRepoName}/main/`;

  // Helper for basic inline formatting (Bold, Code, Link, Image)
  const parseInline = (line: string, keyPrefix: string) => {
    // 1. COMPLEX REGEX:
    // Group 1: Linked Images [![alt](img)](url)  <-- We want to SHOW these
    // Group 2: Standalone Images ![alt](img)     <-- We want to SHOW these
    // Group 3: Regular Links [text](url)          <-- We want to SHOW these
    // Group 4: Bold **text**
    // Group 5: Code `text`
    const regex = /(!?\[.*?\]\(.*?\)|\[!\[.*?\]\(.*?\)\]\(.*?\))|(\*\*.*?\*\*)|(`.*?`)/g;
    
    // Split and filter empty strings
    const parts = line.split(regex).filter(p => p !== undefined && p !== '');
    
    return parts.map((part, index) => {
      const key = `${keyPrefix}-part-${index}`;

      // A. Check for Linked Image: [![alt](src)](url)
      if (part.startsWith('[![') && part.includes('](') && part.endsWith(')')) {
         const match = part.match(/\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)/);
         if (match) {
            const [, alt, imgSrc, linkUrl] = match;
            let finalImgSrc = imgSrc.trim();
            if (safeRepoName && !finalImgSrc.startsWith('http')) {
               finalImgSrc = `${GITHUB_RAW_URL}${finalImgSrc.replace(/^\//, '')}`;
            }
            return (
               <a key={key} href={linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block my-2">
                  <img 
                    src={finalImgSrc} 
                    alt={alt} 
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-700/50 hover:opacity-90 transition-opacity" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
               </a>
            );
         }
      }

      // B. Check for Standalone Image: ![alt](src)
      if (part.startsWith('![') && part.includes('](') && part.endsWith(')')) {
         const match = part.match(/!\[(.*?)\]\((.*?)\)/);
         if (match) {
           const [, alt, rawSrc] = match;
           let src = rawSrc.trim();

           // Handle relative paths for images
           if (safeRepoName && !src.startsWith('http')) {
             src = `${GITHUB_RAW_URL}${src.replace(/^\//, '')}`;
           }

           return (
             <img 
               key={key} 
               src={src} 
               alt={alt || "Markdown Image"} 
               className="max-w-full h-auto rounded-xl shadow-lg my-4 border border-gray-700/50" 
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.style.display = 'none'; // Hide if fails to load
               }}
             />
           );
         }
      }

      // C. Process remaining text (Links, Bold, Code, Plain)
      return parseTextContent(part, key);
    });
  };

  // Helper to parse non-image text for Links, Bold, Code
  const parseTextContent = (text: string, baseKey: string) => {
    // Check for standard Link: [Label](Url)
    if (text.startsWith('[') && text.includes('](') && text.endsWith(')')) {
        const match = text.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, label, url] = match;
          
          // Double-check: If label looks like an image markdown, ignore it (handled above)
          if (label.startsWith('![')) return null;

          // Security check
          if (url.toLowerCase().startsWith('javascript:')) {
              return <span key={baseKey} className="text-red-400">**UNSAFE LINK**</span>;
          }
          return <a key={baseKey} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{label}</a>;
        }
    }

    // Check for Bold: **text**
    if (text.startsWith('**') && text.endsWith('**')) {
      return <strong key={baseKey} className="text-white font-bold">{text.slice(2, -2)}</strong>;
    }

    // Check for Code: `text`
    if (text.startsWith('`') && text.endsWith('`')) {
      return <code key={baseKey} className="bg-[#161b22] text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">{text.slice(1, -1)}</code>;
    }

    // Plain Text
    return <span key={baseKey}>{text}</span>;
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
    // We wrap inline parsing in a fragment or array to allow null returns (hidden images)
    elements.push(<p key={`p-${i}`} className="text-gray-300 leading-relaxed mb-4">{parseInline(line, `p-${i}`)}</p>);
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

  // Check if content is truncated (backend limit is 10000 chars)
  const isTruncated = content.length >= 10000;

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
           
           {/* TRUNCATED CONTENT MESSAGE */}
           <div className="mt-8 pt-6 border-t border-white/10 text-center">
              {isTruncated && <p className="text-gray-400 mb-2">... content truncated for performance ...</p>}
              
              {/* Corrected Link Handling */}
              {repoFullName && (
                <a 
                  href={`https://github.com/${repoFullName}#readme`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold hover:underline"
                >
                  Read full documentation on GitHub <ExternalLink className="w-3 h-3" />
                </a>
              )}
           </div>
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