import { FavoriteRenter } from '../types';

// Mock data for favorite renters
const mockFavoriteRenters: FavoriteRenter[] = [
  {
    id: '1',
    contractor_id: 'contractor1',
    renter_id: 'renter1',
    renter_name: 'Heavy Equipment Co.',
    last_machine_type: 'Excavator',
    last_price: 450,
    last_booking_date: '2024-01-15',
    total_bookings: 8,
    average_rating: 4.8,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    contractor_id: 'contractor1',
    renter_id: 'renter2',
    renter_name: 'Construction Rentals LLC',
    last_machine_type: 'Crane',
    last_price: 850,
    last_booking_date: '2024-01-10',
    total_bookings: 5,
    average_rating: 4.6,
    created_at: '2023-12-15'
  }
];

export class FavoriteRenterService {
  static async getFavorites(contractorId: string): Promise<FavoriteRenter[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockFavoriteRenters.filter(fav => fav.contractor_id === contractorId);
  }

  static async addFavorite(contractorId: string, renterData: Partial<FavoriteRenter>): Promise<FavoriteRenter> {
    const newFavorite: FavoriteRenter = {
      id: Date.now().toString(),
      contractor_id: contractorId,
      renter_id: renterData.renter_id!,
      renter_name: renterData.renter_name!,
      last_machine_type: renterData.last_machine_type!,
      last_price: renterData.last_price!,
      last_booking_date: renterData.last_booking_date!,
      total_bookings: renterData.total_bookings || 1,
      average_rating: renterData.average_rating || 5.0,
      created_at: new Date().toISOString()
    };
    
    mockFavoriteRenters.push(newFavorite);
    return newFavorite;
  }

  static async removeFavorite(contractorId: string, renterId: string): Promise<boolean> {
    const index = mockFavoriteRenters.findIndex(
      fav => fav.contractor_id === contractorId && fav.renter_id === renterId
    );
    
    if (index > -1) {
      mockFavoriteRenters.splice(index, 1);
      return true;
    }
    return false;
  }

  static async isFavorite(contractorId: string, renterId: string): Promise<boolean> {
    return mockFavoriteRenters.some(
      fav => fav.contractor_id === contractorId && fav.renter_id === renterId
    );
  }

  static async updateLastBooking(contractorId: string, renterId: string, machineType: string, price: number): Promise<void> {
    const favorite = mockFavoriteRenters.find(
      fav => fav.contractor_id === contractorId && fav.renter_id === renterId
    );
    
    if (favorite) {
      favorite.last_machine_type = machineType;
      favorite.last_price = price;
      favorite.last_booking_date = new Date().toISOString().split('T')[0];
      favorite.total_bookings += 1;
    }
  }
}