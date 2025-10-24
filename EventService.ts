export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'job_fair' | 'safety_training' | 'certification' | 'conference' | 'workshop' | 'networking';
  attendees: number;
  description: string;
}

class EventService {
  private events: Event[] = [
    {
      id: '1',
      title: 'Construction Safety Workshop',
      date: '2024-02-15',
      time: '9:00 AM - 4:00 PM',
      location: 'Downtown Convention Center',
      type: 'safety_training',
      attendees: 45,
      description: 'Learn about latest safety protocols and regulations'
    },
    {
      id: '2',
      title: 'Building Tech Conference 2024',
      date: '2024-02-20',
      time: '8:00 AM - 6:00 PM',
      location: 'Tech Hub Auditorium',
      type: 'conference',
      attendees: 200,
      description: 'Explore new construction technologies and innovations'
    },
    {
      id: '3',
      title: 'Construction Job Fair',
      date: '2024-03-01',
      time: '10:00 AM - 4:00 PM',
      location: 'City Convention Center',
      type: 'job_fair',
      attendees: 150,
      description: 'Find skilled workers and showcase your projects'
    }
  ];

  async getEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async registerForEvent(eventId: string): Promise<void> {
    const event = this.events.find(e => e.id === eventId);
    if (event) event.attendees += 1;
  }
}

export default new EventService();