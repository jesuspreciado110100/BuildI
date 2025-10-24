export interface HomeCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  actionType: 'navigate' | 'modal' | 'action';
  actionTarget: string;
  priority: number;
  badge?: string;
  progress?: number;
}

export class HomeCardsService {
  static async getCardsForUser(userId: string, userRole: string): Promise<HomeCard[]> {
    // Mock data - in real app, this would fetch from API
    const mockData = {
      contractor: [
        {
          id: '1',
          title: '2 pending labor proposals',
          subtitle: 'Review and respond to worker applications',
          icon: '👷',
          actionType: 'navigate' as const,
          actionTarget: 'labor',
          priority: 1,
          badge: '2',
        },
        {
          id: '2',
          title: 'Delivery arriving soon',
          subtitle: 'Cement delivery scheduled for tomorrow 9 AM',
          icon: '🚛',
          actionType: 'navigate' as const,
          actionTarget: 'materials-orders',
          priority: 2,
        },
        {
          id: '3',
          title: 'Site #2 progress overdue',
          subtitle: 'Office Building B needs progress update',
          icon: '⚠️',
          actionType: 'navigate' as const,
          actionTarget: 'sites',
          priority: 3,
          progress: 45,
        },
        {
          id: '4',
          title: 'Machinery rental ending',
          subtitle: 'Excavator rental expires in 2 days',
          icon: '🚜',
          actionType: 'navigate' as const,
          actionTarget: 'machinery-rentals',
          priority: 4,
        },
      ],
      laborChief: [
        {
          id: '1',
          title: '5 workers available',
          subtitle: 'Assign crew to active projects',
          icon: '👥',
          actionType: 'action' as const,
          actionTarget: 'assign-crew',
          priority: 1,
          badge: '5',
        },
        {
          id: '2',
          title: 'Photo required for Concept X',
          subtitle: 'Upload progress photos for Foundation Phase',
          icon: '📸',
          actionType: 'modal' as const,
          actionTarget: 'photo-upload',
          priority: 2,
        },
        {
          id: '3',
          title: 'Safety inspection due',
          subtitle: 'Site A requires weekly safety check',
          icon: '🦺',
          actionType: 'navigate' as const,
          actionTarget: 'safety',
          priority: 3,
        },
      ],
      materialSupplier: [
        {
          id: '1',
          title: '3 quote requests',
          subtitle: 'New material quotes awaiting response',
          icon: '💰',
          actionType: 'navigate' as const,
          actionTarget: 'quotes',
          priority: 1,
          badge: '3',
        },
        {
          id: '2',
          title: 'Low inventory alert',
          subtitle: 'Steel rebar stock below minimum threshold',
          icon: '📦',
          actionType: 'navigate' as const,
          actionTarget: 'inventory',
          priority: 2,
        },
      ],
    };

    return mockData[userRole as keyof typeof mockData] || [];
  }

  static async refreshCards(userId: string, userRole: string): Promise<HomeCard[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getCardsForUser(userId, userRole);
  }
}