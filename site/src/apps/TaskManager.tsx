import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

interface TaskManagerProps {
  windows: Array<{ id: string; title: string }>;
  onEndTask?: (id: string) => void;
}

export function TaskManager({ windows, onEndTask }: TaskManagerProps) {
  const { theme } = useApp();
  const [activeTab, setActiveTab] = useState<'applications' | 'processes' | 'performance'>('applications');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const isXpFamily = theme !== 'win-98';

  const tabs = [
    { id: 'applications' as const, label: 'Applications' },
    { id: 'processes' as const, label: 'Processes' },
    { id: 'performance' as const, label: 'Performance' },
  ];

  return (
    <div className={`w-full h-full flex flex-col ${isXpFamily ? 'bg-[#ece9d8]' : 'bg-[#c0c0c0]'}`}>
      {/* Menu Bar */}
      <div className={`flex items-center px-1 border-b ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
        {['File', 'Options', 'View', 'Help'].map((item) => (
          <button
            key={item}
            className={`px-2 py-0.5 text-xs ${isXpFamily ? 'hover:bg-[#316ac5] hover:text-white' : 'hover:bg-[#000080] hover:text-white'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1 text-sm border-r ${
              activeTab === tab.id
                ? isXpFamily
                  ? 'bg-white border-[#aca899] font-semibold'
                  : 'bg-white border-gray-400 font-bold'
                : isXpFamily
                ? 'bg-[#d4d0c8] border-[#aca899] hover:bg-[#e8e5d8]'
                : 'bg-[#c0c0c0] border-gray-400 hover:bg-[#d8d8d8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        {activeTab === 'applications' && (
          <div className="h-full flex flex-col">
            <div className={`grid grid-cols-2 border-b ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'} text-xs font-bold`}>
              <div className="px-2 py-1 border-r border-[#aca899]">Task</div>
              <div className="px-2 py-1">Status</div>
            </div>
            <div className="flex-1 overflow-auto">
              {windows.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No running applications</div>
              ) : (
                windows.map((window) => (
                  <div
                    key={window.id}
                    onClick={() => setSelectedTask(window.id)}
                    className={`grid grid-cols-2 text-sm cursor-pointer border-b ${
                      selectedTask === window.id
                        ? isXpFamily
                          ? 'bg-[#316ac5] text-white'
                          : 'bg-[#000080] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="px-2 py-1.5 border-r border-gray-200">{window.title}</div>
                    <div className="px-2 py-1.5">Running</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="p-4 text-sm text-gray-600">
            <p className="mb-2 font-semibold">System Processes:</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between border-b pb-1">
                <span>System</span>
                <span>4</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>explorer.exe</span>
                <span>2584</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>svchost.exe</span>
                <span>1024</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>winlogon.exe</span>
                <span>512</span>
              </div>
              {windows.map((window, index) => (
                <div key={window.id} className="flex justify-between border-b pb-1">
                  <span>{window.title.split(' ')[0].toLowerCase()}.exe</span>
                  <span>{3000 + index * 100}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`${isXpFamily ? 'bg-[#ece9d8]' : 'bg-[#c0c0c0]'} p-3 rounded`}>
                <div className="text-xs font-semibold mb-2">CPU Usage</div>
                <div className="text-3xl font-bold text-green-600">8%</div>
              </div>
              <div className={`${isXpFamily ? 'bg-[#ece9d8]' : 'bg-[#c0c0c0]'} p-3 rounded`}>
                <div className="text-xs font-semibold mb-2">Memory Usage</div>
                <div className="text-3xl font-bold text-blue-600">256 MB</div>
              </div>
            </div>
            <div className={`${isXpFamily ? 'bg-[#ece9d8]' : 'bg-[#c0c0c0]'} p-3 rounded text-sm`}>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-mono">512 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-mono">256 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Processes:</span>
                  <span className="font-mono">{24 + windows.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={`flex justify-between items-center p-2 border-t ${isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'}`}>
        <div className="text-xs text-gray-600">
          Processes: {24 + windows.length} | CPU Usage: 8% | Physical Memory: 50%
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => selectedTask && onEndTask?.(selectedTask)}
            disabled={!selectedTask || activeTab !== 'applications'}
            className={`px-4 py-1 text-sm ${
              isXpFamily
                ? 'bg-[#ece9d8] border border-[#aca899] hover:bg-[#dfdbc3] disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            End Task
          </button>
        </div>
      </div>
    </div>
  );
}

