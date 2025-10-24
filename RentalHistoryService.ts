import { RentalFeedback, RentalIssue, BookingRequest } from '../types';

class RentalHistoryService {
  // Mock data for rental feedback
  private mockFeedback: RentalFeedback[] = [
    {
      id: '1',
      booking_id: 'booking-1',
      contractor_id: 'contractor-1',
      rating: 5,
      comment: 'Excellent excavator, very reliable',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      booking_id: 'booking-2',
      contractor_id: 'contractor-1',
      rating: 4,
      comment: 'Good equipment, minor hydraulic issues',
      timestamp: '2024-01-10T14:20:00Z'
    }
  ];

  // Mock data for rental issues
  private mockIssues: RentalIssue[] = [
    {
      id: '1',
      booking_id: 'booking-3',
      contractor_id: 'contractor-1',
      renter_id: 'renter-1',
      severity: 'High',
      status: 'Under Review',
      description: 'Hydraulic pump failure during operation',
      photos: ['photo1.jpg', 'photo2.jpg'],
      submitted_at: '2024-01-20T09:15:00Z'
    },
    {
      id: '2',
      booking_id: 'booking-4',
      contractor_id: 'contractor-2',
      renter_id: 'renter-1',
      severity: 'Medium',
      status: 'Resolved',
      description: 'Engine overheating issue',
      photos: ['photo3.jpg'],
      submitted_at: '2024-01-18T11:30:00Z',
      resolved_at: '2024-01-19T16:45:00Z',
      resolution_notes: 'Replaced cooling system, tested OK'
    }
  ];

  async submitFeedback(feedback: Omit<RentalFeedback, 'id' | 'timestamp'>): Promise<RentalFeedback> {
    const newFeedback: RentalFeedback = {
      ...feedback,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    this.mockFeedback.push(newFeedback);
    return newFeedback;
  }

  async getFeedbackByBooking(bookingId: string): Promise<RentalFeedback | null> {
    return this.mockFeedback.find(f => f.booking_id === bookingId) || null;
  }

  async submitIssue(issue: Omit<RentalIssue, 'id' | 'submitted_at'>): Promise<RentalIssue> {
    const newIssue: RentalIssue = {
      ...issue,
      id: Date.now().toString(),
      submitted_at: new Date().toISOString()
    };
    this.mockIssues.push(newIssue);
    return newIssue;
  }

  async getIssuesByRenter(renterId: string): Promise<RentalIssue[]> {
    return this.mockIssues.filter(issue => issue.renter_id === renterId);
  }

  async resolveIssue(issueId: string, resolutionNotes: string): Promise<RentalIssue | null> {
    const issue = this.mockIssues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'Resolved';
      issue.resolved_at = new Date().toISOString();
      issue.resolution_notes = resolutionNotes;
    }
    return issue || null;
  }
}

export default new RentalHistoryService();