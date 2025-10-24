import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface TradesmanJob {
  id: string;
  tradesmanName: string;
  profilePicture: string;
  workImage: string;
  price: number;
  trade: string;
  rating: number;
  location: string;
  description: string;
}

interface TradesmanJobCardProps {
  job: TradesmanJob;
  onPress: (job: TradesmanJob) => void;
}

export const TradesmanJobCard: React.FC<TradesmanJobCardProps> = ({ job, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(job)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: job.workImage }} style={styles.workImage} />
        <View style={styles.profileContainer}>
          <Image source={{ uri: job.profilePicture }} style={styles.profileImage} />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.tradesmanName}>{job.tradesmanName}</Text>
        <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${job.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {job.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.location}>{job.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 280,
  },
  imageContainer: {
    position: 'relative',
  },
  workImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  profileContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    padding: 12,
  },
  tradesmanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#FF9800',
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
});