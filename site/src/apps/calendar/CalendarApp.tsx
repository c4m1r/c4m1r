import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { parseICS, CalendarEvent } from './icsParser';

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
}

async function fetchCalendar(locale: string): Promise<CalendarEvent[]> {
  const normalized = locale.split('-')[0];
  const primary = `/calendar/calendar-${normalized}.ics`;
  const fallback = normalized === 'en' ? null : '/calendar/calendar-en.ics';

  const tryFetch = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    const text = await response.text();
    return parseICS(text);
  };

  try {
    return await tryFetch(primary);
  } catch (error) {
    if (fallback) {
      try {
        return await tryFetch(fallback);
      } catch {
        return [];
      }
    }
    return [];
  }
}

function areSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarApp() {
  const { language } = useApp();
  const locale = language ?? 'en';

  const today = new Date();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCalendar(locale)
      .then((result) => setEvents(result))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [locale]);

  const days = useMemo<CalendarDay[]>(() => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysArray: CalendarDay[] = [];

    for (let day = 1; day <= lastDay; day += 1) {
      const date = new Date(currentYear, currentMonth, day);
      const dayEvents = events.filter((event) => areSameDay(event.startDate, date));
      daysArray.push({ date, events: dayEvents });
    }

    return daysArray;
  }, [events, currentMonth, currentYear]);

  const monthLabel = useMemo(() => {
    return new Date(currentYear, currentMonth).toLocaleString(locale, {
      month: 'long',
    });
  }, [currentMonth, currentYear, locale]);

  const previousMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((year) => year - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isCurrentDate = (date: Date) => areSameDay(date, today);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-[#ece9d8]">
        <button
          onClick={previousMonth}
          className="px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-white/60 rounded"
        >
          ‹
        </button>
        <div className="text-base font-semibold capitalize">
          {monthLabel} {currentYear}
        </div>
        <button
          onClick={nextMonth}
          className="px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-white/60 rounded"
        >
          ›
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          Loading calendar…
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((day) => (
              <div
                key={day.date.toISOString()}
                className={`min-h-[110px] border border-gray-200 p-2 rounded ${
                  isCurrentDate(day.date) ? 'bg-yellow-100 border-yellow-400' : 'bg-white'
                } ${isWeekend(day.date) ? 'bg-blue-50/40' : ''}`}
              >
                <div className="text-sm font-bold mb-1">{day.date.getDate()}</div>
                <div className="space-y-2">
                  {day.events.map((event) => (
                    <div key={`${event.summary}-${event.startDate.toISOString()}`}>
                      <div className="text-[11px] font-semibold bg-blue-900 text-white px-1 rounded mb-1">
                        {event.summary}
                      </div>
                      {event.location && (
                        <div className="text-[10px] text-gray-600 truncate">{event.location}</div>
                      )}
                    </div>
                  ))}
                  {day.events.length === 0 && (
                    <div className="text-[10px] text-gray-400 italic">
                      {isWeekend(day.date) ? 'Weekend' : 'No events'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

