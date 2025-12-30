import { useApp } from '../../contexts/AppContext';
import { doomVariants, DoomVariantId } from '../doom/config';

interface GamesFolderProps {
  onLaunch: (variant: DoomVariantId) => void;
}

export function GamesFolder({ onLaunch }: GamesFolderProps) {
  const { language } = useApp();
  const isRu = language === 'ru';

  return (
    <div className="flex flex-col h-full bg-[#ffffff] text-xs font-tahoma text-[#1a1a1a]">
      <header className="px-4 py-3 border-b border-[#b5b2a9] bg-[#f0ede3]">
        <h2 className="text-base font-semibold text-[#0f3fa6]">
          {isRu ? 'Игры — коллекция DOOM' : 'Games — DOOM Collection'}
        </h2>
        <p className="text-[#4a4a4a] mt-1">
          {isRu
            ? 'Выберите нужную версию DOOM. Все запускаются в iframe прямо с emupedia.net.'
            : 'Pick the DOOM build you want to launch. Everything runs directly from emupedia.net.'}
        </p>
      </header>

      <div className="flex-1 overflow-auto p-4 grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 bg-[#e7eefc]">
        {doomVariants.map((variant) => (
          <article
            key={variant.id}
            className="flex flex-col bg-white border border-[#c2d0f3] rounded-lg shadow-inner shadow-[#d2defa] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5ebfb] bg-gradient-to-r from-white to-[#edf2ff]">
              <img
                src={variant.icon}
                alt={variant.title}
                className="w-10 h-10 object-contain drop-shadow"
                loading="lazy"
              />
              <div>
                <h3 className="text-sm font-semibold text-[#0f3fa6]">{variant.title}</h3>
                {variant.subtitle && <p className="text-[11px] text-[#4a4a4a]">{variant.subtitle}</p>}
              </div>
            </div>

            <p className="px-4 py-3 text-[11px] text-[#333] flex-1">
              {isRu ? variant.description.ru : variant.description.en}
            </p>

            <div className="px-4 pb-4 flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {variant.builds.map((build) => (
                  <span
                    key={build.id}
                    className="px-2 py-0.5 text-[10px] uppercase tracking-wide border border-[#c2d0f3] text-[#0f3fa6] bg-[#edf2ff]"
                  >
                    {build.label}
                  </span>
                ))}
              </div>
              <button
                className="mt-1 px-3 py-2 bg-[#3b6dd8] text-white text-xs font-semibold rounded shadow hover:bg-[#2b55b0]"
                onClick={() => onLaunch(variant.id)}
              >
                {isRu ? 'Запустить' : 'Launch'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

