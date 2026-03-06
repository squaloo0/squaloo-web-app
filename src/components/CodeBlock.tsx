"use client";
import { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  maxHeight?: string;
}

export default function CodeBlock({
  code,
  language,
  title,
  maxHeight = "400px",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden bg-[#0d0e10] border border-neutral-800 shadow-lg font-mono text-sm">
      {title && (
        <div className="bg-neutral-900 px-4 py-2 flex justify-between items-center border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#63a375]/60" />
            <span className="text-neutral-400 text-xs font-mono ml-2">{title}</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="text-neutral-600 hover:text-white text-xs flex items-center gap-1 transition-colors"
            aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {copied ? (
              <>
                <CheckIcon />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div
        className="p-4 overflow-auto code-scrollbar"
        style={{ maxHeight }}
      >
        <pre className={`language-${language}`} style={{ margin: 0 }}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
