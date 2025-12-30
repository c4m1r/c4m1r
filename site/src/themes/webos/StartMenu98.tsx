import { Folder, Star, FileText, Settings, Search, HelpCircle, Play, LogOut, Power } from 'lucide-react';

interface StartMenu98Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

export function StartMenu98({ onClose, onSystemCommand, onHover }: StartMenu98Props) {
  const menuItems = [
    { label: 'Programs', icon: <Folder size={16} /> },
    { label: 'Favorites', icon: <Star size={16} /> },
    { label: 'Documents', icon: <FileText size={16} /> },
    { label: 'Settings', icon: <Settings size={16} /> },
    { label: 'Find', icon: <Search size={16} /> },
    { label: 'Help', icon: <HelpCircle size={16} /> },
    { label: 'Run...', icon: <Play size={16} /> },
    { label: 'Log Off...', icon: <LogOut size={16} />, action: 'logoff' as const },
    { label: 'Shut Down...', icon: <Power size={16} />, action: 'shutdown' as const },
  ];

  return (
    <div 
      className="absolute bottom-[32px] left-1 w-48 flex z-50"
      style={{
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ffffff #000000 #000000 #ffffff',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Windows 98 Sidebar */}
      <div 
        className="w-8 flex items-end justify-center pb-2"
        style={{
          background: '#000080',
        }}
      >
        <span 
          className="text-white font-bold text-lg transform -rotate-90 whitespace-nowrap tracking-widest"
          style={{
            fontFamily: 'MS Sans Serif, sans-serif',
          }}
        >
          Windows<span className="font-normal">98</span>
        </span>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-1">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full text-left px-2 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 text-sm transition-colors"
            style={{
              fontFamily: 'MS Sans Serif, sans-serif',
            }}
            onClick={() => {
              if (item.action) {
                onSystemCommand?.(item.action);
              }
              onClose();
            }}
            onMouseEnter={onHover}
          >
            <div className="w-4 h-4 flex items-center justify-center text-gray-700">
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

