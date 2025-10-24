import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { supabase } from '../lib/supabase';

export type ConstructionType = {
  id: string;
  name: string;
  color: string;
  count: number;
  image?: string;
};

interface ConstructionTypesCarouselProps {
  onTypeSelect?: (type: ConstructionType | null) => void;
  selectedType?: ConstructionType | null;
}

export default function ConstructionTypesCarousel({ 
  onTypeSelect, 
  selectedType 
}: ConstructionTypesCarouselProps) {
  const [activeType, setActiveType] = useState<string>('all');
  const [constructionTypes, setConstructionTypes] = useState<ConstructionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    fetchConstructionTypes();
  }, []);

  const fetchConstructionTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('construction_type')
        .not('construction_type', 'is', null);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setTotalProjects(data?.length || 0);

      const typeCounts: { [key: string]: number } = {};
      data?.forEach(p => {
        if (p.construction_type && typeof p.construction_type === 'string') {
          typeCounts[p.construction_type] = (typeCounts[p.construction_type] || 0) + 1;
        }
      });

      const types: ConstructionType[] = Object.keys(typeCounts).map(type => ({
        id: type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        color: getColorForType(type),
        count: typeCounts[type],
        image: getImageForType(type)
      }));

      setConstructionTypes(types);
    } catch (error) {
      console.error('Error fetching construction types:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorForType = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      'residential': '#3b82f6',
      'commercial': '#10b981',
      'infrastructure': '#8b5cf6',
      'industrial': '#f59e0b',
      'institutional': '#ef4444',
      'agricultural': '#eab308'
    };
    return colorMap[type.toLowerCase()] || '#6b7280';
  };

  const getImageForType = (type: string): string => {
    const imageMap: { [key: string]: string } = {
      'commercial': 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1760136244502_239f4bcc.webp',
      'residential': 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1760136249291_232f2a87.webp',
      'infrastructure': 'https://d64gsuwffb70l.cloudfront.net/6866d7fd2425e0d4a78bfd43_1760136253851_0bf586d8.webp'
    };
    return imageMap[type.toLowerCase()] || '';
  };

  const handleTypePress = (typeId: string) => {
    setActiveType(typeId);
    if (typeId === 'all') {
      onTypeSelect?.(null);
    } else {
      const type = constructionTypes.find(t => t.id === typeId);
      onTypeSelect?.(type || null);
    }
  };

  const renderTypeCard = (type: ConstructionType) => {
    const isSelected = activeType === type.id;
    
    return (
      <TouchableOpacity 
        key={type.id}
        style={[styles.typeCard, isSelected && styles.selectedCard]}
        onPress={() => handleTypePress(type.id)}
        activeOpacity={0.8}
      >
        <ImageBackground 
          source={{ uri: type.image }} 
          style={styles.cardBackground}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.typeName}>{type.name}</Text>
            <Text style={styles.projectCount}>{type.count} Project{type.count !== 1 ? 's' : ''}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Construction Types</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color="#3b82f6" style={styles.loader} />
      ) : constructionTypes.length === 0 ? (
        <Text style={styles.emptyText}>No construction types found</Text>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.typeCarousel}
          contentContainerStyle={styles.typeCarouselContent}
        >
          <TouchableOpacity 
            style={[styles.typeCard, activeType === 'all' && styles.selectedCard]}
            onPress={() => handleTypePress('all')}
            activeOpacity={0.8}
          >
            <View style={[styles.allTypesCard, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.typeName}>All Types</Text>
              <Text style={styles.projectCount}>{totalProjects} Project{totalProjects !== 1 ? 's' : ''}</Text>
            </View>
          </TouchableOpacity>
          
          {constructionTypes.map(renderTypeCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#1e293b',
  },
  loader: {
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  typeCarousel: {
    paddingLeft: 16,
  },
  typeCarouselContent: {
    paddingRight: 16,
  },
  typeCard: {
    borderRadius: 16,
    marginRight: 12,
    width: 180,
    height: 120,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  allTypesCard: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    borderRadius: 16,
  },
  typeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  projectCount: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
  },
});
