export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class LocationService {
  // Mock location for now - can be replaced with actual implementation
  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      // Return a default location (can be replaced with actual geolocation)
      // For now, returning coordinates for a central location
      return {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 100,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  static async requestLocationPermission(): Promise<boolean> {
    return true;
  }

  static async hasLocationPermission(): Promise<boolean> {
    return true;
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
