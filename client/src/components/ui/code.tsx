import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language?: string;
  children: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language = 'javascript', 
  children,
  className
}) => {
  return (
    <div className={cn(
      "relative rounded-md overflow-hidden bg-black text-white",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-1 bg-gray-900 text-xs">
        <span>{language}</span>
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(children);
          }}
        >
          Copy
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
};