import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { resolveAsset } from '../../utils/assetResolver';

interface TrackDefinition {
  title: string;
  artist: string;
  album?: string;
  duration: string;
  sources: {
    local?: string;
    fallback: string;
  };
  cover?: {
    local?: string;
    fallback?: string;
  };
}

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration: string;
  url: string;
  cover: string;
}

const DEFAULT_COVER_FALLBACK = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=80';

const trackDefinitions: TrackDefinition[] = [
  {
    title: 'Star Commander',
    artist: 'Scott Buckley',
    album: 'Production Music',
    duration: '3:16',
    sources: {
      local: '/sounds/wmp/star-commander.mp3',
      fallback:
        'https://cdn.pixabay.com/download/audio/2023/01/17/audio_ca354dffd5.mp3?filename=star-commander-13465.mp3',
    },
    cover: {
      local: '/images/wmp/star-commander.jpg',
      fallback: DEFAULT_COVER_FALLBACK,
    },
  },
  {
    title: 'Artificial Intelligence',
    artist: 'RomanSenykMusic',
    duration: '2:52',
    sources: {
      local: '/sounds/wmp/artificial-intelligence.mp3',
      fallback:
        'https://cdn.pixabay.com/download/audio/2022/02/07/audio_47b381229f.mp3?filename=artificial-intelligence-110877.mp3',
    },
    cover: {
      local: '/images/wmp/artificial-intelligence.jpg',
      fallback: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=320&q=80',
    },
  },
  {
    title: 'Floating Abstract',
    artist: 'AudioCoffee',
    duration: '4:12',
    sources: {
      local: '/sounds/wmp/floating-abstract.mp3',
      fallback:
        'https://cdn.pixabay.com/download/audio/2022/03/15/audio_79feca2bd4.mp3?filename=floating-abstract-142819.mp3',
    },
    cover: {
      local: '/images/wmp/floating-abstract.jpg',
      fallback: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=320&q=80',
    },
  },
];

const fallbackTracks: Track[] = trackDefinitions.map((track) => ({
  title: track.title,
  artist: track.artist,
  album: track.album,
  duration: track.duration,
  url: track.sources.fallback,
  cover: track.cover?.fallback ?? DEFAULT_COVER_FALLBACK,
}));

export function WindowsMediaPlayer() {
  const [tracks, setTracks] = useState<Track[]>(fallbackTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveTracks = async () => {
      const resolved = await Promise.all(
        trackDefinitions.map(async (track) => {
          const url = await resolveAsset(track.sources.local, track.sources.fallback);
          const cover = await resolveAsset(track.cover?.local, track.cover?.fallback ?? DEFAULT_COVER_FALLBACK);

          return {
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            url,
            cover,
          } satisfies Track;
        })
      );

      if (!cancelled) {
        setTracks(resolved);
      }
    };

    resolveTracks();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((index) => {
      if (tracks.length === 0) {
        return index;
      }
      return (index + 1) % tracks.length;
    });
  }, [tracks.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((index) => {
      if (tracks.length === 0) {
        return index;
      }
      return (index - 1 + tracks.length) % tracks.length;
    });
  }, [tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!audio.duration) {
        setProgress(0);
      } else {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(0);
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => undefined);
    }
  }, [currentIndex, tracks, isPlaying]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play().catch(() => undefined);
      setIsPlaying(true);
    }
  };

  const currentTrack = tracks[currentIndex] ?? tracks[0] ?? fallbackTracks[0];

  const formattedTime = useMemo(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return '00:00 / 00:00';
    const currentMinutes = Math.floor(audio.currentTime / 60)
      .toString()
      .padStart(2, '0');
    const currentSeconds = Math.floor(audio.currentTime % 60)
      .toString()
      .padStart(2, '0');
    const totalMinutes = Math.floor(audio.duration / 60)
      .toString()
      .padStart(2, '0');
    const totalSeconds = Math.floor(audio.duration % 60)
      .toString()
      .padStart(2, '0');
    return `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`;
  }, [progress]);

  return (
    <div className="flex h-full w-full flex-col bg-[#dfe7f6] text-xs font-tahoma text-[#15396b]">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b2d66] to-[#15498d] text-white border-b border-[#0b2146]">
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-wide">Windows Media Player</span>
          <span className="text-[11px] text-[#bcd1f2]">Now Playing: {currentTrack.title}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#bcd1f2]">Visualization:</span>
          <span className="bg-[#0b2d66] px-2 py-1 rounded border border-white/20">
            Battery — Spectrogram
          </span>
        </div>
      </header>

      <main className="flex flex-1 gap-4 px-4 py-4">
        <section className="w-60 flex-shrink-0 flex flex-col items-center gap-3">
          <div className="w-full aspect-square rounded-lg overflow-hidden shadow-md border border-white/60 bg-[#0b2d66]/40 flex items-center justify-center">
            {currentTrack?.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_COVER_FALLBACK;
                }}
              />
            ) : (
              <div className="text-white text-sm">No Artwork</div>
            )}
          </div>
          <div className="w-full bg-white/60 border border-white/80 rounded px-3 py-2">
            <h2 className="font-semibold text-[#0b2d66] text-sm">{currentTrack.title}</h2>
            <p className="text-[#305ca8] text-[11px]">{currentTrack.artist}</p>
            {currentTrack.album && (
              <p className="text-[#4e7fd4] text-[10px] uppercase tracking-wide">
                {currentTrack.album}
              </p>
            )}
          </div>
        </section>

        <section className="flex-1 flex flex-col gap-3">
          <div className="bg-white border border-[#c5d4f2] rounded shadow-inner px-3 py-2">
            <div className="flex items-center justify-between text-[11px] mb-2 text-[#0b2d66]">
              <span>Media Library</span>
              <span>{formattedTime}</span>
            </div>
            <div className="w-full h-2 bg-[#c5d4f2] rounded overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#0b2d66] to-[#47a0ff]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-4 text-[13px] text-[#0b2d66]">
              <button
                onClick={handlePrevious}
                className="px-3 py-1 rounded border border-[#0b2d66] bg-white hover:bg-[#dfe7f6]"
              >
                ⏮
              </button>
              <button
                onClick={handlePlayPause}
                className="px-4 py-2 rounded-full border border-[#0b2d66] bg-[#0b2d66] text-white shadow hover:bg-[#15498d]"
              >
                {isPlaying ? '⏸' : '▶️'}
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1 rounded border border-[#0b2d66] bg-white hover:bg-[#dfe7f6]"
              >
                ⏭
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#c5d4f2] rounded shadow-inner flex-1 overflow-hidden">
            <header className="px-3 py-2 border-b border-[#c5d4f2] bg-[#eef3fb] text-[11px] text-[#0b2d66] uppercase tracking-wide">
              Playlist — Now Playing
            </header>
            <ul className="overflow-auto h-full divide-y divide-[#e6ecf7]">
              {tracks.map((track, index) => (
                <li
                  key={`${track.title}-${index}`}
                  className={`flex items-center justify-between px-3 py-2 text-[11px] cursor-pointer ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-[#0b2d66] to-[#15498d] text-white'
                      : 'hover:bg-[#eef3fb]'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsPlaying(true);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{track.title}</span>
                    <span className="text-[10px] opacity-80">{track.artist}</span>
                  </div>
                  <span className="text-[10px] opacity-75">{track.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="px-4 py-2 bg-gradient-to-r from-[#0b2d66] to-[#0b2d66] text-white text-[10px] flex items-center justify-between border-t border-[#0b2146]">
        <span>Enhancements: Graphic EQ — Crossfade — SRS WOW Effect</span>
        <span>Windows XP Media Experience</span>
      </footer>

      <audio ref={audioRef} preload="auto">
        <source src={currentTrack?.url} />
      </audio>
    </div>
  );
}

