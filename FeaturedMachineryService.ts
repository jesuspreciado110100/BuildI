import { MachineryItem } from '../types';

class FeaturedMachineryService {
  private featuredMachines: string[] = ['featured1', 'featured2']; // Mock admin-marked featured machines

  async getFeaturedMachinery(): Promise<MachineryItem[]> {
    // Mock featured machinery data
    return [
      {
        id: 'featured1',
        renter_id: 'renter1',
        category: 'Excavator',
        brand: 'Caterpillar',
        model: '320D',
        year: '2022',
        rate: 450,
        rate_type: 'day',
        photos: ['https://via.placeholder.com/300x200'],
        description: 'Premium excavator with GPS',
        available: true,
        region: 'Downtown',
        created_at: '2024-01-01T00:00:00Z',
        status: 'active',
        is_featured: true
      },
      {
        id: 'featured2',
        renter_id: 'renter2',
        category: 'Loader',
        brand: 'John Deere',
        model: '544K',
        year: '2023',
        rate: 380,
        rate_type: 'day',
        photos: ['https://via.placeholder.com/300x200'],
        description: 'High-performance wheel loader',
        available: true,
        region: 'Downtown',
        created_at: '2024-01-01T00:00:00Z',
        status: 'active',
        is_featured: true
      }
    ];
  }

  async markAsFeatured(machineId: string): Promise<void> {
    // Mock admin function to mark machines as featured
    if (!this.featuredMachines.includes(machineId)) {
      this.featuredMachines.push(machineId);
    }
  }

  async removeFeatured(machineId: string): Promise<void> {
    // Mock admin function to remove featured status
    this.featuredMachines = this.featuredMachines.filter(id => id !== machineId);
  }

  async isFeatured(machineId: string): Promise<boolean> {
    return this.featuredMachines.includes(machineId);
  }
}

export default new FeaturedMachineryService();