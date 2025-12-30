/**
 * Универсальный Desktop компонент
 * Используется всеми темами
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { ThemeId } from '../../contexts/AppContext';

interface DesktopProps {
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
}

export function Desktop({ onSystemCommand }: DesktopProps) {
  const { theme } = useApp();

  return (
    <div className={`desktop theme-${theme}`}>
      <div className="desktop-content">
        <h1>Desktop - Theme: {theme}</h1>
        <p>Универсальный Desktop компонент для всех тем</p>
      </div>
    </div>
  );
}

