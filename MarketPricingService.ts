import { MachineryItem, MarketData, PricingInsight } from '../types';

export class MarketPricingService {
  // Mock data for recent bookings
  private static mockBookings = [
    { id: '1', machine_category: 'excavator', location: 'NYC', price: 450, duration: 1, accepted_at: '2024-01-15' },
    { id: '2', machine_category: 'excavator', location: 'NYC', price: 500, duration: 1, accepted_at: '2024-01-16' },
    { id: '3', machine_category: 'excavator', location: 'NYC', price: 425, duration: 1, accepted_at: '2024-01-17' },
    { id: '4', machine_category: 'bulldozer', location: 'NYC', price: 600, duration: 1, accepted_at: '2024-01-15' },
    { id: '5', machine_category: 'bulldozer', location: 'NYC', price: 650, duration: 1, accepted_at: '2024-01-16' },
    { id: '6', machine_category: 'crane', location: 'NYC', price: 800, duration: 1, accepted_at: '2024-01-15' },
    { id: '7', machine_category: 'crane', location: 'NYC', price: 750, duration: 1, accepted_at: '2024-01-16' },
  ];

  static async getMarketData(category: string, location: string, radiusKm: number = 50): Promise<MarketData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Filter bookings by category and location (simplified)
    const relevantBookings = this.mockBookings.filter(booking => 
      booking.machine_category.toLowerCase() === category.toLowerCase() &&
      booking.location.toLowerCase().includes(location.toLowerCase())
    );

    if (relevantBookings.length === 0) {
      // Return default data if no bookings found
      return {
        category,
        location,
        avg_price: 400,
        min_price: 300,
        max_price: 500,
        booking_count: 0,
        last_updated: new Date().toISOString()
      };
    }

    const prices = relevantBookings.map(b => b.price);
    const avg_price = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const min_price = Math.min(...prices);
    const max_price = Math.max(...prices);

    return {
      category,
      location,
      avg_price: Math.round(avg_price),
      min_price,
      max_price,
      booking_count: relevantBookings.length,
      last_updated: new Date().toISOString()
    };
  }

  static async calculatePricingScore(currentPrice: number, marketData: MarketData): Promise<'low' | 'fair' | 'high'> {
    const { avg_price, min_price, max_price } = marketData;
    
    // Define thresholds
    const lowThreshold = avg_price - (avg_price - min_price) * 0.3;
    const highThreshold = avg_price + (max_price - avg_price) * 0.3;

    if (currentPrice < lowThreshold) return 'low';
    if (currentPrice > highThreshold) return 'high';
    return 'fair';
  }

  static async generatePricingInsight(machine: MachineryItem): Promise<PricingInsight> {
    const marketData = await this.getMarketData(machine.category, machine.location);
    const pricing_score = await this.calculatePricingScore(machine.price_per_day, marketData);
    
    // Calculate suggested price (AI-ready placeholder)
    let suggested_price = marketData.avg_price;
    if (pricing_score === 'high') {
      suggested_price = Math.round(marketData.avg_price * 0.95); // 5% below market
    } else if (pricing_score === 'low') {
      suggested_price = Math.round(marketData.avg_price * 1.05); // 5% above market
    }

    // Calculate visibility boost estimate
    const visibility_boost_estimate = pricing_score === 'high' ? 30 : pricing_score === 'low' ? -10 : 0;

    // Generate tips based on pricing score
    const tips = this.generateTips(pricing_score, machine.price_per_day, marketData.avg_price);

    return {
      machine_id: machine.id,
      current_price: machine.price_per_day,
      market_avg_price: marketData.avg_price,
      market_min_price: marketData.min_price,
      market_max_price: marketData.max_price,
      pricing_score,
      suggested_price,
      visibility_boost_estimate,
      tips
    };
  }

  private static generateTips(score: 'low' | 'fair' | 'high', currentPrice: number, avgPrice: number): string[] {
    const tips: string[] = [];
    
    if (score === 'high') {
      const reduction = Math.round(((currentPrice - avgPrice) / currentPrice) * 100);
      tips.push(`Lowering your price by ${reduction}% could boost visibility by 30%`);
      tips.push('Consider matching competitor prices to increase bookings');
    } else if (score === 'low') {
      tips.push('Your price is below market average - consider increasing for better margins');
      tips.push('You have room to increase prices while staying competitive');
    } else {
      tips.push('Your pricing is competitive with the local market');
      tips.push('Monitor market trends to maintain optimal pricing');
    }
    
    return tips;
  }

  static async updateMachinePricing(machineId: string, newPrice: number): Promise<boolean> {
    // Simulate API call to update machine pricing
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Updated machine ${machineId} price to $${newPrice}`);
    return true;
  }

  static async getWeeklyPricingInsights(userId: string): Promise<MachineryItem[]> {
    // Mock: Return machines that are above market for notifications
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // This would normally fetch user's machines and check pricing
    return [
      {
        id: '1',
        name: 'CAT 320 Excavator',
        category: 'excavator',
        description: 'Heavy duty excavator',
        price_per_day: 600,
        location: 'NYC',
        availability: true,
        owner_id: userId,
        images: [],
        specifications: {},
        created_at: '2024-01-01',
        pricing_score: 'high',
        market_avg_price: 475,
        suggested_price: 450
      }
    ];
  }
}