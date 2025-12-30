/**
 * Универсальный компонент Window для всех тем
 * Поддерживает: драг, ресайз, минимизацию, максимизацию
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import { useApp } from '../../contexts/AppContext';

interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  children: ReactNode;
  initialX: number;
  initialY: number;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  onFocus?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onResizeEnd?: (size: { width: number; height: number }) => void;
  resizable?: boolean;
  width?: number;
  height?: number;
  minimized?: boolean;
  maximized?: boolean;
  zIndex?: number;
  focused?: boolean;
}

export function Window({
  id,
  title,
  icon,
  children,
  initialX,
  initialY,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  onFocus,
  onDragEnd,
  onResizeEnd,
  resizable = true,
  width = 600,
  height = 400,
  minimized = false,
  maximized = false,
  zIndex = 50,
  focused = true
}: WindowProps) {
  const { theme } = useApp();
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [savedPosition, setSavedPosition] = useState({ x: initialX, y: initialY });
  const [savedSize, setSavedSize] = useState({ width, height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const latestPosition = useRef({ x: initialX, y: initialY });
  const latestSize = useRef({ width, height });
  const didDrag = useRef(false);
  const didResize = useRef(false);

  useEffect(() => {
    if (maximized) {
      setSavedPosition(position);
      setSavedSize({ width, height });
      latestSize.current = { width, height };
      setPosition({ x: 0, y: 0 });
      latestPosition.current = { x: 0, y: 0 };
    } else {
      setPosition(savedPosition);
      latestPosition.current = savedPosition;
    }
  }, [maximized]);

  const currentWidth = maximized ? window.innerWidth : savedSize.width;
  const currentHeight = maximized ? window.innerHeight - 30 : savedSize.height;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onFocus) onFocus();
    if (maximized || minimized) return;
    if (!windowRef.current) return;

    const target = e.target as HTMLElement;
    if (target.closest('.window-resize-handle')) return;

    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !maximized && !minimized) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - currentWidth));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 30 - currentHeight));
      setPosition({
        x: newX,
        y: newY,
      });
      latestPosition.current = { x: newX, y: newY };
      didDrag.current = true;
      if (!maximized) {
        setSavedPosition({ x: newX, y: newY });
      }
    } else if (isResizing && !maximized && !minimized && resizable) {
      let newWidth = savedSize.width;
      let newHeight = savedSize.height;

      if (resizeDirection?.includes('e')) {
        newWidth = Math.max(200, e.clientX - position.x);
      }
      if (resizeDirection?.includes('s')) {
        newHeight = Math.max(100, e.clientY - position.y);
      }

      setSavedSize({ width: newWidth, height: newHeight });
      latestSize.current = { width: newWidth, height: newHeight };
      didResize.current = true;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
    if (didDrag.current && onDragEnd) {
      onDragEnd({ ...latestPosition.current });
    }
    if (didResize.current && onResizeEnd) {
      onResizeEnd({ ...latestSize.current });
    }
    didDrag.current = false;
    didResize.current = false;
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, maximized, minimized, currentWidth, currentHeight, resizeDirection, position, savedSize]);

  const handleMinimize = () => {
    if (onMinimize) onMinimize();
  };

  const handleMaximize = () => {
    if (maximized && onRestore) {
      onRestore();
    } else if (onMaximize) {
      onMaximize();
    }
  };

  const isXpFamily = theme !== 'win-98';

  if (minimized) {
    return null;
  }

  // XP/Vista/7/WebOS family styles
  if (isXpFamily) {
    const xpClasses = [
      'absolute flex flex-col xp-window',
      maximized ? 'xp-window--maximized' : '',
      focused ? 'xp-window--active' : 'xp-window--inactive',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={windowRef}
        className={xpClasses}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          zIndex,
        }}
        onMouseDownCapture={() => {
          if (onFocus) onFocus();
        }}
      >
        <div className="xp-window__frame">
          <div 
            className="xp-titlebar cursor-move select-none" 
            onMouseDown={handleMouseDown}
            onDoubleClick={handleMaximize}
          >
            <div className="xp-titlebar__title">
              {icon && <img src={icon} alt="" className="xp-titlebar__icon" />}
              <span>{title}</span>
            </div>
            <div className="xp-titlebar__controls">
              <button
                onClick={handleMinimize}
                className="xp-titlebar__button xp-titlebar__button--minimize"
                aria-label="Minimize"
              />
              <button
                onClick={handleMaximize}
                className={`xp-titlebar__button ${maximized ? 'xp-titlebar__button--restore' : 'xp-titlebar__button--maximize'}`}
                aria-label={maximized ? 'Restore' : 'Maximize'}
              />
              <button
                onClick={onClose}
                className="xp-titlebar__button xp-titlebar__button--close"
                aria-label="Close"
              />
            </div>
          </div>

          <div className="xp-window__content xp-window__content--plain">
            <div className="xp-window__surface">{children}</div>
          </div>
        </div>

        {!maximized && resizable && (
          <>
            <div
              className="xp-resize xp-resize--se window-resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            />
            <div
              className="xp-resize xp-resize--e window-resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
            <div
              className="xp-resize xp-resize--s window-resize-handle"
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
          </>
        )}
      </div>
    );
  }

  // Windows 98 styles
  const win98Classes = [
    'absolute win98-window',
    focused ? 'win98-window--active' : 'win98-window--inactive',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={windowRef}
      className={win98Classes}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
        zIndex,
      }}
      onMouseDownCapture={() => {
        if (onFocus) onFocus();
      }}
    >
      <div className="win98-titlebar cursor-move select-none" onMouseDown={handleMouseDown}>
        {icon && <img src={icon} alt="" className="win98-titlebar__icon" />}
        <span className="win98-titlebar__title">{title}</span>
        <div className="win98-titlebar__controls">
          <button
            onClick={handleMinimize}
            className="win98-control-button win98-control-button--minimize"
            aria-label="Minimize"
          />
          <button
            onClick={handleMaximize}
            className={`win98-control-button ${maximized ? 'win98-control-button--restore' : 'win98-control-button--maximize'}`}
            aria-label={maximized ? 'Restore' : 'Maximize'}
          />
          <button
            onClick={onClose}
            className="win98-control-button win98-control-button--close"
            aria-label="Close"
          />
        </div>
      </div>

      <div className="win98-window__content win98-window__content--plain">{children}</div>

      {!maximized && resizable && (
        <div
          className="win98-resize-handle"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
      )}
    </div>
  );
}

