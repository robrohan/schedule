

export class CalEvent {
  id: string;
  summary: string;
  description: string;
  date: Date;
  props: any;
}

export class Calendar {
  events: CalEvent[];
  constructor() {
    this.events = [];
  }
}

export class CalendarParser {
  calendar: Calendar;

  // if doing this for real, maybe build an index lookup
  public findEventsById(id: string): CalEvent[] {
    return this.calendar.events.filter( e => e.id === id);
  }

  // if doing this for real, maybe build an index lookup
  public findEventsByDate(date: Date): CalEvent[] {
    return this.calendar.events.filter( e => {
      return (
        e.date.getFullYear() === date.getFullYear()
        && e.date.getMonth() === date.getMonth()
        && e.date.getDate() === date.getDate()
      );
    });
  }

  public parse(file: string) {
    const lines = file.split('\n');

    let workingEvent: CalEvent;

    lines.forEach( line => {
      const lineParts = line.split(':');
      switch (lineParts[0]) {
        case 'BEGIN':
          if (lineParts[1] === 'VEVENT') {
            // Warning: could lose events on malformed
            workingEvent = new CalEvent();
          } else if (lineParts[1] === 'VCALENDAR') {
            // Warning: we're not keeping multi-calendars separate
            // all events will just be on the first calendar found
            if (!this.calendar) {
              this.calendar = new Calendar();
            }
          }
          break;
        case 'END':
          if (lineParts[1] === 'VEVENT') {
            this.calendar.events.push(workingEvent);
          } else if (lineParts[1] === 'VCALENDAR') {
            // Don't need to close the calendar currently
          }
        break;

        case 'UID':
          workingEvent.id = lineParts[1];
        break;
        case 'SUMMARY':
          workingEvent.summary = lineParts[1];
        break;
        case 'DESCRIPTION':
          workingEvent.description = lineParts[1];
        break;
        case 'DTSTART;VALUE=DATE':
          workingEvent.date = this.massageDate(lineParts[1]);
        break;
      }
    });
  }

  // 20180120T021231Z -> Date (with no time)
  private massageDate(date: string): Date {
    const dateString = [
      date.slice(0, 4), date.slice(4, 6), date.slice(6, 8)
    ].join('-');
    // we don't care about the time for this...
    return new Date(Date.parse([dateString, 'T00:00:00'].join('')));
  }
}
