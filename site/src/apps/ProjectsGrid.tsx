import { useMemo, useState } from 'react';
import { getItemsFromPath, FileSystemItem } from '../utils/FileSystem';

interface ProjectsGridProps {
  path?: string;
}

interface ProjectCategory {
  folder: FileSystemItem;
  projects: FileSystemItem[];
}

export function ProjectsGrid({ path = 'C:\\Documents and Settings\\C4m1r\\Desktop\\My Projects' }: ProjectsGridProps) {
  const entries = useMemo(() => getItemsFromPath(path), [path]);

  const categories: ProjectCategory[] = useMemo(() => {
    return entries
      .filter((entry) => entry.type === 'folder')
      .map((folder) => ({
        folder,
        projects: Object.values(folder.children ?? {}),
      }));
  }, [entries]);

  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);
  const focusedProject = useMemo(() => {
    for (const category of categories) {
      const match = category.projects.find((project) => project.id === focusedProjectId);
      if (match) return match;
    }
    return null;
  }, [categories, focusedProjectId]);

  const getProjectLabel = (project: FileSystemItem) => project.name.replace(/\.(md|txt)$/i, '');

  return (
    <div className="w-full h-full bg-[#2463c5] flex flex-col lg:flex-row font-tahoma text-white">
      <div className="flex-1 overflow-auto px-5 py-6">
        {categories.length === 0 && (
          <p className="text-sm text-white/80 px-3 pb-4">
            Папка проектов пока пуста. Добавьте новые категории в <code>content/projects</code>, чтобы они отобразились здесь.
          </p>
        )}
        {categories.map(({ folder, projects }) => (
          <div key={folder.id} className="relative mb-6">
            <h2 className="text-xs font-semibold px-3 uppercase tracking-wide">{folder.name}</h2>
            <div className="absolute left-[-12px] top-5 w-64 h-px bg-gradient-to-r from-[#8fc5ff] to-transparent opacity-80"></div>
            <div className="flex flex-wrap gap-3 pt-3 pb-1">
              {projects.map((project) => {
                const isFocused = project.id === focusedProjectId;
                const iconSrc = typeof project.icon === 'string' ? project.icon : undefined;
                return (
                  <button
                    key={project.id}
                    className={`flex items-center gap-2.5 px-4 pb-2 pt-2 rounded-sm transition-all duration-150 cursor-pointer border border-transparent project-card ${
                      isFocused ? 'bg-[#0B61FF] border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.35)]' : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setFocusedProjectId(project.id)}
                  >
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={project.name}
                        className="w-10 h-10 object-contain"
                        style={{ opacity: isFocused ? 0.6 : 1 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-white/20" />
                    )}
                    <p
                      className="text-xs font-semibold text-left"
                      style={{
                        color: isFocused ? '#ffffff' : '#e4ecff',
                      }}
                    >
                      {getProjectLabel(project)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full lg:w-[38%] min-h-[280px] lg:h-full bg-gradient-to-b from-[#f9fafc] to-[#d7dff5] text-[#0f1d4f] border-l border-[#8aa3e5] px-5 py-6 shadow-[inset_4px_0_10px_rgba(0,0,0,0.05)]">
        {focusedProject ? (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-[#6174b4]">Project</p>
              <h3 className="text-lg font-bold text-[#0b2e82]">{getProjectLabel(focusedProject)}</h3>
            </div>
            <div className="flex-1 overflow-auto bg-white/80 border border-[#cfd7f0] rounded-lg p-4 text-[13px] leading-relaxed text-[#1c275f] shadow-[0_6px_20px_rgba(0,0,0,0.1)] whitespace-pre-line">
              {focusedProject.content?.slice(0, 1500) || 'Эта категория пока не содержит подробного описания. Добавьте markdown-файл в папку проекта, чтобы показать текст здесь.'}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 text-[#1c275f]/80">
            <p className="text-xs uppercase tracking-wide mb-2">Выберите проект</p>
            <p className="text-sm leading-relaxed">
              Нажмите на папку из списка слева, чтобы увидеть содержимое и описание проекта в стиле оригинального Windows XP портфолио.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

