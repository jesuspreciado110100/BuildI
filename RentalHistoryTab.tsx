import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { BookingRequest, RentalFeedback, RentalIssue } from '../types';
import RentalHistoryService from '../services/RentalHistoryService';
import { FavoriteRenterService } from '../services/FavoriteRenterService';
import { GuaranteeClaimModal } from './GuaranteeClaimModal';
import { MachineryEmptyState } from './MachineryEmptyState';
import { styles } from './ContractorDashboardStyles';

interface RentalHistoryTabProps {
  contractorId: string;
}

const mockCompletedRentals: BookingRequest[] = [];

const mockRenterNames: {[key: string]: string} = {
  'renter-1': 'Heavy Equipment Co.',
  'renter-2': 'Construction Rentals LLC'
};

export default function RentalHistoryTab({ contractorId }: RentalHistoryTabProps) {
  const [rentals, setRentals] = useState<BookingRequest[]>([]);
  const [feedback, setFeedback] = useState<{[key: string]: RentalFeedback}>({});
  const [favoriteRenters, setFavoriteRenters] = useState<Set<string>>(new Set());
  const [showFeedbackForm, setShowFeedbackForm] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
    loadFavorites();
  }, [contractorId]);

  const loadRentals = async () => {
    try {
      const completedRentals = mockCompletedRentals.filter(r => r.requester_id === contractorId);
      setRentals(completedRentals);
      
      const feedbackMap: {[key: string]: RentalFeedback} = {};
      for (const rental of completedRentals) {
        const existingFeedback = await RentalHistoryService.getFeedbackByBooking(rental.id);
        if (existingFeedback) {
          feedbackMap[rental.id] = existingFeedback;
        }
      }
      setFeedback(feedbackMap);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const favorites = await FavoriteRenterService.getFavorites(contractorId);
    setFavoriteRenters(new Set(favorites.map(f => f.renter_id)));
  };

  const handleRequestMachine = () => {
    console.log('Request machine from history tab');
  };

  const toggleFavorite = async (rental: BookingRequest) => {
    if (!rental.renter_id) return;
    
    const isFav = favoriteRenters.has(rental.renter_id);
    
    if (isFav) {
      await FavoriteRenterService.removeFavorite(contractorId, rental.renter_id);
      setFavoriteRenters(prev => {
        const newSet = new Set(prev);
        newSet.delete(rental.renter_id!);
        return newSet;
      });
    } else {
      await FavoriteRenterService.addFavorite(contractorId, {
        renter_id: rental.renter_id,
        renter_name: mockRenterNames[rental.renter_id] || 'Unknown Renter',
        last_machine_type: rental.resource_id,
        last_price: rental.final_price,
        last_booking_date: rental.end_date,
        total_bookings: 1,
        average_rating: feedback[rental.id]?.rating || 5.0
      });
      setFavoriteRenters(prev => new Set([...prev, rental.renter_id!]));
    }
  };

  const submitFeedback = async (bookingId: string) => {
    try {
      const newFeedback = await RentalHistoryService.submitFeedback({
        booking_id: bookingId,
        contractor_id: contractorId,
        rating,
        comment: comment.trim() || undefined
      });
      
      setFeedback(prev => ({ ...prev, [bookingId]: newFeedback }));
      setShowFeedbackForm(null);
      setRating(5);
      setComment('');
      Alert.alert('Success', 'Feedback submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  const submitIssue = async (bookingId: string) => {
    const rental = rentals.find(r => r.id === bookingId);
    if (!rental) return;

    try {
      await RentalHistoryService.submitIssue({
        booking_id: bookingId,
        contractor_id: contractorId,
        renter_id: rental.provider_id,
        severity: issueSeverity,
        status: 'Open',
        description: issueDescription,
        photos: []
      });
      
      setShowIssueForm(null);
      setIssueDescription('');
      setIssueSeverity('Medium');
      Alert.alert('Success', 'Issue reported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to report issue');
    }
  };

  const handleClaimSubmitted = () => {
    Alert.alert('Success', 'Your guarantee claim has been submitted for review.');
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const canSubmitClaim = (rental: BookingRequest) => {
    return rental.rental_guarantee_enabled && 
           rental.guarantee_status === 'active' && 
           rental.status === 'completed';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading rental history...</Text>
      </View>
    );
  }

  if (rentals.length === 0) {
    return <MachineryEmptyState onRequestMachine={handleRequestMachine} />;
  }

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Rental History</Text>
      
      {rentals.map(rental => {
        const rentalFeedback = feedback[rental.id];
        const isFavorite = rental.renter_id && favoriteRenters.has(rental.renter_id);
        
        return (
          <View key={rental.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{rental.resource_id}</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.statusBadge}>{rental.status}</Text>
                {rental.rental_guarantee_enabled && (
                  <Text style={styles.guaranteeBadge}>🛡️ Guaranteed</Text>
                )}
              </View>
            </View>
            
            <Text style={styles.cardSubtitle}>
              Renter: {rental.renter_id ? mockRenterNames[rental.renter_id] || 'Unknown' : 'N/A'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {rental.start_date} - {rental.end_date}
            </Text>
            <Text style={styles.cardSubtitle}>Location: {rental.location}</Text>
            <Text style={styles.cardSubtitle}>Total Cost: ${rental.final_price}</Text>
            
            <View style={styles.actionButtons}>
              {!rentalFeedback && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setShowFeedbackForm(rental.id)}
                >
                  <Text style={styles.buttonText}>Rate & Review</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowIssueForm(rental.id)}
              >
                <Text style={styles.buttonText}>Report Issue</Text>
              </TouchableOpacity>
              
              {canSubmitClaim(rental) && (
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={() => setShowClaimModal(rental.id)}
                >
                  <Text style={styles.buttonText}>Submit Claim</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
      
      {showClaimModal && (
        <GuaranteeClaimModal
          visible={true}
          onClose={() => setShowClaimModal(null)}
          bookingId={showClaimModal}
          onClaimSubmitted={handleClaimSubmitted}
        />
      )}
    </ScrollView>
  );
}