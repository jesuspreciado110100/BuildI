import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { PhotoGallery } from './PhotoGallery';
import { PhotoUploadModal } from './PhotoUploadModal';
import { BIMViewer } from './BIMViewer';

interface ProgressPhoto {
  id: string;
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnail?: string;
}

interface ConceptVisualSectionProps {
  conceptId: string;
  siteId: string;
  photos: ProgressPhoto[];
  hasBIMModel: boolean;
  onPhotoUploaded?: (progress: number) => void;
  onRefresh?: () => void;
}

export const ConceptVisualSection: React.FC<ConceptVisualSectionProps> = ({
  conceptId,
  siteId,
  photos,
  hasBIMModel,
  onPhotoUploaded,
  onRefresh
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBIMViewer, setShowBIMViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'bim'>('gallery');

  const handlePhotoUpload = (description: string, photoUri: string) => {
    // Simulate progress update when photo is uploaded
    if (onPhotoUploaded) {
      onPhotoUploaded(5); // Add 5% progress for each photo
    }
    if (onRefresh) {
      onRefresh();
    }
    setShowUploadModal(false);
  };

  const handleBIMHighlight = () => {
    // Highlight objects in BIM model related to this concept
    setShowBIMViewer(true);
  };

  const renderPhotoItem = ({ item }: { item: ProgressPhoto }) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => setSelectedPhoto(item)}
    >
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoIcon}>📷</Text>
      </View>
      <View style={styles.photoInfo}>
        <Text style={styles.photoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.photoMeta}>
          By {item.uploadedBy} • {item.uploadedAt}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visual Progress</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={styles.uploadButtonText}>📷 Upload</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
          onPress={() => setActiveTab('gallery')}
        >
          <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
            Gallery ({photos.length})
          </Text>
        </TouchableOpacity>
        
        {hasBIMModel && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bim' && styles.activeTab]}
            onPress={() => setActiveTab('bim')}
          >
            <Text style={[styles.tabText, activeTab === 'bim' && styles.activeTabText]}>
              BIM Model
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {activeTab === 'gallery' && (
        <View style={styles.gallerySection}>
          {photos.length > 0 ? (
            <FlatList
              data={photos}
              renderItem={renderPhotoItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.photoGrid}
            />
          ) : (
            <View style={styles.emptyGallery}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyText}>No progress photos yet</Text>
              <Text style={styles.emptySubtext}>
                Upload photos to track visual progress
              </Text>
            </View>
          )}
        </View>
      )}
      
      {activeTab === 'bim' && hasBIMModel && (
        <View style={styles.bimSection}>
          <View style={styles.bimPlaceholder}>
            <Text style={styles.bimIcon}>🏗️</Text>
            <Text style={styles.bimText}>BIM Model Viewer</Text>
            <TouchableOpacity 
              style={styles.bimButton}
              onPress={handleBIMHighlight}
            >
              <Text style={styles.bimButtonText}>Highlight Related Objects</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <PhotoUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handlePhotoUpload}
        conceptId={conceptId}
        siteId={siteId}
      />
      
      {selectedPhoto && (
        <PhotoGallery
          visible={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={photos}
          initialIndex={photos.findIndex(p => p.id === selectedPhoto.id)}
        />
      )}
      
      {showBIMViewer && (
        <BIMViewer
          visible={showBIMViewer}
          onClose={() => setShowBIMViewer(false)}
          conceptId={conceptId}
          highlightObjects={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  gallerySection: {
    minHeight: 200
  },
  photoGrid: {
    paddingBottom: 16
  },
  photoItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden'
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoIcon: {
    fontSize: 32
  },
  photoInfo: {
    padding: 8
  },
  photoDescription: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4
  },
  photoMeta: {
    fontSize: 10,
    color: '#666'
  },
  emptyGallery: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  bimSection: {
    minHeight: 200
  },
  bimPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  bimIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  bimText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  bimButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  bimButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});