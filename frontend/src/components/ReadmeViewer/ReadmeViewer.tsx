// src/components/ReadmeViewer.tsx
import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, BookOpen, AlertTriangle, ExternalLink } from "lucide-react";
import MarkdownEngine from "./MarkdownEngine";

interface ReadmeViewerProps {
  content?: string;
  repoFullName?: string;
}

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

  // Warning for external content (images not hosted on GitHub, scripts, iframes)
  const hasExternalContent =
    content.match(/<img[^>]+src=["'](https?:\/\/(?!raw\.githubusercontent\.com|user-images\.githubusercontent\.com|placehold\.co)[^"']+)["']/i) ||
    content.match(/<iframe|<script/i);

  const isTruncated = content.length >= 10000; // backend limit check

  return (
    <div className="mt-8 group animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border border-gray-700/50 rounded-t-xl border-b-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gray-800 rounded-lg">
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-200 tracking-wide">README.md</h3>
        </div>
        {repoFullName && (
          <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
            {repoFullName}
          </span>
        )}
      </div>

      {/* 2. External Content Warning */}
      {hasExternalContent && (
        <div className="px-4 py-2 bg-yellow-900/40 text-yellow-300 text-xs font-medium border-x border-yellow-500/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          External content (e.g., charts, badges) may not render correctly due to security restrictions.
        </div>
      )}

      {/* 3. Content Container */}
      <div
        className={`relative border border-gray-700/50 rounded-b-xl bg-[#0d1117] transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-none" : "max-h-[600px] overflow-hidden"
        }`}
      >
        <div className="px-6 py-8 sm:px-8 sm:py-10 text-sm">
          <MarkdownEngine content={content} repoFullName={repoFullName} />

          {/* 4. Truncated Message */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            {isTruncated && <p className="text-gray-400 mb-2">... content truncated for performance ...</p>}
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

        {/* Gradient fade when collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/90 to-transparent pointer-events-none" />
        )}
      </div>

      {/* 5. Expand / Collapse Button */}
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
