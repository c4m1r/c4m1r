import React from 'react';
import folderIcon from '../themes/winxp/assets/icons/folder_plain.png';
import textIcon from '../themes/winxp/assets/icons/doc.png';
import { WINXP_ASSETS } from '../themes/winxp/themeAssets';
import userIcon from '../themes/winxp/assets/user.gif';
import blissIcon from '../content/pictures/wallpapers/winxp-bliss.jpg';

export interface FileSystemItem {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'drive' | 'system';
    icon?: string | React.ReactNode;
    content?: string;
    children?: Record<string, FileSystemItem>;
    size?: string;
}

const defaultTextIcon = WINXP_ASSETS.richTextIcon ?? WINXP_ASSETS.notepadIcon ?? textIcon;

type FileSystemChildren = Record<string, FileSystemItem>;

const blogModules = import.meta.glob('../content/blog/*.md', {
    as: 'raw',
    eager: true,
}) as Record<string, string>;

const projectModules = import.meta.glob('../content/projects/**/*.{md,txt}', {
    as: 'raw',
    eager: true,
}) as Record<string, string>;

const buildBlogChildren = (): FileSystemChildren => {
    const children: FileSystemChildren = {};
    Object.entries(blogModules).forEach(([path, rawContent]) => {
        const name = path.split('/').pop() || 'post.md';
        children[name] = {
            id: `blog-${name}`,
            name,
            type: 'file',
            icon: defaultTextIcon,
            content: rawContent,
        };
    });
    return children;
};

const blogChildren = buildBlogChildren();
const projectChildren: FileSystemChildren = (() => {
    const root: FileSystemChildren = {};

    const ensureFolder = (children: FileSystemChildren, folderName: string, pathPrefix: string) => {
        if (!children[folderName]) {
            children[folderName] = {
                id: `${pathPrefix}/${folderName}`,
                name: folderName,
                type: 'folder',
                children: {},
            };
        }
        return children[folderName].children!;
    };

    Object.entries(projectModules).forEach(([path, rawContent]) => {
        const relative = path.split('../content/projects/')[1];
        if (!relative) return;

        const segments = relative.split('/');
        const fileName = segments.pop();
        if (!fileName) return;

        let currentChildren = root;
        let currentPath = 'projects';

        segments.forEach((segment) => {
            currentChildren = ensureFolder(currentChildren, segment, currentPath);
            currentPath += `/${segment}`;
        });

        currentChildren[fileName] = {
            id: `${currentPath}/${fileName}`,
            name: fileName,
            type: 'file',
            icon: defaultTextIcon,
            content: rawContent,
        };
    });

    return root;
})();

export const initialFileSystem: Record<string, FileSystemItem> = {
    'My Computer': {
        id: 'my-computer',
        name: 'My Computer',
        type: 'system',
        children: {
            'C:': {
                id: 'c-drive',
                name: 'Local Disk (C:)',
                type: 'drive',
                size: 'Free Space: 20GB',
                children: {
                    'Documents and Settings': {
                        id: 'docs-settings',
                        name: 'Documents and Settings',
                        type: 'folder',
                        children: {
                            'C4m1r': {
                                id: 'user-c4m1r',
                                name: 'C4m1r',
                                type: 'folder',
                                children: {
                                    'Desktop': {
                                        id: 'desktop',
                                        name: 'Desktop',
                                        type: 'folder',
                                        children: {
                                            'My Projects': {
                                                id: 'my-projects',
                                                name: 'My Projects',
                                                type: 'folder',
                                                        children: projectChildren
                                            },
                                            'My Blog': {
                                                id: 'my-blog',
                                                name: 'My Blog',
                                                type: 'folder',
                                                icon: folderIcon,
                                                children: blogChildren
                                            },
                                            'About Me.txt': {
                                                id: 'about-me',
                                                name: 'My CV',
                                                type: 'file',
                                                icon: userIcon, // Special icon request
                                                content: 'Hi! I am C4m1r.\n\nWelcome to my WebOS portfolio.'
                                            },
                                            'Welcome.txt': {
                                                id: 'welcome',
                                                name: 'Welcome.txt',
                                                type: 'file',
                                                icon: defaultTextIcon,
                                                content: 'about/welcome.md' // Dynamic markdown loading
                                            },
                                            'Bliss.jpg': {
                                                id: 'bliss',
                                                name: 'Bliss.jpg',
                                                type: 'file',
                                                icon: blissIcon,
                                                content: blissIcon // Use content for image path
                                            }
                                        }
                                    },
                                    'My Documents': {
                                        id: 'my-documents',
                                        name: 'My Documents',
                                        type: 'folder',
                                        children: {}
                                    },
                                    'Start Menu': {
                                        id: 'start-menu',
                                        name: 'Start Menu',
                                        type: 'folder',
                                        children: {}
                                    }
                                }
                            },
                            'All Users': {
                                id: 'all-users',
                                name: 'All Users',
                                type: 'folder',
                                children: {}
                            }
                        }
                    },
                    'Program Files': {
                        id: 'program-files',
                        name: 'Program Files',
                        type: 'folder',
                        children: {}
                    },
                    'WINDOWS': {
                        id: 'windows',
                        name: 'WINDOWS',
                        type: 'folder',
                        children: {}
                    }
                }
            }
        }
    }
};

export const getItemsFromPath = (path: string): FileSystemItem[] => {
    if (path === 'My Computer') {
        return Object.values(initialFileSystem['My Computer'].children || {});
    }

    // Handle C:\ path normalization
    const normalizedPath = path.replace('Local Disk (C:)', 'C:').replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(p => p);

    let current = initialFileSystem['My Computer'];

    // Navigate through parts
    for (const part of parts) {
        if (current.children && current.children[part]) {
            current = current.children[part];
        } else {
            // Try finding by name if key doesn't match exactly (though keys should match names in this simple setup)
            const found = Object.values(current.children || {}).find(c => c.name === part);
            if (found) {
                current = found;
            } else {
                return [];
            }
        }
    }

    return current.children ? Object.values(current.children) : [];
};

export const getFileIcon = (item: FileSystemItem) => {
    if (item.icon && typeof item.icon === 'string') return item.icon;
    if (item.type === 'folder') return folderIcon;
    if (item.name.endsWith('.txt') || item.name.endsWith('.md')) {
        return defaultTextIcon;
    }
    return folderIcon; // Fallback
};
