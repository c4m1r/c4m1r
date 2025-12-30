/**
 * Утилиты для динамической загрузки контента из content/
 * Поддерживает: blog posts, projects, wiki, images
 */

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  date?: string;
  category?: string;
  tags?: string[];
  author?: string;
  updatedAt?: string;
  relativePath?: string;
  pathSegments?: string[];
}

export interface ImageItem {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
  size?: string;
  date?: string;
}

/**
 * Загружает markdown файлы из content/blog
 */
export async function loadBlogPosts(): Promise<ContentItem[]> {
  const posts: ContentItem[] = [];
  
  try {
    // Динамический импорт всех markdown файлов из blog
    const modules = import.meta.glob('../content/blog/*.md', { as: 'raw' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('../content/blog/')[1] || filename;
      
      // Парсим frontmatter если есть
      const { metadata, body } = parseFrontmatter(content);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      
      posts.push({
        id: filename,
        title: metadata.title || filename,
        content: body,
        date: metadata.date,
        category: metadata.category,
        tags: metadata.tags,
        author: metadata.author,
        updatedAt,
        relativePath,
      });
    }
  } catch (error) {
    console.error('Failed to load blog posts:', error);
  }
  
  return posts.sort((a, b) => {
    const dateA = Date.parse(a.updatedAt || a.date || '');
    const dateB = Date.parse(b.updatedAt || b.date || '');
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
    if (!isNaN(dateA)) return -1;
    if (!isNaN(dateB)) return 1;
    return b.id.localeCompare(a.id);
  });
}

/**
 * Загружает projects
 */
export async function loadProjects(): Promise<ContentItem[]> {
  const projects: ContentItem[] = [];
  
  try {
    const modules = import.meta.glob('/src/content/projects/*.{md,txt}', { as: 'raw' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
      
      const { metadata, body } = parseFrontmatter(content);
      
      projects.push({
        id: filename,
        title: metadata.title || filename,
        content: body,
        category: metadata.category,
        tags: metadata.tags,
      });
    }
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
  
  return projects;
}

/**
 * Загружает wiki статьи
 */
export async function loadWikiArticles(category?: string): Promise<ContentItem[]> {
  const articles: ContentItem[] = [];
  
  try {
    const modules = import.meta.glob('../content/wiki/**/*.md', { as: 'raw' });
    
    for (const path in modules) {
      if (category && !path.includes(`../content/wiki/${category}/`)) continue;
      
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('../content/wiki/')[1] || filename;
      const segments = relativePath.split('/').filter(Boolean);
      const directories = segments.slice(0, -1);
      const pathCategory = directories[0] || '';
      
      const { metadata, body } = parseFrontmatter(content);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      
      articles.push({
        id: filename,
        title: metadata.title || filename,
        content: body,
        category: pathCategory,
        tags: metadata.tags,
        date: metadata.date,
        updatedAt,
        relativePath,
        pathSegments: directories,
      });
    }
  } catch (error) {
    console.error('Failed to load wiki articles:', error);
  }
  
  return articles;
}

/**
 * Загружает изображения из content/pictures
 */
export async function loadPictures(): Promise<ImageItem[]> {
  const pictures: ImageItem[] = [];
  
  try {
    // Загружаем все изображения из content/pictures
    const modules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', { 
      as: 'url',
      eager: false 
    });
    
    for (const path in modules) {
      const url = await modules[path]() as string;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
      
      pictures.push({
        id: filename,
        name: name,
        path: url,
        thumbnail: url, // В будущем можно добавить генерацию thumbnails
      });
    }
  } catch (error) {
    console.error('Failed to load pictures:', error);
  }
  
  return pictures;
}

/**
 * Загружает обои из content/pictures/wallpapers
 */
export async function loadWallpapers(): Promise<ImageItem[]> {
  const wallpapers: ImageItem[] = [];
  
  try {
    const modules = import.meta.glob('/src/content/pictures/wallpapers/*.{jpg,jpeg,png,webp}', { 
      as: 'url',
      eager: false 
    });
    
    for (const path in modules) {
      const url = await modules[path]() as string;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      
      wallpapers.push({
        id: filename,
        name: name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('Failed to load wallpapers:', error);
  }
  
  return wallpapers;
}

/**
 * Парсит frontmatter из markdown
 */
function parseFrontmatter(content: string): { metadata: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, body: content };
  }
  
  const [, frontmatter, body] = match;
  const metadata: Record<string, any> = {};
  
  // Простой парсинг YAML-like frontmatter
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.slice(0, colonIndex).trim();
    let value: any = line.slice(colonIndex + 1).trim();
    
    // Парсим массивы
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''));
    }
    
    // Удаляем кавычки
    if (typeof value === 'string' && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    
    metadata[key] = value;
  });
  
  return { metadata, body };
}

/**
 * Загружает конкретный файл контента
 */
export async function loadContentFile(path: string): Promise<string | null> {
  try {
    const modules = import.meta.glob('/src/content/**/*', { as: 'raw' });
    const fullPath = `/src/content/${path}`;
    
    if (modules[fullPath]) {
      return await modules[fullPath]() as string;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load content file: ${path}`, error);
    return null;
  }
}

/**
 * Загружает markdown файл по пути
 */
export async function loadMarkdownContent(path: string): Promise<string> {
  try {
    // Remove .md extension if present
    const cleanPath = path.replace(/\.md$/, '');
    const response = await fetch(`/src/content/${cleanPath}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading markdown:', error);
    throw error;
  }
}

