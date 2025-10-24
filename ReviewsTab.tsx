import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialSupplierReview } from '../types';
import { StarRating } from './StarRating';
import { ReviewService } from '../services/ReviewService';

interface ReviewsTabProps {
  supplierId: string;
}

interface ReviewCardProps {
  review: MaterialSupplierReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.contractorName}>Contractor #{review.contractor_id.slice(-4)}</Text>
        <Text style={styles.reviewDate}>
          {new Date(review.timestamp).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.ratingsContainer}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Overall:</Text>
          <StarRating rating={review.rating_overall} readonly size={16} showNumber />
        </View>
        
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Delivery:</Text>
          <StarRating rating={review.rating_delivery} readonly size={16} showNumber />
        </View>
        
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Quality:</Text>
          <StarRating rating={review.rating_quality} readonly size={16} showNumber />
        </View>
      </View>
      
      {review.comment && (
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Comment:</Text>
          <Text style={styles.commentText}>{review.comment}</Text>
        </View>
      )}
      
      <Text style={styles.orderInfo}>Order: #{review.order_id.slice(-8)}</Text>
    </View>
  );
}

function RatingsSummary({ supplierId }: { supplierId: string }) {
  const [stats, setStats] = useState({
    avg_overall: 0,
    avg_delivery: 0,
    avg_quality: 0,
    review_count: 0
  });

  useEffect(() => {
    loadStats();
  }, [supplierId]);

  const loadStats = async () => {
    try {
      const ratingStats = await ReviewService.getSupplierRatingStats(supplierId);
      setStats(ratingStats);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

  if (stats.review_count === 0) {
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>No Reviews Yet</Text>
        <Text style={styles.summarySubtitle}>Complete your first order to receive reviews</Text>
      </View>
    );
  }

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Rating Summary</Text>
      <Text style={styles.reviewCount}>{stats.review_count} reviews</Text>
      
      <View style={styles.summaryRatings}>
        <View style={styles.summaryRatingRow}>
          <Text style={styles.summaryLabel}>Overall</Text>
          <StarRating rating={stats.avg_overall} readonly size={20} showNumber />
        </View>
        
        <View style={styles.summaryRatingRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <StarRating rating={stats.avg_delivery} readonly size={20} showNumber />
        </View>
        
        <View style={styles.summaryRatingRow}>
          <Text style={styles.summaryLabel}>Quality</Text>
          <StarRating rating={stats.avg_quality} readonly size={20} showNumber />
        </View>
      </View>
    </View>
  );
}

export default function ReviewsTab({ supplierId }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<MaterialSupplierReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [supplierId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await ReviewService.getReviewsBySupplier(supplierId);
      setReviews(reviewsData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <RatingsSummary supplierId={supplierId} />
        
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet</Text>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16
  },
  summaryRatings: {
    gap: 12
  },
  summaryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 80
  },
  reviewsSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#495057'
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic'
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  contractorName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  reviewDate: {
    fontSize: 12,
    color: '#666'
  },
  ratingsContainer: {
    gap: 8,
    marginBottom: 12
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60
  },
  commentContainer: {
    marginBottom: 12
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  orderInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right'
  }
});