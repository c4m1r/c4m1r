import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../i18n/translations';
import { projects, blogPosts, aboutContent } from '../content/projects/projects';
import { FileText, User, FolderOpen } from 'lucide-react';

export function BlogSite() {
  const { language } = useApp();
  const t = translations[language].blog;
  const [activeSection, setActiveSection] = useState<'projects' | 'about' | 'blog'>('about');

  const currentProjects = projects[language];
  const currentBlogPosts = blogPosts[language];
  const currentAbout = aboutContent[language];

  const renderContent = () => {
    switch (activeSection) {
      case 'projects':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">{t.projects}</h1>
            <div className="space-y-4">
              {currentProjects.map((project, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
                  <p className="text-gray-600">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">{t.about}</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">{currentAbout.name}</h2>
              <p className="text-lg text-blue-600 font-medium mb-4">{currentAbout.title}</p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {currentAbout.bio}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {currentAbout.description}
              </p>
            </div>
          </div>
        );
      case 'blog':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">{t.blog}</h1>
            <div className="space-y-6">
              {currentBlogPosts.map((post, index) => (
                <article key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">{post.date}</p>
                  <p className="text-gray-700">{post.content}</p>
                </article>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">C4m1r</h1>
          <p className="text-sm text-gray-500">Developer & Creator</p>
        </div>
        <nav className="p-4">
          <button
            onClick={() => setActiveSection('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeSection === 'about'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User size={20} />
            {t.about}
          </button>
          <button
            onClick={() => setActiveSection('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeSection === 'projects'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FolderOpen size={20} />
            {t.projects}
          </button>
          <button
            onClick={() => setActiveSection('blog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'blog'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText size={20} />
            {t.blog}
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
