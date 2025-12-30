import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DoomVariantId, doomVariantMap } from './config';

interface DoomPlayerProps {
  variantId: DoomVariantId;
}

export function DoomPlayer({ variantId }: DoomPlayerProps) {
  const { language } = useApp();
  const variant = doomVariantMap[variantId];
  const builds = variant?.builds ?? [];
  const [activeBuildId, setActiveBuildId] = useState(builds[0]?.id ?? 'webgl');

  useEffect(() => {
    setActiveBuildId(builds[0]?.id ?? 'webgl');
  }, [variantId, builds]);

  const activeBuild = useMemo(() => {
    return builds.find((build) => build.id === activeBuildId) ?? builds[0];
  }, [activeBuildId, builds]);

  if (!variant || !activeBuild) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white font-tahoma text-sm">
        {language === 'ru' ? 'Не удалось загрузить конфигурацию DOOM.' : 'Unable to load DOOM config.'}
      </div>
    );
  }

  const isRu = language === 'ru';

  return (
    <div className="flex h-full w-full flex-col bg-[#000] text-white font-tahoma text-xs">
      <header className="px-3 py-2 border-b border-[#272727] bg-[#101010]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-[#f44336] drop-shadow">
              {variant.title}
            </h1>
            {variant.subtitle && (
              <p className="text-[#e0e0e0] text-[11px]">{variant.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {variant.builds.map((build) => (
              <button
                key={build.id}
                onClick={() => setActiveBuildId(build.id)}
                className={`px-3 py-1 rounded border text-[11px] ${
                  build.id === activeBuildId
                    ? 'bg-[#f44336] border-[#ff7961] text-white'
                    : 'bg-[#1b1b1b] border-[#3d3d3d] text-[#d0d0d0] hover:border-[#f44336]'
                }`}
              >
                {build.label}
              </button>
            ))}
            {variant.homepage && (
              <a
                href={variant.homepage}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded border border-[#3d3d3d] text-[#9fd4ff] text-[11px] hover:border-[#9fd4ff]"
              >
                {isRu ? 'Открыть на Emupedia' : 'Open on Emupedia'}
              </a>
            )}
          </div>
        </div>
        <p className="text-[#bcbcbc] mt-2">
          {isRu ? variant.description.ru : variant.description.en}
        </p>
      </header>

      <div className="flex-1 relative bg-black overflow-hidden">
          <iframe
            key={activeBuild.url}
            src={activeBuild.url}
            title={variant.title}
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups"
          />
        <div className="absolute bottom-2 right-4 bg-[#111]/80 px-3 py-2 rounded text-[11px] text-[#ffb400] border border-[#ffb400]/40 shadow-lg max-w-sm">
          {isRu
            ? 'Подсказка: первая загрузка может занять до минуты. Если WebAssembly завис, переключитесь на ASM.js.'
            : 'Tip: first launch can take up to a minute. Switch builds if the WebAssembly version hangs.'}
        </div>
      </div>

      <footer className="bg-[#101010] border-t border-[#272727] px-3 py-2 text-[#bcbcbc] text-[11px] flex justify-between">
        <span>Emupedia / wasm-doom</span>
        <span>{isRu ? 'Все права принадлежат id Software.' : 'All rights belong to id Software.'}</span>
      </footer>
    </div>
  );
}

