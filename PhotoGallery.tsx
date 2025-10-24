import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoPress?: (photo: Photo) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onPhotoPress }) => {
  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No photos available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {photos.map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoContainer}
            onPress={() => onPhotoPress?.(photo)}
          >
            <Image source={{ uri: photo.url }} style={styles.photo} />
            {photo.caption && (
              <Text style={styles.caption} numberOfLines={2}>
                {photo.caption}
              </Text>
            )}
            <Text style={styles.date}>
              {new Date(photo.uploaded_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  scrollView: {
    paddingHorizontal: 4,
  },
  photoContainer: {
    marginRight: 12,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  caption: {
    padding: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  date: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});