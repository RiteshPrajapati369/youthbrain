import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none text-text-1 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-1 mt-8 mb-4 border-b border-border pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-text-1 mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg sm:text-xl font-semibold text-text-1 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-base sm:text-lg text-text-2 mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-text-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-text-2" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-accent pl-4 py-2 italic text-text-2 bg-surface rounded-r-lg my-4" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-accent underline font-medium hover:text-accent-2 transition-colors" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className="rounded-xl shadow-md my-6 w-full max-h-[500px] object-cover" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
