/**
 * WebOS MyComputer - экспортирует универсальный MyComputer
 * TODO: В будущем переместить полную реализацию в apps/explorer
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import folderIcon from '../winxp/assets/icons/folder_plain.png';
import computerIcon from '../winxp/assets/icons/mycomputer.png';
import searchIconXp from '../winxp/assets/icons/toolbar/search.png';
import foldersToggleIcon from '../winxp/assets/icons/toolbar/folders.png';
import viewIconsIcon from '../winxp/assets/icons/toolbar/view.png';
import viewDetailsIcon from '../winxp/assets/icons/toolbar/text_size.png';
import backIcon from '../winxp/assets/icons/toolbar/back.png';
import forwardIcon from '../winxp/assets/icons/toolbar/forward.png';
import upIcon from '../winxp/assets/icons/toolbar/folder_up.png';
import { getItemsFromPath, getFileIcon, FileSystemItem, initialFileSystem } from '../../utils/FileSystem';

interface MyComputerProps {
  currentPath?: string;
  onOpenItem?: (item: FileSystemItem, parentPath: string) => void;
}

export function MyComputer({ currentPath = 'C:\\', onOpenItem }: MyComputerProps) {
  const { theme } = useApp();
  const [path, setPath] = useState(currentPath);
  const [history, setHistory] = useState<string[]>([currentPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(currentPath);
  const [viewMode, setViewMode] = useState<'icons' | 'details'>('icons');
  const [showSidebar, setShowSidebar] = useState(true);
  const isXpFamily = theme !== 'win-98';

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tasks: true,
    places: true,
    details: true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  useEffect(() => {
    setPath(currentPath);
    setHistory([currentPath]);
    setHistoryIndex(0);
    setAddressInput(currentPath);
    setSelectedItem(null);
  }, [currentPath]);

  useEffect(() => {
    setAddressInput(path);
  }, [path]);

  const items = useMemo(() => getItemsFromPath(path), [path]);

  const navigateToPath = useCallback(
    (targetPath: string, recordHistory: boolean = true) => {
      const normalized = targetPath.replace('Local Disk (C:)', 'C:');
      setPath(normalized);
      setSelectedItem(null);

      if (recordHistory) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(normalized);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    },
    [history, historyIndex]
  );

  const handleNavigate = (item: FileSystemItem) => {
    if (item.type === 'folder' || item.type === 'drive') {
      let newPath = path;
      if (item.name === 'Local Disk (C:)') newPath = 'C:';
      else if (path === 'My Computer') newPath = item.name === 'Local Disk (C:)' ? 'C:' : item.name;
      else if (path.endsWith('\\') || path.endsWith(':')) newPath += item.name;
      else newPath += '\\' + item.name;

      newPath = newPath.replace('Local Disk (C:)', 'C:');
      navigateToPath(newPath);
    } else if (item.type === 'file') {
      if (onOpenItem) {
        onOpenItem(item, path);
      }
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPath(history[historyIndex - 1]);
      setSelectedItem(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPath(history[historyIndex + 1]);
      setSelectedItem(null);
    }
  };

  const handleUp = () => {
    let newPath = path;

    if (path === 'C:' || path === 'C:\\') {
      newPath = 'My Computer';
    } else if (path !== 'My Computer') {
      const parts = path.split('\\');
      parts.pop();
      newPath = parts.join('\\') || 'My Computer';
    } else {
      return;
    }

    navigateToPath(newPath);
  };

  const resolveNodeByPath = (target: string): FileSystemItem | null => {
    if (target === 'My Computer') {
      return initialFileSystem['My Computer'];
    }

    const normalized = target.replace('Local Disk (C:)', 'C:').replace(/\//g, '\\');
    const parts = normalized.split('\\').filter(Boolean);
    let current: FileSystemItem | undefined = initialFileSystem['My Computer'];

    for (const part of parts) {
      if (!current || !current.children) {
        return null;
      }

      if (current.children[part]) {
        current = current.children[part];
        continue;
      }

      const match = Object.values(current.children).find(child => child.name === part);
      if (!match) {
        return null;
      }
      current = match;
    }

    return current ?? null;
  };

  const pathExists = (target: string) => {
    if (target === 'My Computer') return true;
    const normalized = target.replace(/\//g, '\\');
    return Boolean(resolveNodeByPath(normalized));
  };

  const handleAddressSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const target = addressInput.trim();
    if (!target) return;

    if (!pathExists(target)) {
      console.warn(`Path "${target}" not found in virtual file system`);
      setAddressInput(path);
      return;
    }

    const normalized = target.replace(/\//g, '\\');
    const node = resolveNodeByPath(normalized);

    if (!node) {
      setAddressInput(path);
      return;
    }

    if (node.type === 'file') {
      const parts = normalized.split('\\');
      const fileName = parts.pop();
      const parentPath = parts.join('\\') || 'My Computer';
      if (fileName && onOpenItem) {
        const parentItems = getItemsFromPath(parentPath);
        const fileItem = parentItems.find(item => item.name === fileName);
        if (fileItem) {
          onOpenItem(fileItem, parentPath);
        }
      }
      return;
    }

    navigateToPath(normalized);
  };

  const detailsForSelection = useMemo(() => {
    if (!selectedItem) return null;
    const item = items.find(i => i.name === selectedItem);
    if (!item) return null;
    const getTypeLabel = () => {
      switch (item.type) {
        case 'folder':
          return 'File Folder';
        case 'drive':
          return 'Drive';
        case 'file':
          return 'File';
        default:
          return 'Item';
      }
    };
    return {
      name: item.name,
      type: getTypeLabel(),
      size: item.size || '',
    };
  }, [items, selectedItem]);

  return (
    <div className="flex flex-col h-full bg-white font-tahoma text-xs select-none">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-[#aca899]">
        {/* Menu Bar */}
        <div className="flex items-center px-1 bg-[#ece9d8] border-b border-[#aca899]">
          {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((item) => (
            <button key={item} className="px-2 py-1 hover:bg-[#316ac5] hover:text-white transition-colors cursor-default">
              {item}
            </button>
          ))}
        </div>

        {/* Standard Buttons */}
        <div className="flex items-center p-1 bg-[#ece9d8] gap-1 border-b border-[#aca899]">
          <button onClick={handleBack} disabled={historyIndex === 0} className="flex items-center gap-1 px-2 py-1 rounded hover:border border-transparent hover:border-gray-400 hover:bg-white/50 disabled:opacity-50 disabled:grayscale">
            <img src={backIcon} alt="" className="w-5 h-5" />
            <span className="text-black">Back</span>
          </button>
          <button onClick={handleForward} disabled={historyIndex >= history.length - 1} className="flex items-center gap-1 px-2 py-1 rounded hover:border border-transparent hover:border-gray-400 hover:bg-white/50 disabled:opacity-50 disabled:grayscale">
            <img src={forwardIcon} alt="" className="w-5 h-5" />
            <span className="text-black">Forward</span>
          </button>
          <button onClick={handleUp} className="flex items-center gap-1 px-2 py-1 rounded hover:border border-transparent hover:border-gray-400 hover:bg-white/50">
            <img src={upIcon} alt="" className="w-5 h-5" />
            <span className="text-black">Up</span>
          </button>
          <div className="w-px h-8 bg-gray-300 mx-1" />
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:border border-transparent hover:border-gray-400 hover:bg-white/50">
            <img src={searchIconXp} alt="" className="w-4 h-4" />
            <span className="text-black">Search</span>
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-gray-400 hover:bg-white/50 ${showSidebar ? 'bg-white/60 border-gray-400' : ''}`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <img src={foldersToggleIcon} alt="" className="w-4 h-4" />
            <span className="text-black">Folders</span>
          </button>
          <div className="w-px h-8 bg-gray-300 mx-1" />
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-gray-400 hover:bg-white/50 ${viewMode === 'icons' ? 'bg-white/60 border-gray-400' : ''}`}
            onClick={() => setViewMode('icons')}
          >
            <img src={viewIconsIcon} alt="" className="w-4 h-4" />
            <span className="text-black">Icons</span>
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-gray-400 hover:bg-white/50 ${viewMode === 'details' ? 'bg-white/60 border-gray-400' : ''}`}
            onClick={() => setViewMode('details')}
          >
            <img src={viewDetailsIcon} alt="" className="w-4 h-4" />
            <span className="text-black">Details</span>
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex items-center p-1 bg-[#ece9d8] gap-2">
          <span className="text-gray-500">Address</span>
          <div className="flex-1 bg-white border border-[#7f9db9] flex items-center px-1 h-5 shadow-inner">
            <img src={path === 'My Computer' ? computerIcon : folderIcon} className="w-4 h-4 mr-2" alt="" />
            <input
              type="text"
              value={addressInput}
              onChange={(event) => setAddressInput(event.target.value)}
              onKeyDown={handleAddressSubmit}
              className="w-full outline-none text-xs text-black"
            />
          </div>
          <button
            className="flex items-center gap-1 px-2 py-0.5 bg-[#ece9d8] border border-gray-400 rounded hover:bg-white text-black"
            onClick={() => {
              const fakeEvent = { key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>;
              handleAddressSubmit(fakeEvent);
            }}
          >
            Go
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden h-0">
        {/* Sidebar */}
    {isXpFamily && showSidebar && (
          <div className="w-48 bg-[#7ba2e7] overflow-y-auto p-3 flex flex-col gap-3" style={{
            background: 'linear-gradient(to bottom, #7ba2e7 0%, #6375d6 100%)'
          }}>
            {/* File and Folder Tasks */}
            <div className="rounded overflow-hidden">
              <div
                className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup('tasks')}
              >
                <span className="font-bold text-[#215dc6]">File and Folder Tasks</span>
                {expandedGroups.tasks ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
              </div>
              {expandedGroups.tasks && (
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 border-x border-b border-white/50">
                  <button className="text-left hover:underline text-[#215dc6] flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#215dc6] rounded-full" /> Make a new folder
                  </button>
                  <button className="text-left hover:underline text-[#215dc6] flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#215dc6] rounded-full" /> Share this folder
                  </button>
                </div>
              )}
            </div>

            {/* Other Places */}
            <div className="rounded overflow-hidden">
              <div
                className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup('places')}
              >
                <span className="font-bold text-[#215dc6]">Other Places</span>
                {expandedGroups.places ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
              </div>
              {expandedGroups.places && (
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 border-x border-b border-white/50">
                  <button onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\Desktop')} className="text-left hover:underline text-[#215dc6] flex items-center gap-2">
                    <img src={folderIcon} className="w-4 h-4" alt="" /> Desktop
                  </button>
                  <button onClick={() => navigateToPath('My Computer')} className="text-left hover:underline text-[#215dc6] flex items-center gap-2">
                    <img src={computerIcon} className="w-4 h-4" alt="" /> My Computer
                  </button>
                  <button onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents')} className="text-left hover:underline text-[#215dc6] flex items-center gap-2">
                    <img src={folderIcon} className="w-4 h-4" alt="" /> My Documents
                  </button>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="rounded overflow-hidden">
              <div
                className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup('details')}
              >
                <span className="font-bold text-[#215dc6]">Details</span>
                {expandedGroups.details ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
              </div>
              {expandedGroups.details && (
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 border-x border-b border-white/50 text-[#215dc6]">
                  <div className="font-bold">{path === 'My Computer' ? 'My Computer' : path.split('\\').pop()}</div>
                  <div>System Folder</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white p-4 overflow-y-auto" onClick={() => setSelectedItem(null)}>
          {viewMode === 'icons' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center group cursor-pointer border border-transparent p-1 ${selectedItem === item.name ? 'bg-[#316ac5] bg-opacity-20 border-[#316ac5] border-opacity-30' : 'hover:bg-gray-100'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item.name);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item);
                  }}
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-1">
                    <img
                      src={getFileIcon(item) as string}
                      alt={item.name}
                      className={`max-w-full max-h-full drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <span className={`text-center text-xs px-1 rounded break-words w-full ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#ece9d8] text-[#215dc6] uppercase text-[11px]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold w-32">Type</th>
                  <th className="px-3 py-2 font-semibold w-32">Size</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className={`cursor-pointer text-sm ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'hover:bg-[#e2ecff]'}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedItem(item.name);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      handleNavigate(item);
                    }}
                  >
                    <td className="px-3 py-1.5 flex items-center gap-2">
                      <img
                        src={getFileIcon(item) as string}
                        alt={item.name}
                        className="w-5 h-5"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="px-3 py-1.5 text-[#215dc6]">
                      {item.type === 'folder'
                        ? 'File Folder'
                        : item.type === 'drive'
                          ? 'Drive'
                          : item.type === 'file'
                            ? 'File'
                            : 'Item'}
                    </td>
                    <td className="px-3 py-1.5">{item.size || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#aca899] px-2 py-0.5 text-[11px] text-black flex gap-4 justify-between shadow-inner">
        <div className="flex gap-4">
          <span>{items.length} objects</span>
          {selectedItem && <span>Selected: {selectedItem}</span>}
        </div>
        {detailsForSelection && (
          <div className="flex gap-3 text-[#215dc6]">
            <span>{detailsForSelection.type}</span>
            {detailsForSelection.size && <span>{detailsForSelection.size}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
