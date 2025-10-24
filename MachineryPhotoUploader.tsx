import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface Photo {
  id: string;
  uri: string;
  url?: string;
  caption?: string;
  displayOrder: number;
}

interface MachineryPhotoUploaderProps {
  machineryId: string;
  existingPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
  maxPhotos?: number;
}

export const MachineryPhotoUploader: React.FC<MachineryPhotoUploaderProps> = ({
  machineryId,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 10
}) => {
  const [photos, setPhotos] = useState<Photo[]>(existingPhotos);
  const [isUploading, setIsUploading] = useState(false);

  const pickImages = async () => {
    Alert.alert(
      'Agregar Fotos',
      'La funcionalidad de carga de fotos estará disponible próximamente',
      [{ text: 'OK' }]
    );
  };

  const deletePhoto = async (photoId: string) => {
    Alert.alert('Eliminar foto', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('machinery_photos').delete().eq('photo_id', photoId);
          const updated = photos.filter(p => p.id !== photoId);
          setPhotos(updated);
          onPhotosChange?.(updated);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fotos de la Maquinaria</Text>
      <Text style={styles.subtitle}>{photos.length}/{maxPhotos} fotos</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
        {photos.map((photo, index) => (
          <View key={photo.id} style={styles.photoContainer}>
            <Image source={{ uri: photo.url || photo.uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePhoto(photo.id)}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>{index + 1}</Text>
            </View>
          </View>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={pickImages}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#0EA5E9" />
            ) : (
              <>
                <Ionicons name="add" size={32} color="#0EA5E9" />
                <Text style={styles.addText}>Agregar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  photoScroll: { flexDirection: 'row' },
  photoContainer: { marginRight: 12, position: 'relative' },
  photo: { width: 120, height: 120, borderRadius: 12 },
  deleteButton: { position: 'absolute', top: 4, right: 4 },
  orderBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#0EA5E9', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  orderText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  addButton: { width: 120, height: 120, borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addText: { fontSize: 14, color: '#0EA5E9', marginTop: 4 },
});
