import { useState } from 'react';
import profileGif from '../../themes/winxp/assets/avatars/profile.gif';
import cvData from '../../content/cv/cv-data.json';
import { useApp } from '../../contexts/AppContext';
import type { Language } from '../../i18n/translations';

type TabId = 'education' | 'it' | 'gamedev';

interface CvSectionEntry {
  title: string;
  subtitle?: string;
  year?: string;
  details?: string[];
}

type CvDataShape = Record<TabId, CvSectionEntry[]>;

const TAB_LABELS: Record<TabId, Record<Language, string>> = {
  education: {
    en: 'Education',
    ru: 'Образование',
    fr: 'Formation',
    es: 'Educación',
    zh: '教育',
    ja: '学歴',
    ko: '학력',
  },
  it: {
    en: 'IT',
    ru: 'IT',
    fr: 'IT',
    es: 'IT',
    zh: 'IT',
    ja: 'IT',
    ko: 'IT',
  },
  gamedev: {
    en: 'GameDev',
    ru: 'GameDev',
    fr: 'GameDev',
    es: 'GameDev',
    zh: 'GameDev',
    ja: 'GameDev',
    ko: 'GameDev',
  },
  rewards: {
    en: 'Rewards',
    ru: 'Rewards',
    fr: 'Rewards',
    es: 'Rewards',
    zh: 'Rewards',
    ja: 'Rewards',
    ko: 'Rewards',
  },
};

const tabs: TabId[] = ['education', 'it', 'gamedev', 'rewards'];

export function MyCV() {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('education');
  const localizedData =
    (cvData as Record<string, CvDataShape>)[language] ??
    (cvData as Record<string, CvDataShape>).en;
  const entries = localizedData[activeTab] ?? [];

  return (
    <div className="w-full h-full bg-[#ece9d8] text-[#1b1b1b] font-tahoma text-[13px] overflow-auto">
      <div className="flex items-center gap-4 border-b border-[#b4b1a6] bg-white/70 px-5 py-4 shadow-inner">
        <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center border-2 border-[#5e5e5e] shadow-inner">
          <img src={profileGif} alt="Profile" className="w-20 h-20 rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-tight">C4m1r</h1>
          <p className="text-sm text-[#2b4ca3] font-semibold">IT Engineer / Indie Game Architect</p>
          <p className="text-xs text-[#555]">WebOS by C4m1r · XP Experience Pack</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                activeTab === tab
                  ? 'bg-[#1f62d0] text-white border-[#124291]'
                  : 'bg-[#f7f4ef] text-[#1f1f1f] border-[#c7c4bd] hover:bg-white'
              }`}
            >
              {TAB_LABELS[tab][language] ?? TAB_LABELS[tab].en}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-6">
          {entries.map((entry, index) => (
            <div
              key={`${entry.title}-${index}`}
              className="bg-white/90 border border-[#cbc7bd] rounded-lg px-4 py-3 shadow-sm"
            >
              <div className="flex justify-between items-baseline gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#0a3c97]">{entry.title}</h2>
                  {entry.subtitle && <p className="text-xs text-[#565656]">{entry.subtitle}</p>}
                </div>
                {entry.year && <span className="text-[11px] text-[#1d1d1d] font-semibold">{entry.year}</span>}
              </div>
              {entry.details && (
                <ul className="mt-2 text-xs text-[#2b2b2b] space-y-1 list-disc list-inside">
                  {entry.details.map((detail, detailIndex) => (
                    <li key={detailIndex}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

