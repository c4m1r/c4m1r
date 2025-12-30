import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';

interface RunDialogProps {
  onClose: () => void;
  onRun: (command: string) => void;
}

export function RunDialog({ onClose, onRun }: RunDialogProps) {
  const { theme } = useApp();
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isXpFamily = theme !== 'win-98';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onRun(command.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[99999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`${
          isXpFamily
            ? 'bg-[#ece9d8] border-t-2 border-l-2 border-[#ffffff] border-r-2 border-b-2 border-r-[#5a5a5a] border-b-[#5a5a5a] shadow-2xl'
            : 'bg-[#c0c0c0] border-2 border-white border-b-black border-r-black shadow-lg'
        } w-[420px]`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Title Bar */}
        <div
          className={`${
            isXpFamily
              ? 'bg-gradient-to-r from-[#0054e3] to-[#0a5fef] text-white'
              : 'bg-gradient-to-r from-[#000080] to-[#1084d0] text-white'
          } px-2 py-1 flex items-center justify-between cursor-move`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Run</span>
          </div>
          <button
            onClick={onClose}
            className={`${
              isXpFamily
                ? 'w-4 h-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold'
                : 'w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black text-black text-xs font-bold'
            } flex items-center justify-center`}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-4xl">🏃</div>
            <div className="flex-1">
              <p className="text-sm mb-4">
                Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
              </p>
              <div className="mb-2">
                <label className="text-xs font-semibold block mb-1">Open:</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className={`w-full ${
                    isXpFamily
                      ? 'border border-[#7f9db9] px-2 py-1'
                      : 'border-2 border-[#808080] border-t-black border-l-black px-1 py-0.5'
                  } outline-none text-sm`}
                  placeholder="notepad"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className={`px-6 py-1.5 text-sm ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#003c74] hover:bg-[#d8d5c8] active:border-black'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] active:border-black active:border-b-white active:border-r-white'
              }`}
            >
              OK
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-1.5 text-sm ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#aca899] hover:bg-[#d8d5c8]'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] active:border-black active:border-b-white active:border-r-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-6 py-1.5 text-sm ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#aca899] opacity-50 cursor-not-allowed'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] opacity-50 cursor-not-allowed'
              }`}
              disabled
            >
              Browse...
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

