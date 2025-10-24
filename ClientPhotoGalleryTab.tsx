import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { ProgressLog } from '../types';
import { ClientPortalService } from '../services/ClientPortalService';

interface ClientPhotoGalleryTabProps {
  userId: string;
}

export const ClientPhotoGalleryTab: React.FC<ClientPhotoGalleryTabProps> = ({ userId }) => {
  const [photos, setPhotos] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  const loadPhotos = async () => {
    try {
      const sites = await ClientPortalService.getClientSites(userId);
      const allPhotos: ProgressLog[] = [];
      
      for (const site of sites) {
        const sitePhotos = await ClientPortalService.getProgressPhotos(site.id);
        allPhotos.push(...sitePhotos);
      }
      
      setPhotos(allPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPhotos = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return photos;
    }
    
    return photos.filter(photo => new Date(photo.date) >= filterDate);
  };

  const filteredPhotos = getFilteredPhotos();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Gallery</Text>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by date:</Text>
        <View style={styles.filterButtons}>
          {(['all', 'week', 'month'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                dateFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setDateFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                dateFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter === 'all' ? 'All Time' : `Last ${filter}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>📸</Text>
          <Text style={styles.emptyStateTitle}>No Photos Found</Text>
          <Text style={styles.emptyStateSubtext}>
            {dateFilter === 'all' 
              ? 'No progress photos have been uploaded yet.'
              : `No photos found for the selected time period.`
            }
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.photosContainer}>
          <Text style={styles.photosCount}>
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''} found
          </Text>
          
          {filteredPhotos.map((log) => (
            <View key={log.id} style={styles.photoLogCard}>
              <View style={styles.photoLogHeader}>
                <Text style={styles.photoLogDate}>
                  {new Date(log.date).toLocaleDateString()}
                </Text>
                <Text style={styles.photoLogProgress}>
                  Progress: {log.progress_percentage}%
                </Text>
              </View>
              
              {log.notes && (
                <Text style={styles.photoLogNotes}>{log.notes}</Text>
              )}
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.photosRow}
              >
                {log.photos?.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoContainer}
                    onPress={() => setSelectedPhoto(photo)}
                  >
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoIcon}>📷</Text>
                      <Text style={styles.photoName}>{photo}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground}
            onPress={() => setSelectedPhoto(null)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Progress Photo</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.fullPhotoContainer}>
                <View style={styles.fullPhotoPlaceholder}>
                  <Text style={styles.fullPhotoIcon}>📷</Text>
                  <Text style={styles.fullPhotoName}>{selectedPhoto}</Text>
                  <Text style={styles.fullPhotoSubtext}>Photo preview would appear here</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  photosContainer: {
    flex: 1,
  },
  photosCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photoLogCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoLogDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  photoLogProgress: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  photoLogNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  photosRow: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  photoName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  fullPhotoContainer: {
    padding: 20,
  },
  fullPhotoPlaceholder: {
    height: 300,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fullPhotoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  fullPhotoName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fullPhotoSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});