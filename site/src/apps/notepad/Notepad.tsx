/**
 * Универсальный Notepad для всех тем
 * Поддерживает базовое редактирование текста с меню
 */

import { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

interface NotepadProps {
  initialContent?: string;
  onClose?: () => void;
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-6 text-blue-800">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-5 text-blue-700">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 mt-4 text-blue-600">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-6 mb-1">• $1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p class="mb-3 leading-relaxed">')
    .replace(/$/, '</p>');
}

export function Notepad({ initialContent = '', onClose }: NotepadProps) {
  const { theme } = useApp();
  const [content, setContent] = useState(initialContent);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isXpFamily = theme !== 'win-98';

  // Check if content is markdown (starts with # or contains markdown syntax)
  const isMarkdown = useMemo(() => {
    return content.startsWith('#') || /\*\*|\*|^\d+\.|^- /.test(content);
  }, [content]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleNew = () => {
    if (content && !confirm('Do you want to save changes?')) {
      return;
    }
    setContent('');
    setShowFileMenu(false);
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
    setShowEditMenu(false);
  };

  const handleCopy = () => {
    if (isMarkdown) {
      // For markdown, copy the raw markdown text
      navigator.clipboard.writeText(content);
    } else if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      navigator.clipboard.writeText(selectedText);
    }
    setShowEditMenu(false);
  };

  const handleCut = () => {
    if (isMarkdown) {
      // Cut not available for read-only markdown
      return;
    }
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      navigator.clipboard.writeText(selectedText);
      setContent(content.substring(0, start) + content.substring(end));
    }
    setShowEditMenu(false);
  };

  const handlePaste = async () => {
    if (isMarkdown) {
      // Paste not available for read-only markdown
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        setContent(content.substring(0, start) + text + content.substring(end));
      }
    } catch (err) {
      console.error('Failed to paste:', err);
    }
    setShowEditMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Menu Bar */}
      <div className={`flex items-center h-[24px] px-1 border-b relative ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
        <div className="relative">
          <button
            onClick={() => {
              setShowFileMenu(!showFileMenu);
              setShowEditMenu(false);
            }}
            className={`px-2 py-[2px] text-xs leading-snug ${showFileMenu ? (isXpFamily ? 'bg-[#316ac5] text-white' : 'bg-[#000080] text-white') : ''} ${isXpFamily ? 'hover:bg-[#316ac5] hover:text-white' : 'hover:bg-[#000080] hover:text-white'}`}
          >
            File
          </button>
          {showFileMenu && (
            <div className="absolute top-full left-0 mt-0.5 bg-[#f0f0f0] border border-[#8c96a6] shadow-lg z-50 min-w-[180px]">
              <button
                onClick={handleNew}
                className={`w-full text-left px-4 py-1 text-xs ${isMarkdown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#316ac5] hover:text-white'}`}
                disabled={isMarkdown}
              >
                New<span className="float-right text-[10px] opacity-60">Ctrl+N</span>
              </button>
              <button className="w-full text-left px-4 py-1 text-xs hover:bg-[#316ac5] hover:text-white opacity-50 cursor-not-allowed">
                Open...<span className="float-right text-[10px] opacity-60">Ctrl+O</span>
              </button>
              <button className="w-full text-left px-4 py-1 text-xs hover:bg-[#316ac5] hover:text-white opacity-50 cursor-not-allowed">
                Save<span className="float-right text-[10px] opacity-60">Ctrl+S</span>
              </button>
              <div className="h-px bg-[#8c96a6] my-1" />
              <button onClick={onClose} className="w-full text-left px-4 py-1 text-xs hover:bg-[#316ac5] hover:text-white">
                Exit
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setShowEditMenu(!showEditMenu);
              setShowFileMenu(false);
            }}
            className={`px-2 py-[2px] text-xs leading-snug ${showEditMenu ? (isXpFamily ? 'bg-[#316ac5] text-white' : 'bg-[#000080] text-white') : ''} ${isXpFamily ? 'hover:bg-[#316ac5] hover:text-white' : 'hover:bg-[#000080] hover:text-white'}`}
          >
            Edit
          </button>
          {showEditMenu && (
            <div className="absolute top-full left-0 mt-0.5 bg-[#f0f0f0] border border-[#8c96a6] shadow-lg z-50 min-w-[180px]">
              <button
                onClick={handleCut}
                className={`w-full text-left px-4 py-1 text-xs ${isMarkdown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#316ac5] hover:text-white'}`}
                disabled={isMarkdown}
              >
                Cut<span className="float-right text-[10px] opacity-60">Ctrl+X</span>
              </button>
              <button onClick={handleCopy} className="w-full text-left px-4 py-1 text-xs hover:bg-[#316ac5] hover:text-white">
                Copy<span className="float-right text-[10px] opacity-60">Ctrl+C</span>
              </button>
              <button
                onClick={handlePaste}
                className={`w-full text-left px-4 py-1 text-xs ${isMarkdown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#316ac5] hover:text-white'}`}
                disabled={isMarkdown}
              >
                Paste<span className="float-right text-[10px] opacity-60">Ctrl+V</span>
              </button>
              <div className="h-px bg-[#8c96a6] my-1" />
              <button onClick={handleSelectAll} className="w-full text-left px-4 py-1 text-xs hover:bg-[#316ac5] hover:text-white">
                Select All<span className="float-right text-[10px] opacity-60">Ctrl+A</span>
              </button>
            </div>
          )}
        </div>
        {['Format', 'View', 'Help'].map((item) => (
          <button
            key={item}
            className="px-2 py-[2px] text-xs opacity-50 cursor-not-allowed leading-snug"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative" onClick={() => {
        setShowFileMenu(false);
        setShowEditMenu(false);
      }}>
        {isMarkdown ? (
          // Markdown view - read-only HTML rendering
          <div
            className="absolute inset-0 p-4 overflow-auto text-sm bg-white"
            style={{
              fontFamily: isXpFamily ? '"Lucida Console", monospace' : '"Courier New", monospace',
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          // Plain text editing
          <>
            <textarea
              ref={textareaRef}
              className="w-full h-full resize-none p-1 outline-none font-mono text-sm"
              style={{
                border: 'none',
                whiteSpace: 'pre',
                overflowX: 'auto',
                fontFamily: isXpFamily ? '"Lucida Console", monospace' : '"Courier New", monospace',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
                background: 'transparent',
                color: 'transparent',
                caretColor: 'black',
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />
            <div
              className="w-full h-full p-1 overflow-auto whitespace-pre-wrap font-mono text-sm"
              style={{
                fontFamily: isXpFamily ? '"Lucida Console", monospace' : '"Courier New", monospace',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0,
              }}
            >
              {content}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

