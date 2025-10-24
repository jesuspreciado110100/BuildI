import { User } from '../types';

interface SearchResult {
  id: string;
  type: 'worker' | 'machine' | 'material' | 'concept' | 'booking';
  title: string;
  subtitle: string;
  metadata: any;
}

interface Worker {
  id: string;
  name: string;
  trade: string;
  profileImage?: string;
  skills: string[];
}

interface Machine {
  id: string;
  name: string;
  brand: string;
  image?: string;
  available: boolean;
  type: string;
}

interface Material {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
}

interface Concept {
  id: string;
  name: string;
  site: string;
  progress: number;
  phase: string;
}

interface Booking {
  id: string;
  title: string;
  status: string;
  date: string;
  client: string;
}

class SearchService {
  private mockWorkers: Worker[] = [
    { id: '1', name: 'John Smith', trade: 'Electrician', skills: ['Wiring', 'Panel Installation'] },
    { id: '2', name: 'Maria Garcia', trade: 'Plumber', skills: ['Pipe Fitting', 'Drain Cleaning'] },
    { id: '3', name: 'David Chen', trade: 'Carpenter', skills: ['Framing', 'Finish Work'] },
  ];

  private mockMachines: Machine[] = [
    { id: '1', name: 'Excavator CAT 320', brand: 'Caterpillar', available: true, type: 'Excavator' },
    { id: '2', name: 'Crane Liebherr LTM', brand: 'Liebherr', available: false, type: 'Crane' },
    { id: '3', name: 'Bulldozer Komatsu D65', brand: 'Komatsu', available: true, type: 'Bulldozer' },
  ];

  private mockMaterials: Material[] = [
    { id: '1', name: 'Concrete Mix', category: 'Concrete', supplier: 'BuildCorp', price: 120 },
    { id: '2', name: 'Steel Rebar', category: 'Steel', supplier: 'MetalWorks', price: 850 },
    { id: '3', name: 'Lumber 2x4', category: 'Wood', supplier: 'TimberCo', price: 45 },
  ];

  private mockConcepts: Concept[] = [
    { id: '1', name: 'Foundation Phase', site: 'Downtown Plaza', progress: 75, phase: 'Foundation' },
    { id: '2', name: 'Framing Work', site: 'Residential Complex', progress: 45, phase: 'Structure' },
    { id: '3', name: 'Electrical Install', site: 'Office Building', progress: 90, phase: 'MEP' },
  ];

  private mockBookings: Booking[] = [
    { id: '1', title: 'Excavator Rental', status: 'Confirmed', date: '2024-01-15', client: 'ABC Construction' },
    { id: '2', title: 'Crane Service', status: 'Pending', date: '2024-01-20', client: 'XYZ Builders' },
    { id: '3', title: 'Equipment Transport', status: 'Completed', date: '2024-01-10', client: 'DEF Projects' },
  ];

  async searchAll(query: string, userRole: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search workers
    if (this.canAccessWorkers(userRole)) {
      this.mockWorkers.forEach(worker => {
        if (worker.name.toLowerCase().includes(lowerQuery) || 
            worker.trade.toLowerCase().includes(lowerQuery) ||
            worker.skills.some(skill => skill.toLowerCase().includes(lowerQuery))) {
          results.push({
            id: worker.id,
            type: 'worker',
            title: worker.name,
            subtitle: worker.trade,
            metadata: worker
          });
        }
      });
    }

    // Search machines
    if (this.canAccessMachines(userRole)) {
      this.mockMachines.forEach(machine => {
        if (machine.name.toLowerCase().includes(lowerQuery) || 
            machine.brand.toLowerCase().includes(lowerQuery) ||
            machine.type.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: machine.id,
            type: 'machine',
            title: machine.name,
            subtitle: `${machine.brand} - ${machine.available ? 'Available' : 'Unavailable'}`,
            metadata: machine
          });
        }
      });
    }

    // Search materials
    if (this.canAccessMaterials(userRole)) {
      this.mockMaterials.forEach(material => {
        if (material.name.toLowerCase().includes(lowerQuery) || 
            material.category.toLowerCase().includes(lowerQuery) ||
            material.supplier.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: material.id,
            type: 'material',
            title: material.name,
            subtitle: `${material.category} - $${material.price}`,
            metadata: material
          });
        }
      });
    }

    // Search concepts
    if (this.canAccessConcepts(userRole)) {
      this.mockConcepts.forEach(concept => {
        if (concept.name.toLowerCase().includes(lowerQuery) || 
            concept.site.toLowerCase().includes(lowerQuery) ||
            concept.phase.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: concept.id,
            type: 'concept',
            title: concept.name,
            subtitle: `${concept.site} - ${concept.progress}%`,
            metadata: concept
          });
        }
      });
    }

    // Search bookings
    if (this.canAccessBookings(userRole)) {
      this.mockBookings.forEach(booking => {
        if (booking.title.toLowerCase().includes(lowerQuery) || 
            booking.client.toLowerCase().includes(lowerQuery) ||
            booking.status.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: booking.id,
            type: 'booking',
            title: booking.title,
            subtitle: `${booking.client} - ${booking.status}`,
            metadata: booking
          });
        }
      });
    }

    return results;
  }

  private canAccessWorkers(role: string): boolean {
    return ['contractor', 'labor_chief', 'admin'].includes(role);
  }

  private canAccessMachines(role: string): boolean {
    return ['contractor', 'machinery_renter', 'admin'].includes(role);
  }

  private canAccessMaterials(role: string): boolean {
    return ['contractor', 'material_supplier', 'admin'].includes(role);
  }

  private canAccessConcepts(role: string): boolean {
    return ['contractor', 'client', 'admin'].includes(role);
  }

  private canAccessBookings(role: string): boolean {
    return ['contractor', 'machinery_renter', 'client', 'admin'].includes(role);
  }
}

export const searchService = new SearchService();
export type { SearchResult };