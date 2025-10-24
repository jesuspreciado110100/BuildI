import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { WorkerProfile } from '../types';

interface WorkerCardProps {
  worker: WorkerProfile;
  onPress: () => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onPress }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'Available now': return '#4CAF50';
      case 'Soon': return '#FF9800';
      case 'Busy': return '#F44336';
      default: return '#757575';
    }
  };

  const getCertificationBadge = () => {
    const certs = worker.skill_certifications || [];
    if (certs.length === 0) return null;
    return certs.length >= 2 ? '🏆' : '✅';
  };

  const getSkillsPreview = () => {
    const skills = worker.skills || [];
    if (skills.length === 0) return null;
    return skills.slice(0, 2).join(', ') + (skills.length > 2 ? '...' : '');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Image 
          source={{ uri: worker.photos?.[0] || 'https://via.placeholder.com/60' }} 
          style={styles.profilePhoto}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            {worker.is_featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>★</Text>
              </View>
            )}
            {getCertificationBadge() && (
              <Text style={styles.certBadge}>{getCertificationBadge()}</Text>
            )}
          </View>
          <View style={styles.tradeBadge}>
            <Text style={styles.tradeText}>{worker.trade_type}</Text>
          </View>
          {getSkillsPreview() && (
            <Text style={styles.skillsPreview}>{getSkillsPreview()}</Text>
          )}
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${worker.unit_price}/{worker.preferred_unit_type || 'm²'}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.ratingContainer}>
          <Text style={styles.stars}>{renderStars(worker.rating)}</Text>
          <Text style={styles.rating}>{worker.rating}</Text>
          <Text style={styles.jobCount}>({worker.completed_jobs_count} jobs)</Text>
        </View>
        
        <View style={styles.availabilityContainer}>
          <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(worker.availability_status) }]} />
          <Text style={styles.availability}>{worker.availability_status}</Text>
        </View>
      </View>
      
      {worker.photos && worker.photos.length > 1 && (
        <View style={styles.photoPreview}>
          {worker.photos.slice(1, 4).map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.previewPhoto} />
          ))}
          {worker.photos.length > 4 && (
            <View style={styles.morePhotos}>
              <Text style={styles.morePhotosText}>+{worker.photos.length - 4}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  profilePhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  featuredBadge: { backgroundColor: '#FFD700', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  featuredText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  certBadge: { fontSize: 16, marginLeft: 4 },
  tradeBadge: { backgroundColor: '#E3F2FD', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  tradeText: { fontSize: 12, color: '#1976D2', fontWeight: '500' },
  skillsPreview: { fontSize: 11, color: '#666', marginTop: 2 },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  details: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  stars: { fontSize: 14, color: '#FFD700', marginRight: 4 },
  rating: { fontSize: 14, fontWeight: '600', color: '#333', marginRight: 4 },
  jobCount: { fontSize: 12, color: '#666' },
  availabilityContainer: { flexDirection: 'row', alignItems: 'center' },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  availability: { fontSize: 12, color: '#666' },
  photoPreview: { flexDirection: 'row', marginTop: 8 },
  previewPhoto: { width: 40, height: 40, borderRadius: 8, marginRight: 8 },
  morePhotos: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  morePhotosText: { fontSize: 12, color: '#666', fontWeight: '500' }
});