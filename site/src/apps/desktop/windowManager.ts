/**
 * Универсальный менеджер окон для всех тем
 * Управляет состоянием окон: открытие, закрытие, фокус, минимизация, развёртывание
 */

import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';

export interface ManagedWindow {
  id: string;
  title: string;
  content: ReactNode;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  focused: boolean;
  resizable?: boolean;
}

export interface OpenWindowOptions {
  id: string;
  title: string;
  content: ReactNode;
  icon?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minimized?: boolean;
  maximized?: boolean;
  resizable?: boolean;
}

export interface WindowManagerState {
  windows: ManagedWindow[];
  openWindow: (options: OpenWindowOptions) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  updateWindow: (
    id: string,
    updater:
      | Partial<Pick<ManagedWindow, 'x' | 'y' | 'width' | 'height' | 'content' | 'title' | 'icon'>>
      | ((window: ManagedWindow) => Partial<Pick<ManagedWindow, 'x' | 'y' | 'width' | 'height' | 'content' | 'title' | 'icon'>>)
  ) => void;
}

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;
const DEFAULT_START_X = 100;
const DEFAULT_START_Y = 100;

const toManagedWindow = (options: OpenWindowOptions, zIndex: number): ManagedWindow => ({
  id: options.id,
  title: options.title,
  content: options.content,
  icon: options.icon,
  x: options.x ?? DEFAULT_START_X,
  y: options.y ?? DEFAULT_START_Y,
  width: options.width ?? DEFAULT_WIDTH,
  height: options.height ?? DEFAULT_HEIGHT,
  minimized: options.minimized ?? false,
  maximized: options.maximized ?? false,
  zIndex,
  focused: true,
  resizable: options.resizable ?? true,
});

export function useWindowManagerState(initialWindows: OpenWindowOptions[] = []): WindowManagerState {
  const zCounterRef = useRef(200);

  const allocateZIndex = useCallback(() => {
    zCounterRef.current += 1;
    return zCounterRef.current;
  }, []);

  const [windows, setWindows] = useState<ManagedWindow[]>(() => {
    return initialWindows.map((options, index) => {
      const zIndex = zCounterRef.current + index + 1;
      zCounterRef.current = zIndex;
      return toManagedWindow(options, zIndex);
    });
  });

  const openWindow = useCallback(
    (options: OpenWindowOptions) => {
      setWindows((prev) => {
        const existing = prev.find((window) => window.id === options.id);
        const nextZ = allocateZIndex();

        if (existing) {
          return prev.map((window) => {
            if (window.id === options.id) {
              return {
                ...window,
                title: options.title ?? window.title,
                content: options.content ?? window.content,
                icon: options.icon ?? window.icon,
                minimized: false,
                maximized: options.maximized ?? window.maximized,
                focused: true,
                zIndex: nextZ,
                width: options.width ?? window.width,
                height: options.height ?? window.height,
                x: options.x ?? window.x,
                y: options.y ?? window.y,
                resizable: options.resizable ?? window.resizable,
              };
            }
            return { ...window, focused: false };
          });
        }

        const cascadeIndex = prev.length;
        const cascadeOptions: OpenWindowOptions = {
          ...options,
          x: options.x ?? DEFAULT_START_X + cascadeIndex * 30,
          y: options.y ?? DEFAULT_START_Y + cascadeIndex * 30,
        };
        const newWindow = toManagedWindow(cascadeOptions, nextZ);
        const others = prev.map((window) => ({ ...window, focused: false }));
        return [...others, newWindow];
      });
    },
    [allocateZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const remaining = prev.filter((window) => window.id !== id);
      if (remaining.length === 0) {
        return remaining;
      }
      const topWindow = remaining.reduce((top, current) => (current.zIndex > top.zIndex ? current : top), remaining[0]);
      return remaining.map((window) => ({ ...window, focused: window.id === topWindow.id }));
    });
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        if (!prev.some((window) => window.id === id)) {
          return prev;
        }
        const nextZ = allocateZIndex();
        return prev.map((window) => {
          if (window.id === id) {
            return { ...window, minimized: false, focused: true, zIndex: nextZ };
          }
          return { ...window, focused: false };
        });
      });
    },
    [allocateZIndex]
  );

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id === id) {
          return { ...window, minimized: true, focused: false };
        }
        return window;
      })
    );
  }, []);

  const maximizeWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        if (!prev.some((window) => window.id === id)) {
          return prev;
        }
        const nextZ = allocateZIndex();
        return prev.map((window) => {
          if (window.id === id) {
            return { ...window, minimized: false, maximized: true, focused: true, zIndex: nextZ };
          }
          return { ...window, focused: false };
        });
      });
    },
    [allocateZIndex]
  );

  const restoreWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        if (!prev.some((window) => window.id === id)) {
          return prev;
        }
        const nextZ = allocateZIndex();
        return prev.map((window) => {
          if (window.id === id) {
            return { ...window, minimized: false, maximized: false, focused: true, zIndex: nextZ };
          }
          return { ...window, focused: false };
        });
      });
    },
    [allocateZIndex]
  );

  const updateWindow = useCallback<WindowManagerState['updateWindow']>((id, updater) => {
    setWindows((prev) =>
      prev.map((window) => {
        if (window.id !== id) {
          return window;
        }
        const patch = typeof updater === 'function' ? updater(window) : updater;
        if (!patch) {
          return window;
        }
        return { ...window, ...patch };
      })
    );
  }, []);

  return useMemo(
    () => ({
      windows,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      updateWindow,
    }),
    [windows, openWindow, closeWindow, focusWindow, minimizeWindow, maximizeWindow, restoreWindow, updateWindow]
  );
}

