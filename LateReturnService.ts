export interface LateReturnPenalty {
  bookingId: string;
  scheduledEnd: Date;
  actualEnd?: Date;
  hoursLate: number;
  penaltyRate: number; // per hour
  totalPenalty: number;
  isActive: boolean;
  notificationsSent: string[];
  createdAt: Date;
}

export interface BookingWithLateCheck {
  id: string;
  scheduledEnd: Date;
  actualEnd?: Date;
  contractorId: string;
  renterId: string;
  machineId: string;
  isLate?: boolean;
  hoursLate?: number;
  lateFee?: number;
}

class LateReturnService {
  private penalties: Map<string, LateReturnPenalty> = new Map();
  private readonly GRACE_PERIOD_HOURS = 2;
  private readonly DEFAULT_PENALTY_RATE = 25; // $25 per hour
  private checkInterval: NodeJS.Timeout | null = null;

  startMonitoring() {
    // Check for late returns every 30 minutes
    this.checkInterval = setInterval(() => {
      this.checkLateReturns();
    }, 30 * 60 * 1000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkLateReturns() {
    const activeBookings = this.getActiveBookings();
    const now = new Date();

    activeBookings.forEach(booking => {
      if (!booking.actualEnd) {
        const scheduledEnd = new Date(booking.scheduledEnd);
        const graceEnd = new Date(scheduledEnd.getTime() + (this.GRACE_PERIOD_HOURS * 60 * 60 * 1000));
        
        if (now > graceEnd) {
          const hoursLate = Math.ceil((now.getTime() - graceEnd.getTime()) / (60 * 60 * 1000));
          this.applyLatePenalty(booking.id, hoursLate);
        }
      }
    });
  }

  applyLatePenalty(bookingId: string, hoursLate: number): LateReturnPenalty {
    const existingPenalty = this.penalties.get(bookingId);
    
    if (existingPenalty) {
      // Update existing penalty
      existingPenalty.hoursLate = hoursLate;
      existingPenalty.totalPenalty = hoursLate * existingPenalty.penaltyRate;
      this.penalties.set(bookingId, existingPenalty);
      return existingPenalty;
    }

    // Create new penalty
    const penalty: LateReturnPenalty = {
      bookingId,
      scheduledEnd: new Date(), // Would get from booking data
      hoursLate,
      penaltyRate: this.DEFAULT_PENALTY_RATE,
      totalPenalty: hoursLate * this.DEFAULT_PENALTY_RATE,
      isActive: true,
      notificationsSent: [],
      createdAt: new Date()
    };

    this.penalties.set(bookingId, penalty);
    this.sendLateReturnNotifications(penalty);
    return penalty;
  }

  private sendLateReturnNotifications(penalty: LateReturnPenalty) {
    // Mock notification sending
    const notifications = [
      `Late return penalty applied: $${penalty.totalPenalty}`,
      `Machine is ${penalty.hoursLate} hours overdue`,
      `Please return immediately to avoid additional charges`
    ];

    penalty.notificationsSent = notifications;
    console.log('Late return notifications sent:', notifications);
  }

  markReturned(bookingId: string, returnTime: Date) {
    const penalty = this.penalties.get(bookingId);
    if (penalty) {
      penalty.actualEnd = returnTime;
      penalty.isActive = false;
      this.penalties.set(bookingId, penalty);
    }
  }

  getPenalty(bookingId: string): LateReturnPenalty | null {
    return this.penalties.get(bookingId) || null;
  }

  getAllActivePenalties(): LateReturnPenalty[] {
    return Array.from(this.penalties.values()).filter(p => p.isActive);
  }

  calculatePenalty(scheduledEnd: Date, actualEnd: Date): number {
    const graceEnd = new Date(scheduledEnd.getTime() + (this.GRACE_PERIOD_HOURS * 60 * 60 * 1000));
    
    if (actualEnd <= graceEnd) {
      return 0;
    }

    const hoursLate = Math.ceil((actualEnd.getTime() - graceEnd.getTime()) / (60 * 60 * 1000));
    return hoursLate * this.DEFAULT_PENALTY_RATE;
  }

  // Mock method - would integrate with actual booking system
  private getActiveBookings(): BookingWithLateCheck[] {
    return [
      {
        id: 'booking_1',
        scheduledEnd: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        contractorId: 'contractor_1',
        renterId: 'renter_1',
        machineId: 'machine_1'
      },
      {
        id: 'booking_2',
        scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        contractorId: 'contractor_2',
        renterId: 'renter_2',
        machineId: 'machine_2'
      }
    ];
  }

  getBookingStatus(bookingId: string): {
    isLate: boolean;
    hoursLate: number;
    penalty: number;
    status: string;
  } {
    const penalty = this.penalties.get(bookingId);
    
    if (!penalty) {
      return {
        isLate: false,
        hoursLate: 0,
        penalty: 0,
        status: 'On Time'
      };
    }

    return {
      isLate: penalty.isActive,
      hoursLate: penalty.hoursLate,
      penalty: penalty.totalPenalty,
      status: penalty.isActive ? `${penalty.hoursLate}h Late` : 'Returned'
    };
  }
}

export const lateReturnService = new LateReturnService();