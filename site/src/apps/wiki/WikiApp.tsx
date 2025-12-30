import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { loadWikiArticles, type ContentItem } from '../../utils/contentLoader';
import { Notepad } from '../notepad';

interface WikiFile {
  id: string;
  title: string;
  content: string;
  date?: string;
}

interface WikiCategory {
  id: string;
  name: string;
  files: WikiFile[];
  children: WikiCategory[];
}

interface WikiCategoryNode extends WikiCategory {
  childrenMap: Map<string, WikiCategoryNode>;
}

const createCategoryNode = (id: string, name: string): WikiCategoryNode => ({
  id,
  name,
  files: [],
  children: [],
  childrenMap: new Map(),
});

const buildWikiTree = (items: ContentItem[]): WikiCategory[] => {
  const rootMap = new Map<string, WikiCategoryNode>();
  const ensureNode = (map: Map<string, WikiCategoryNode>, id: string, name: string) => {
    if (!map.has(id)) {
      map.set(id, createCategoryNode(id, name));
    }
    return map.get(id)!;
  };

  items.forEach((item) => {
    const segments = item.pathSegments && item.pathSegments.length > 0 ? item.pathSegments : ['Wiki'];
    let currentMap = rootMap;
    let currentNode: WikiCategoryNode | null = null;

    segments.forEach((segment, index) => {
      const pathId = currentNode ? `${currentNode.id}/${segment}` : segment;
      const node = ensureNode(currentMap, pathId, segment);
      currentNode = node;
      currentMap = node.childrenMap;
    });

    const targetNode = currentNode ?? ensureNode(rootMap, 'Wiki', 'Wiki');
    targetNode.files.push({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.date,
    });
  });

  const sortCategories = (node: WikiCategoryNode): WikiCategory => {
    const sortedChildren = Array.from(node.childrenMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(sortCategories);

    return {
      id: node.id,
      name: node.name,
      files: node.files.sort((a, b) => a.title.localeCompare(b.title)),
      children: sortedChildren,
    };
  };

  return Array.from(rootMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(sortCategories);
};

const findFirstFile = (categories: WikiCategory[]): WikiFile | null => {
  for (const category of categories) {
    if (category.files.length > 0) {
      return category.files[0];
    }
    const childFile = findFirstFile(category.children);
    if (childFile) {
      return childFile;
    }
  }
  return null;
};

export function WikiApp() {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<WikiFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWikiArticles().then((articles) => {
      const tree = buildWikiTree(articles);
      setCategories(tree);
      setExpanded(new Set(tree.map((cat) => cat.id)));
      setSelectedFile(findFirstFile(tree));
      setLoading(false);
    });
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpanded((prev) => {
      const updated = new Set(prev);
      if (updated.has(categoryId)) {
        updated.delete(categoryId);
      } else {
        updated.add(categoryId);
      }
      return updated;
    });
  };

  const renderCategory = (category: WikiCategory, level = 0) => {
    const hasChildren = category.children.length > 0;
    const categoryId = category.id;
    const isExpanded = expanded.has(categoryId);

    return (
      <div key={categoryId}>
        <div
          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) toggleCategory(categoryId);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-4" />
          )}
          <Folder size={14} className="text-blue-600" />
          <span className="font-semibold">{category.name}</span>
        </div>

        {(isExpanded || !hasChildren) && (
          <div className="ml-2">
            {category.children.map((child) => renderCategory(child, level + 1))}
            {category.files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded ${
                  selectedFile?.id === file.id ? 'bg-blue-100' : ''
                }`}
                style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                onClick={() => setSelectedFile(file)}
              >
                <FileText size={14} className="text-gray-600" />
                <span>{file.title}</span>
                {file.date && <span className="text-xs text-gray-500 ml-auto">{file.date}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-sm text-gray-500">Загрузка Wiki...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      <aside className="w-64 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b bg-blue-600 text-white">
          <h2 className="font-bold text-lg">Wiki</h2>
          <p className="text-xs text-blue-100">Категории и заметки</p>
        </div>
        <div className="p-2">
          {categories.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-6">Wiki пуст</div>
          ) : (
            categories.map((category) => renderCategory(category))
          )}
        </div>
      </aside>

      <section className="flex-1 min-h-0 bg-white">
        {selectedFile ? (
          <Notepad initialContent={selectedFile.content} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 opacity-40" />
              <p>Выберите файл слева</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
