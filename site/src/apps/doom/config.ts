const EMUPEDIA_BASE = 'https://emupedia.net/beta/emuos';

export type DoomVariantId = 'doom1' | 'doom2' | 'doom3';

export interface DoomVariantBuild {
  id: 'asmjs' | 'wasm' | 'webgl';
  label: string;
  url: string;
}

export interface DoomVariant {
  id: DoomVariantId;
  title: string;
  subtitle?: string;
  icon: string;
  homepage?: string;
  description: {
    ru: string;
    en: string;
  };
  builds: DoomVariantBuild[];
  window: {
    width: number;
    height: number;
  };
}

const desktopIcon = (name: string) =>
  `${EMUPEDIA_BASE}/assets/images/icons/desktop/${name}.png`;

export const doomVariants: DoomVariant[] = [
  {
    id: 'doom1',
    title: 'Doom (1993)',
    subtitle: 'Ultimate Doom',
    icon: desktopIcon('doom1'),
    homepage: `${EMUPEDIA_BASE}/emupedia-game-doom1/`,
    description: {
      ru: 'Классический Doom с поддержкой ASM.js и WebAssembly портов wasm-doom.',
      en: 'Classic Doom running via wasm-doom with both ASM.js and WebAssembly builds.',
    },
    builds: [
      {
        id: 'asmjs',
        label: 'ASM.js',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom1/asmjs/`,
      },
      {
        id: 'wasm',
        label: 'WebAssembly',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom1/`,
      },
    ],
    window: {
      width: 960,
      height: 640,
    },
  },
  {
    id: 'doom2',
    title: 'Doom II: Hell on Earth',
    icon: desktopIcon('doom2'),
    homepage: `${EMUPEDIA_BASE}/emupedia-game-doom2/`,
    description: {
      ru: 'Продолжение Doom с поддержкой wasm-doom. Доступны ASM.js и WebAssembly версии.',
      en: 'Sequel to Doom powered by wasm-doom with ASM.js and WebAssembly builds.',
    },
    builds: [
      {
        id: 'asmjs',
        label: 'ASM.js',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom2/asmjs/`,
      },
      {
        id: 'wasm',
        label: 'WebAssembly',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom2/`,
      },
    ],
    window: {
      width: 960,
      height: 640,
    },
  },
  {
    id: 'doom3',
    title: 'Doom 3 (d3wasm)',
    icon: desktopIcon('doom3'),
    homepage: `${EMUPEDIA_BASE}/emupedia-game-doom3/`,
    description: {
      ru: 'Экспериментальный порт Doom 3 на WebAssembly (d3wasm). Может загружаться дольше.',
      en: 'Experimental Doom 3 port using d3wasm. Loading can take a while.',
    },
    builds: [
      {
        id: 'webgl',
        label: 'WebGL',
        url: `${EMUPEDIA_BASE}/emupedia-game-doom3/`,
      },
    ],
    window: {
      width: 1024,
      height: 720,
    },
  },
];

export const doomVariantMap: Record<DoomVariantId, DoomVariant> = doomVariants.reduce(
  (acc, variant) => {
    acc[variant.id] = variant;
    return acc;
  },
  {} as Record<DoomVariantId, DoomVariant>,
);

