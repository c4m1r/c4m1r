import { useApp } from '../../contexts/AppContext';

interface ErrorDialogProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({ title = 'Error', message, onClose }: ErrorDialogProps) {
  const { theme } = useApp();
  const isXpFamily = theme !== 'win-98';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[99999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      <div
        className={`${
          isXpFamily
            ? 'bg-[#ece9d8] shadow-2xl'
            : 'bg-[#c0c0c0] shadow-lg'
        } w-[400px] border-2 ${
          isXpFamily
            ? 'border-t-white border-l-white border-r-[#5a5a5a] border-b-[#5a5a5a]'
            : 'border-white border-b-black border-r-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div
          className={`${
            isXpFamily
              ? 'bg-gradient-to-r from-[#0054e3] via-[#0a5fef] to-[#0866f5] text-white'
              : 'bg-gradient-to-r from-[#000080] to-[#1084d0] text-white'
          } px-2 py-1 flex items-center justify-between select-none`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">⚠️</span>
            <span className="text-sm font-bold">{title}</span>
          </div>
          <button
            onClick={onClose}
            className={`${
              isXpFamily
                ? 'w-5 h-5 bg-[#d6544d] hover:bg-[#e06055] text-white text-xs font-bold rounded-sm'
                : 'w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black text-black text-xs font-bold'
            } flex items-center justify-center transition-colors`}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3 mb-6">
            {/* Error Icon */}
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isXpFamily 
                  ? 'bg-red-100 border-2 border-red-500'
                  : 'bg-red-200 border border-red-600'
              }`}>
                <span className="text-2xl">✖</span>
              </div>
            </div>

            {/* Message */}
            <div className="flex-1 pt-2">
              <p className={`text-sm ${isXpFamily ? 'text-gray-900' : 'text-black'}`}>
                {message}
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className={`px-12 py-1.5 text-sm font-semibold min-w-[90px] ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#003c74] hover:bg-[#dfdbc3] active:border-2'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] active:border-black active:border-b-white active:border-r-white'
              } transition-colors`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

