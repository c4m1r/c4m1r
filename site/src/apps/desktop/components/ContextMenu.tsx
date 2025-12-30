/**
 * Универсальное контекстное меню
 * Используется для правого клика на иконках, рабочем столе и в окнах
 */

import { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export interface ContextMenuItem {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  icon?: string;
  submenu?: ContextMenuItem[];
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-400 shadow-lg z-[10000] min-w-[160px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        fontFamily: '"Pixelated MS Sans Serif", Arial',
        fontSize: '11px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={index}
              className="h-px bg-gray-300 my-1 mx-2"
            />
          );
        }

        return (
          <button
            key={index}
            onClick={() => {
              if (item.onClick && !item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full text-left px-3 py-1 flex items-center gap-2 hover:bg-[#000080] hover:text-white disabled:text-gray-400 disabled:cursor-not-allowed ${
              item.disabled ? '' : 'cursor-pointer'
            }`}
            style={{
              fontFamily: '"Pixelated MS Sans Serif", Arial',
              fontSize: '11px',
            }}
          >
            {item.icon && <img src={item.icon} alt="" className="w-4 h-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

