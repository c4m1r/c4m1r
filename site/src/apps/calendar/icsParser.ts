export interface CalendarEvent {
  summary: string;
  location?: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

const DATE_TIME_REGEX = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/;

function parseICSDate(value?: string): Date | null {
  if (!value) return null;
  const match = value.replace('Z', '').match(DATE_TIME_REGEX);
  if (!match) return null;

  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}

export function parseICS(icsData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const blocks = icsData.split('BEGIN:VEVENT').slice(1);
  const now = new Date();

  blocks.forEach((block) => {
    const [body] = block.split('END:VEVENT');
    const lines = body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    let summary = '';
    let location = '';
    let description = '';
    let dtStart = '';
    let dtEnd = '';

    lines.forEach((line) => {
      if (line.startsWith('SUMMARY')) {
        summary = line.split(':').slice(1).join(':').trim();
      } else if (line.startsWith('LOCATION')) {
        location = line.split(':').slice(1).join(':').trim();
      } else if (line.startsWith('DESCRIPTION')) {
        description = line.split(':').slice(1).join(':').trim();
      } else if (line.startsWith('DTSTART')) {
        dtStart = line.split(':').pop() || '';
      } else if (line.startsWith('DTEND')) {
        dtEnd = line.split(':').pop() || '';
      }
    });

    const startDate = parseICSDate(dtStart);
    const endDate = parseICSDate(dtEnd) ?? startDate;

    if (summary && startDate && endDate && endDate >= now) {
      events.push({
        summary,
        location,
        description,
        startDate,
        endDate,
      });
    }
  });

  return events;
}

