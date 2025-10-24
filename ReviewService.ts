export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName: string;
  targetId: string;
  targetType: 'worker' | 'supplier' | 'contractor';
  createdAt: string;
}

export interface SupplierRating {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  location: string;
  responseTime: string;
  reliability: number;
  priceRating: number;
  qualityRating: number;
}

export class ReviewService {
  private static reviews: Review[] = [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent work quality and on-time delivery',
      reviewerId: 'user1',
      reviewerName: 'John Contractor',
      targetId: 'supplier1',
      targetType: 'supplier',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ];

  private static supplierRatings: SupplierRating[] = [
    {
      id: 'supplier1',
      name: 'BuildCorp Materials',
      rating: 4.8,
      reviewCount: 124,
      category: 'Concrete',
      location: 'Downtown',
      responseTime: '< 2 hours',
      reliability: 4.9,
      priceRating: 4.2,
      qualityRating: 4.7
    },
    {
      id: 'supplier2',
      name: 'Steel Solutions Inc',
      rating: 4.6,
      reviewCount: 89,
      category: 'Steel',
      location: 'Industrial District',
      responseTime: '< 4 hours',
      reliability: 4.5,
      priceRating: 4.8,
      qualityRating: 4.4
    }
  ];

  static async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.reviews.push(newReview);
    return newReview;
  }

  static async getReviewsByTarget(targetId: string, targetType: string): Promise<Review[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.reviews.filter(r => r.targetId === targetId && r.targetType === targetType);
  }

  static async getSupplierRatings(category?: string): Promise<SupplierRating[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (category) {
      return this.supplierRatings.filter(s => s.category === category);
    }
    return this.supplierRatings;
  }

  static async getSupplierRating(supplierId: string): Promise<SupplierRating | null> {
    return this.supplierRatings.find(s => s.id === supplierId) || null;
  }

  static async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.reviews[index] = { ...this.reviews[index], ...updates };
    return this.reviews[index];
  }

  static async deleteReview(id: string): Promise<boolean> {
    const index = this.reviews.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    this.reviews.splice(index, 1);
    return true;
  }

  static calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
}