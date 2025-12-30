import { MarkdownViewer, MarkdownCategory } from './MarkdownViewer';

// Пример данных - в будущем можно загружать из файлов или API
const projectsCategories: MarkdownCategory[] = [
  {
    id: 'web',
    name: 'Web проекты',
    files: [
      {
        id: 'project1',
        title: 'Мой первый проект',
        content: `# Мой первый проект

Это описание моего первого проекта.

## Особенности

- Современный дизайн
- Адаптивная верстка
- Быстрая загрузка

## Технологии

Использованы следующие технологии:
- React
- TypeScript
- Tailwind CSS`,
        date: '2024-01-15'
      }
    ],
    subcategories: [
      {
        id: 'react',
        name: 'React проекты',
        files: [
          {
            id: 'react-project1',
            title: 'React Dashboard',
            content: `# React Dashboard

Описание React Dashboard проекта.`,
            date: '2024-02-01'
          }
        ]
      }
    ]
  },
  {
    id: 'mobile',
    name: 'Мобильные приложения',
    files: [
      {
        id: 'mobile1',
        title: 'Мобильное приложение',
        content: `# Мобильное приложение

Описание мобильного приложения.`,
        date: '2024-03-10'
      }
    ]
  }
];

export function ProjectsApp() {
  return <MarkdownViewer title="Мои проекты" categories={projectsCategories} />;
}

