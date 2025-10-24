export interface OperatorInfo {
  id: string;
  name: string;
  photo: string;
  yearsExperience: number;
  licenseType: string;
  rating: number;
  completedJobs: number;
  specializations: string[];
  phone: string;
  certifications: string[];
  isAvailable: boolean;
  currentLocation?: string;
}

export interface OperatorAssignment {
  id: string;
  operatorId: string;
  rentalId: string;
  assignedAt: string;
  status: 'assigned' | 'en_route' | 'on_site' | 'completed';
  estimatedArrival?: string;
  actualArrival?: string;
}

export class OperatorTrackerService {
  private static mockOperators: OperatorInfo[] = [
    {
      id: 'op1',
      name: 'Mike Rodriguez',
      photo: 'https://via.placeholder.com/150',
      yearsExperience: 12,
      licenseType: 'Heavy Equipment Operator Class A',
      rating: 4.8,
      completedJobs: 247,
      specializations: ['Excavator', 'Bulldozer', 'Crane'],
      phone: '+1 (555) 123-4567',
      certifications: ['OSHA 30-Hour', 'Crane Operator Certification', 'First Aid/CPR'],
      isAvailable: true,
      currentLocation: 'Downtown'
    },
    {
      id: 'op2',
      name: 'Sarah Johnson',
      photo: 'https://via.placeholder.com/150',
      yearsExperience: 8,
      licenseType: 'Commercial Driver License (CDL)',
      rating: 4.9,
      completedJobs: 189,
      specializations: ['Loader', 'Compactor', 'Grader'],
      phone: '+1 (555) 987-6543',
      certifications: ['OSHA 10-Hour', 'Defensive Driving', 'Equipment Safety'],
      isAvailable: false,
      currentLocation: 'North Side'
    }
  ];

  static async getOperatorInfo(operatorId: string): Promise<OperatorInfo | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const operator = this.mockOperators.find(op => op.id === operatorId);
      return operator || null;
    } catch (error) {
      console.error('Error fetching operator info:', error);
      return null;
    }
  }

  static async assignOperatorToRental(rentalId: string, operatorId: string): Promise<OperatorAssignment> {
    try {
      const assignment: OperatorAssignment = {
        id: Date.now().toString(),
        operatorId,
        rentalId,
        assignedAt: new Date().toISOString(),
        status: 'assigned',
        estimatedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      };
      
      console.log('Operator assigned to rental:', assignment);
      return assignment;
    } catch (error) {
      console.error('Error assigning operator:', error);
      throw error;
    }
  }

  static async updateOperatorStatus(assignmentId: string, status: OperatorAssignment['status']): Promise<boolean> {
    try {
      console.log('Updating operator status:', assignmentId, status);
      return true;
    } catch (error) {
      console.error('Error updating operator status:', error);
      return false;
    }
  }

  static async getOperatorAssignment(rentalId: string): Promise<OperatorAssignment | null> {
    try {
      // Mock assignment data
      return {
        id: 'assign1',
        operatorId: 'op1',
        rentalId,
        assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        status: 'en_route',
        estimatedArrival: new Date(Date.now() + 90 * 60 * 1000).toISOString() // 90 minutes from now
      };
    } catch (error) {
      console.error('Error fetching operator assignment:', error);
      return null;
    }
  }

  static async getAvailableOperators(category: string, location: string): Promise<OperatorInfo[]> {
    try {
      // Filter operators by specialization and availability
      return this.mockOperators.filter(op => 
        op.isAvailable && 
        op.specializations.includes(category) &&
        op.currentLocation === location
      );
    } catch (error) {
      console.error('Error fetching available operators:', error);
      return [];
    }
  }

  static async trackOperatorLocation(operatorId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Mock location tracking
      return {
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01
      };
    } catch (error) {
      console.error('Error tracking operator location:', error);
      return null;
    }
  }

  static getOperatorStatusColor(status: OperatorAssignment['status']): string {
    switch (status) {
      case 'assigned':
        return '#f59e0b';
      case 'en_route':
        return '#3b82f6';
      case 'on_site':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }

  static getOperatorStatusText(status: OperatorAssignment['status']): string {
    switch (status) {
      case 'assigned':
        return 'Operator Assigned';
      case 'en_route':
        return 'En Route';
      case 'on_site':
        return 'On Site';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  static async rateOperator(operatorId: string, rating: number, feedback?: string): Promise<boolean> {
    try {
      console.log('Rating operator:', operatorId, rating, feedback);
      return true;
    } catch (error) {
      console.error('Error rating operator:', error);
      return false;
    }
  }
}