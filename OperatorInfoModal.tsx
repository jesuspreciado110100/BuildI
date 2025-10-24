import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { OperatorTrackerService } from '../services/OperatorTrackerService';

interface OperatorInfo {
  id: string;
  name: string;
  photo: string;
  yearsExperience: number;
  licenseType: string;
  rating: number;
  completedJobs: number;
  specializations: string[];
  phone: string;
  certifications: string[];
}

interface OperatorInfoModalProps {
  visible: boolean;
  onClose: () => void;
  operatorId: string;
  rentalId: string;
}

export default function OperatorInfoModal({ visible, onClose, operatorId, rentalId }: OperatorInfoModalProps) {
  const [operator, setOperator] = React.useState<OperatorInfo | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (visible && operatorId) {
      loadOperatorInfo();
    }
  }, [visible, operatorId]);

  const loadOperatorInfo = async () => {
    try {
      setLoading(true);
      const info = await OperatorTrackerService.getOperatorInfo(operatorId);
      setOperator(info);
    } catch (error) {
      console.error('Error loading operator info:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, i < rating && styles.starFilled]}>
        ★
      </Text>
    ));
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.loadingText}>Loading operator info...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!operator) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.errorText}>Operator information not available</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Operator Information</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.operatorCard}>
              <Image source={{ uri: operator.photo }} style={styles.photo} />
              <View style={styles.basicInfo}>
                <Text style={styles.name}>{operator.name}</Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.stars}>
                    {renderStars(operator.rating)}
                  </View>
                  <Text style={styles.ratingText}>({operator.rating}/5)</Text>
                </View>
                <Text style={styles.jobsCount}>{operator.completedJobs} jobs completed</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <Text style={styles.experienceText}>
                {operator.yearsExperience} years of professional experience
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>License</Text>
              <View style={styles.licenseCard}>
                <Text style={styles.licenseType}>{operator.licenseType}</Text>
                <Text style={styles.licenseStatus}>✓ Verified</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specializations</Text>
              <View style={styles.specializations}>
                {operator.specializations.map((spec, index) => (
                  <View key={index} style={styles.specializationTag}>
                    <Text style={styles.specializationText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {operator.certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <Text style={styles.certificationText}>✓ {cert}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.contactText}>📞 {operator.phone}</Text>
              <Text style={styles.contactNote}>
                Contact through the app for rental-related communication
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151'
  },
  closeIcon: {
    padding: 8
  },
  closeIconText: {
    fontSize: 18,
    color: '#6b7280'
  },
  operatorCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8
  },
  star: {
    fontSize: 16,
    color: '#d1d5db'
  },
  starFilled: {
    color: '#fbbf24'
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280'
  },
  jobsCount: {
    fontSize: 14,
    color: '#6b7280'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  experienceText: {
    fontSize: 14,
    color: '#6b7280'
  },
  licenseCard: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  licenseType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  licenseStatus: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500'
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  specializationTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  specializationText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500'
  },
  certificationItem: {
    marginBottom: 4
  },
  certificationText: {
    fontSize: 14,
    color: '#059669'
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  contactNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  closeButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    padding: 20
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ef4444',
    padding: 20
  }
});