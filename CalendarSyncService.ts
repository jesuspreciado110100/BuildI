import { Milestone, TradeOffer } from '../types';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location?: string;
}

class CalendarSyncService {
  private generateICSContent(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeText = (text: string): string => {
      return text.replace(/[\n\r]/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Construction App//Calendar Sync//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@constructionapp.com`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      event.location ? `LOCATION:${escapeText(event.location)}` : '',
      `DTSTAMP:${formatDate(new Date())}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');

    return icsContent;
  }

  private createDownloadLink(content: string, filename: string): string {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return url;
  }

  generateMilestoneCalendarEvent(milestone: Milestone): CalendarEvent {
    const startDate = new Date(milestone.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      title: `Milestone: ${milestone.title}`,
      startDate,
      endDate,
      description: milestone.description,
      location: undefined
    };
  }

  generateTradeOfferCalendarEvent(tradeOffer: TradeOffer): CalendarEvent {
    const startDate = new Date(tradeOffer.deadline);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    return {
      title: `Trade Offer Deadline`,
      startDate,
      endDate,
      description: `Trade offer deadline - Amount: $${tradeOffer.total_price}`,
      location: undefined
    };
  }

  async syncMilestoneToCalendar(milestone: Milestone): Promise<string> {
    const event = this.generateMilestoneCalendarEvent(milestone);
    const icsContent = this.generateICSContent(event);
    const downloadLink = this.createDownloadLink(icsContent, `milestone-${milestone.id}.ics`);
    
    // Store calendar link (in real app, this would be saved to database)
    milestone.calendar_link = downloadLink;
    milestone.sync_enabled = true;
    
    return downloadLink;
  }

  async syncTradeOfferToCalendar(tradeOffer: TradeOffer): Promise<string> {
    const event = this.generateTradeOfferCalendarEvent(tradeOffer);
    const icsContent = this.generateICSContent(event);
    const downloadLink = this.createDownloadLink(icsContent, `trade-offer-${tradeOffer.id}.ics`);
    
    // Store calendar link (in real app, this would be saved to database)
    tradeOffer.calendar_link = downloadLink;
    tradeOffer.sync_enabled = true;
    
    return downloadLink;
  }

  downloadICSFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const calendarSyncService = new CalendarSyncService();