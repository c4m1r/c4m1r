import { MarkdownViewer, MarkdownCategory } from './MarkdownViewer';

const aboutCategories: MarkdownCategory[] = [
  {
    id: 'info',
    name: 'Информация',
    files: [
      {
        id: 'about-me',
        title: 'Обо мне',
        content: `# Обо мне

Привет! Меня зовут C4m1r.

## Навыки

- Программирование
- Дизайн
- Разработка веб-приложений

## Контакты

Свяжитесь со мной через...`,
        date: '2024-01-01'
      }
    ]
  },
  {
    id: 'experience',
    name: 'Опыт работы',
    files: [
      {
        id: 'exp1',
        title: 'Опыт работы',
        content: `# Опыт работы

Описание опыта работы.`,
        date: '2024-01-05'
      }
    ]
  }
];

export function AboutApp() {
  return <MarkdownViewer title="Обо мне" categories={aboutCategories} />;
}

