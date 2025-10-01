import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpenIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon } from '../components/icons';

interface ClaudeCodeGuideProps {
  onNavigate?: (page: string) => void;
}

const ClaudeCodeGuide: React.FC<ClaudeCodeGuideProps> = ({ onNavigate }) => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [showToc, setShowToc] = useState(true);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    // Fetch the markdown file
    fetch('/CLAUDE_CODE_GUIDE.md')
      .then(response => response.text())
      .then(text => setMarkdownContent(text))
      .catch(error => console.error('Error loading guide:', error));

    // Handle scroll for active section highlighting
    const handleScroll = () => {
      const sections = document.querySelectorAll('h2[id], h3[id]');
      let current = '';

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = section.id;
        }
      });

      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const extractToc = (markdown: string) => {
    const lines = markdown.split('\n');
    const tocItems: Array<{ level: number; text: string; id: string }> = [];

    lines.forEach(line => {
      const h2Match = line.match(/^## (\d+\.\s+)?(.+)/);
      const h3Match = line.match(/^### (.+)/);

      if (h2Match) {
        const text = h2Match[2];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        tocItems.push({ level: 2, text, id: `${h2Match[1] || ''}${id}` });
      } else if (h3Match) {
        const text = h3Match[1];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        tocItems.push({ level: 3, text, id });
      }
    });

    return tocItems;
  };

  const toc = extractToc(markdownContent);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate ? onNavigate('guidesinfo') : window.history.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Go back"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Comprehensive Guide to Claude Code
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Master AI-Powered Coding
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowToc(!showToc)}
              className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showToc ? 'Hide' : 'Show'} Contents
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents Sidebar */}
          <aside
            className={`lg:w-1/4 ${showToc ? 'block' : 'hidden lg:block'}`}
          >
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {toc.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.level === 3 ? 'pl-6' : ''
                    } ${
                      activeSection === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <article className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children, ...props }) => (
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 mt-8" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    return (
                      <h2 id={id} className="text-3xl font-bold text-gray-900 dark:text-white mb-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700" {...props}>
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    return (
                      <h3 id={id} className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 mt-6" {...props}>
                        {children}
                      </h3>
                    );
                  },
                  h4: ({ children, ...props }) => (
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-4" {...props}>
                      {children}
                    </h4>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props}>
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="ml-4" {...props}>
                      {children}
                    </li>
                  ),
                  code: ({ inline, className, children, ...props }: any) => {
                    return inline ? (
                      <code className="bg-gray-100 dark:bg-slate-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-900 dark:bg-slate-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => (
                    <pre className="bg-gray-900 dark:bg-slate-950 rounded-lg overflow-hidden my-4" {...props}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic" {...props}>
                      {children}
                    </blockquote>
                  ),
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-gray-50 dark:bg-slate-700" {...props}>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children, ...props }) => (
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                      {children}
                    </tbody>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300" {...props}>
                      {children}
                    </td>
                  ),
                  a: ({ children, href, ...props }) => (
                    <a
                      href={href}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />
                  ),
                  strong: ({ children, ...props }) => (
                    <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em className="italic text-gray-700 dark:text-gray-300" {...props}>
                      {children}
                    </em>
                  ),
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </article>

            {/* Footer Navigation */}
            <div className="mt-8 flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <button
                onClick={() => onNavigate ? onNavigate('guidesinfo') : window.history.back()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Back to Guides</span>
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Back to Top</span>
                <ChevronRightIcon className="h-4 w-4 rotate-[-90deg]" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClaudeCodeGuide;
