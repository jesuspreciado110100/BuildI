export interface LaborRequest {
  id: string;
  title: string;
  description: string;
  tradeType: string;
  skillLevel: string;
  workersNeeded: number;
  hourlyRate: number;
  startDate: string;
  endDate?: string;
  location: string;
  urgency: string;
  requirements: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  siteId?: string;
  conceptId?: string;
  createdAt: string;
  applicants?: number;
}

export class LaborRequestService {
  private static requests: LaborRequest[] = [
    {
      id: '1',
      title: 'Concrete Pour Assistant',
      description: 'Need experienced workers for concrete foundation pour',
      tradeType: 'Laborer',
      skillLevel: 'Intermediate',
      workersNeeded: 3,
      hourlyRate: 25.00,
      startDate: '2024-02-15',
      endDate: '2024-02-16',
      location: 'Downtown Construction Site',
      urgency: 'High',
      requirements: 'Must have concrete experience',
      status: 'pending',
      createdAt: '2024-01-15T10:00:00Z',
      applicants: 7
    },
    {
      id: '2',
      title: 'Electrical Installation',
      description: 'Install electrical wiring for new office building',
      tradeType: 'Electrician',
      skillLevel: 'Expert',
      workersNeeded: 2,
      hourlyRate: 45.00,
      startDate: '2024-02-20',
      endDate: '2024-02-25',
      location: 'Office Complex Site',
      urgency: 'Medium',
      requirements: 'Licensed electrician required',
      status: 'approved',
      createdAt: '2024-01-10T14:30:00Z',
      applicants: 12
    }
  ];

  static async createRequest(request: Omit<LaborRequest, 'id' | 'createdAt'>): Promise<LaborRequest> {
    const newRequest: LaborRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.requests.push(newRequest);
    return newRequest;
  }

  static async getUserRequests(userId: string): Promise<LaborRequest[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.requests;
  }

  static async getRequestById(id: string): Promise<LaborRequest | null> {
    return this.requests.find(req => req.id === id) || null;
  }

  static async updateRequest(id: string, updates: Partial<LaborRequest>): Promise<LaborRequest | null> {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return null;
    
    this.requests[index] = { ...this.requests[index], ...updates };
    return this.requests[index];
  }

  static async deleteRequest(id: string): Promise<boolean> {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return false;
    
    this.requests.splice(index, 1);
    return true;
  }

  static async getRequestsByStatus(status: string): Promise<LaborRequest[]> {
    return this.requests.filter(req => req.status === status);
  }

  static async getRequestsBySite(siteId: string): Promise<LaborRequest[]> {
    return this.requests.filter(req => req.siteId === siteId);
  }

  static async searchRequests(query: string): Promise<LaborRequest[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.requests.filter(req => 
      req.title.toLowerCase().includes(lowercaseQuery) ||
      req.description.toLowerCase().includes(lowercaseQuery) ||
      req.tradeType.toLowerCase().includes(lowercaseQuery)
    );
  }

  static getTradeTypes(): string[] {
    return [
      'Carpenter', 'Electrician', 'Plumber', 'Mason', 'Painter',
      'Roofer', 'HVAC', 'Welder', 'Laborer', 'Foreman'
    ];
  }

  static getSkillLevels(): string[] {
    return ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  }

  static getUrgencyLevels(): string[] {
    return ['Low', 'Medium', 'High', 'Urgent'];
  }
}