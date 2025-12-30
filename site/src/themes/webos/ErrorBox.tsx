import { useEffect } from 'react';
import errorSoundSrc from '../winxp/assets/sounds/error.wav';
import errorIcon from '../winxp/assets/icons/897(32x32).png';

interface ErrorBoxProps {
  onClose: () => void;
  message?: string;
}

function lineBreak(str: string) {
  return str.split('\n').map((s, i) => (
    <p key={i} className="text-gray-800 leading-4 mb-1">
      {s}
    </p>
  ));
}

export function ErrorBox({ onClose, message = "Something's wrong!" }: ErrorBoxProps) {
  useEffect(() => {
    try {
      const audio = new Audio(errorSoundSrc);
      audio.play().catch((e) => {
        console.log('Error playing sound:', e);
      });
    } catch (e) {
      console.log('Error initializing audio:', e);
    }
  }, []);

  return (
    <div className="bg-[#f5f5f5] w-full h-full text-[11px] p-3 flex flex-col">
      <div className="flex flex-1">
        <img src={errorIcon} alt="error" className="w-[30px] h-[30px] flex-shrink-0" />
        <div className="px-5 pb-3 pt-0.5">
          {lineBreak(message)}
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div 
          onClick={onClose} 
          className="w-20 h-[22px] flex border border-black justify-center items-center cursor-pointer"
          style={{
            boxShadow: 'inset -1px -1px 1px black'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = 'inset 1px 1px 1px black';
            const span = e.currentTarget.querySelector('span');
            if (span) {
              span.style.transform = 'translate(1px, 1px)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = 'inset -1px -1px 1px black';
            const span = e.currentTarget.querySelector('span');
            if (span) {
              span.style.transform = 'translate(0, 0)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'inset -1px -1px 1px black';
            const span = e.currentTarget.querySelector('span');
            if (span) {
              span.style.transform = 'translate(0, 0)';
            }
          }}
        >
          <span className="leading-[11px]">OK</span>
        </div>
      </div>
    </div>
  );
}

