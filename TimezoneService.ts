export class TimezoneService {
  // Get local time in specified timezone
  static getLocalTime(datetime: string, timezone: string): Date {
    const date = new Date(datetime);
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  }

  // Display time with timezone info
  static displayTime(
    datetime: string,
    userTimezone: string,
    siteTimezone?: string,
    showSiteTime = false
  ): string {
    const targetTimezone = showSiteTime && siteTimezone ? siteTimezone : userTimezone;
    const date = new Date(datetime);
    
    const timeString = date.toLocaleString('en-US', {
      timeZone: targetTimezone,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const offset = this.getTimezoneOffset(targetTimezone);
    return `${timeString} (${offset})`;
  }

  // Get timezone offset string
  static getTimezoneOffset(timezone: string): string {
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (this.getOffsetMinutes(timezone) * 60000));
    const offset = (targetTime.getTime() - utc) / (1000 * 60 * 60);
    return offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
  }

  // Get current time for site
  static getCurrentSiteTime(timezone: string): string {
    const now = new Date();
    return now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get timezone name for display
  static getTimezoneDisplayName(timezone: string): string {
    const names: Record<string, string> = {
      'America/New_York': 'Eastern Time',
      'America/Chicago': 'Central Time',
      'America/Denver': 'Mountain Time',
      'America/Los_Angeles': 'Pacific Time',
      'America/Mexico_City': 'Mexico City Time',
      'Europe/London': 'GMT',
      'Europe/Paris': 'Central European Time',
      'Asia/Tokyo': 'Japan Time'
    };
    return names[timezone] || timezone;
  }

  private static getOffsetMinutes(timezone: string): number {
    const offsets: Record<string, number> = {
      'America/New_York': -300,
      'America/Chicago': -360,
      'America/Denver': -420,
      'America/Los_Angeles': -480,
      'America/Mexico_City': -360,
      'Europe/London': 0,
      'Europe/Paris': 60,
      'Asia/Tokyo': 540
    };
    return offsets[timezone] || 0;
  }
}