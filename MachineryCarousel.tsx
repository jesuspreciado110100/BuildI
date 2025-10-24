import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Text, ActivityIndicator } from 'react-native';
import { MachineryTypeAccessoryScreen } from './MachineryTypeAccessoryScreen';
import { MachinerySupabaseService } from '../services/MachinerySupabaseService';

interface MachineryType {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface MachineryCarouselProps {
  onTypeSelect: (type: MachineryType) => void;
  selectedCategory: string | null;
}

export const MachineryCarousel: React.FC<MachineryCarouselProps> = ({ onTypeSelect, selectedCategory }) => {
  const [showAccessoryScreen, setShowAccessoryScreen] = useState(false);
  const [selectedMachineryType, setSelectedMachineryType] = useState('');
  const [machineryTypes, setMachineryTypes] = useState<MachineryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMachineryTypes();
  }, []);

  const loadMachineryTypes = async () => {
    setLoading(true);
    const types = await MachinerySupabaseService.getMachineryTypes();
    setMachineryTypes(types);
    setLoading(false);
  };

  const handleTypePress = (type: MachineryType) => {
    setSelectedMachineryType(type.name);
    setShowAccessoryScreen(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Tipos de Maquinaria</Text>
        <Text style={styles.sectionSubtitle}>Selecciona una categoría</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {machineryTypes.map((type) => (
          <TouchableOpacity key={type.id} style={[styles.typeCard, selectedCategory === type.slug && styles.selectedCard]} onPress={() => handleTypePress(type)}>
            {type.image_url ? (
              <ImageBackground source={{ uri: type.image_url }} style={styles.cardBackground} imageStyle={styles.imageStyle}>
                <View style={styles.overlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.typeName}>{type.name}</Text>
                </View>
              </ImageBackground>
            ) : (
              <View style={styles.fallbackCard}>
                <Text style={styles.typeName}>{type.name}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <MachineryTypeAccessoryScreen visible={showAccessoryScreen} onClose={() => setShowAccessoryScreen(false)} machineryType={selectedMachineryType} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    paddingVertical: 20, 
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: { paddingVertical: 20, alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20 },
  typeCard: { width: 140, height: 100, marginRight: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#0EA5E9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  selectedCard: { borderWidth: 3, borderColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  cardBackground: { flex: 1, justifyContent: 'flex-end' },
  imageStyle: { borderRadius: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.35)', borderRadius: 16 },
  fallbackCard: { flex: 1, backgroundColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 16 },
  cardContent: { padding: 12, zIndex: 1 },
  typeName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }
});

