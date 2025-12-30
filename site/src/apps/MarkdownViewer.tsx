import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

export interface MarkdownFile {
  id: string;
  title: string;
  content: string;
  category?: string;
  date?: string;
}

export interface MarkdownCategory {
  id: string;
  name: string;
  files: MarkdownFile[];
  subcategories?: MarkdownCategory[];
}

interface MarkdownViewerProps {
  title: string;
  categories: MarkdownCategory[];
  onClose?: () => void;
}

export function MarkdownViewer({ title, categories, onClose }: MarkdownViewerProps) {
  const { theme } = useApp();
  const [selectedFile, setSelectedFile] = useState<MarkdownFile | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderMarkdown = (content: string) => {
    // Простой парсер markdown для базового форматирования
    let html = content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-5">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/^\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');

    return `<p class="mb-4">${html}</p>`;
  };

  const renderCategory = (category: MarkdownCategory, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.subcategories && category.subcategories.length > 0;

    return (
      <div key={category.id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded ${
            theme === 'win-98' ? 'hover:bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => hasChildren && toggleCategory(category.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={16} className="text-gray-600" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )
          ) : (
            <div className="w-4" />
          )}
          <Folder size={16} className="text-blue-600" />
          <span className="font-semibold">{category.name}</span>
        </div>

        {isExpanded && (
          <div className="ml-4">
            {category.subcategories?.map((sub) => renderCategory(sub, level + 1))}
            {category.files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded ${
                  selectedFile?.id === file.id ? 'bg-blue-100' : ''
                }`}
                style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
                onClick={() => setSelectedFile(file)}
              >
                <FileText size={16} className="text-gray-600" />
                <span>{file.title}</span>
                {file.date && <span className="text-xs text-gray-500 ml-auto">{file.date}</span>}
              </div>
            ))}
          </div>
        )}

        {!hasChildren && category.files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded ${
              selectedFile?.id === file.id ? 'bg-blue-100' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 24}px` }}
            onClick={() => setSelectedFile(file)}
          >
            <FileText size={16} className="text-gray-600" />
            <span>{file.title}</span>
            {file.date && <span className="text-xs text-gray-500 ml-auto">{file.date}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Sidebar with categories and files */}
      <div
        className={`w-64 border-r overflow-y-auto ${
          theme === 'win-98' ? 'bg-[#c0c0c0] border-gray-400' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className={`p-4 border-b ${theme === 'win-98' ? 'bg-[#000080] text-white' : 'bg-blue-600 text-white'}`}>
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        <div className="p-2">
          {categories.map((category) => renderCategory(category))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {selectedFile ? (
          <div>
            <h1 className="text-4xl font-bold mb-4">{selectedFile.title}</h1>
            {selectedFile.date && (
              <p className="text-gray-500 mb-6">Дата: {selectedFile.date}</p>
            )}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedFile.content) }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <FileText size={64} className="mx-auto mb-4 opacity-50" />
              <p>Выберите файл для просмотра</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

