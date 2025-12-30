/**
 * Просмотр блога с динамической загрузкой статей
 * Загружает markdown файлы из content/blog
 */

import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { loadBlogPosts, type ContentItem } from '../../utils/contentLoader';
import { Notepad } from '../notepad';
import { Calendar, Tag, User, ArrowLeft } from 'lucide-react';

interface BlogViewerProps {
  initialPost?: string;
}

export function BlogViewer({ initialPost }: BlogViewerProps) {
  const { theme } = useApp();
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const isXpFamily = theme !== 'win-98';

  useEffect(() => {
    loadBlogPosts().then(blogPosts => {
      setPosts(blogPosts);
      setLoading(false);
      
      // Если указан initialPost, открываем его
      if (initialPost) {
        const post = blogPosts.find(p => p.id === initialPost);
        if (post) setSelectedPost(post);
      }
    });
  }, [initialPost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="text-lg mb-2">Загрузка блога...</div>
          <div className="text-sm text-gray-500">Пожалуйста, подождите</div>
        </div>
      </div>
    );
  }

  // Просмотр отдельной статьи
  if (selectedPost) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className={`flex items-center gap-3 p-3 border-b ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/50"
          >
            <ArrowLeft size={16} />
            <span>Назад к списку</span>
          </button>
          <div className="text-sm text-gray-600">
            {selectedPost.updatedAt
              ? `Обновлено: ${new Date(selectedPost.updatedAt).toLocaleDateString('ru-RU')}`
              : selectedPost.date
                ? `Дата: ${new Date(selectedPost.date).toLocaleDateString('ru-RU')}`
                : null}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Notepad initialContent={selectedPost.content} />
        </div>
      </div>
    );
  }

  // Список статей
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`p-3 border-b ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
        <h2 className="text-xl font-bold">Блог</h2>
        <p className="text-sm text-gray-600">{posts.length} {posts.length === 1 ? 'статья' : 'статей'}</p>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-auto p-4">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">Нет статей</div>
            <div className="text-sm">Блог пуст</div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border-2 border-transparent hover:border-gray-300 rounded p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedPost(post)}
              >
                <h3 className="text-xl font-semibold mb-2 text-[#215dc6] hover:underline">
                  {post.title}
                </h3>
                
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                  {(post.updatedAt || post.date) && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(post.updatedAt || post.date || '').toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  {post.category && (
                    <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {post.category}
                    </div>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag size={12} />
                      <span>{post.tags.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.content.slice(0, 200)}...
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

