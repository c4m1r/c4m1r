import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { loadBlogPosts, type ContentItem } from '../utils/contentLoader';
import { Notepad } from './notepad';

export function BlogApp() {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts().then((items) => {
      setPosts(items);
      setSelectedPost(items[0] ?? null);
      setLoading(false);
    });
  }, []);

  const groupedPosts = useMemo(() => {
    const groups = new Map<string, ContentItem[]>();
    posts.forEach((post) => {
      const key = post.category || 'Общее';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(post);
    });
    groups.forEach((items) =>
      items.sort((a, b) => {
        const dateA = Date.parse(a.updatedAt || a.date || '');
        const dateB = Date.parse(b.updatedAt || b.date || '');
        if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
        if (!isNaN(dateA)) return -1;
        if (!isNaN(dateB)) return 1;
        return a.title.localeCompare(b.title);
      })
    );
    return Array.from(groups.entries());
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-sm text-gray-600">
        Загрузка записей блога...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-sm text-gray-500">
        В папке <code>content/blog</code> нет записей.
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      <aside className="w-72 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b bg-blue-600 text-white">
          <h2 className="font-bold text-lg">My Blog</h2>
          <p className="text-xs text-blue-100">Последние заметки</p>
        </div>
        <div className="p-2 space-y-4">
          {groupedPosts.map(([category, items]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-gray-500 uppercase px-2 mb-1">{category}</div>
              {items.map((post) => {
                const timestamp = post.updatedAt || post.date;
                return (
                  <button
                    key={post.id}
                    className={`w-full text-left px-2 py-2 rounded ${
                      selectedPost?.id === post.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="text-sm font-semibold truncate">{post.title}</div>
                    {timestamp && (
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(timestamp).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <section className="flex-1 min-h-0 bg-white">
        {selectedPost ? (
          <Notepad initialContent={selectedPost.content} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Выберите запись слева
          </div>
        )}
      </section>
    </div>
  );
}

