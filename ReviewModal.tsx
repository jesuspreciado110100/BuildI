import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { StarRating } from './StarRating';
import { MaterialSupplierReview } from '../types';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  supplierId: string;
  contractorId: string;
  supplierName: string;
  onSubmit: (review: Omit<MaterialSupplierReview, 'id' | 'timestamp'>) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  orderId,
  supplierId,
  contractorId,
  supplierName,
  onSubmit,
}) => {
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingDelivery, setRatingDelivery] = useState(5);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const review = {
        order_id: orderId,
        contractor_id: contractorId,
        supplier_id: supplierId,
        rating_overall: ratingOverall,
        rating_delivery: ratingDelivery,
        rating_quality: ratingQuality,
        comment: comment.trim() || undefined,
      };
      
      await onSubmit(review);
      Alert.alert('Success', 'Review submitted successfully!');
      onClose();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRatingOverall(5);
    setRatingDelivery(5);
    setRatingQuality(5);
    setComment('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Supplier</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <Text style={styles.supplierName}>{supplierName}</Text>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Overall Rating</Text>
            <StarRating
              rating={ratingOverall}
              onRatingChange={setRatingOverall}
              size={30}
              showNumber
            />
          </View>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Delivery Rating</Text>
            <StarRating
              rating={ratingDelivery}
              onRatingChange={setRatingDelivery}
              size={30}
              showNumber
            />
          </View>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Quality Rating</Text>
            <StarRating
              rating={ratingQuality}
              onRatingChange={setRatingQuality}
              size={30}
              showNumber
            />
          </View>
          
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Comment (Optional)</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with this supplier..."
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});