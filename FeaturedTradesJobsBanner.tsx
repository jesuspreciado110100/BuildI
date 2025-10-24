import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturedJob {
  id: string;
  title: string;
  trade: string;
  location: string;
  rate: string;
  duration: string;
  urgency: 'high' | 'medium' | 'low';
  imageUrl: string;
}

export const FeaturedTradesJobsBanner: React.FC = () => {
  const featuredJobs: FeaturedJob[] = [
    {
      id: '1',
      title: 'Electricista Residencial',
      trade: 'Electricidad',
      location: 'Zona Norte',
      rate: '$450/día',
      duration: '3 días',
      urgency: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Maestro Albañil',
      trade: 'Albañilería',
      location: 'Centro',
      rate: '$400/día',
      duration: '1 semana',
      urgency: 'medium',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Carpintero Especializado',
      trade: 'Carpintería',
      location: 'Zona Sur',
      rate: '$380/día',
      duration: '5 días',
      urgency: 'low',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop'
    },
    {
      id: '4',
      title: 'Plomero Comercial',
      trade: 'Plomería',
      location: 'Zona Este',
      rate: '$420/día',
      duration: '2 días',
      urgency: 'high',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgente';
      case 'medium': return 'Moderado';
      case 'low': return 'Flexible';
      default: return 'Normal';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Trabajos Destacados</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={16} color="#0EA5E9" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {featuredJobs.map((job) => (
          <TouchableOpacity key={job.id} style={styles.jobCard}>
            <ImageBackground
              source={{ uri: job.imageUrl }}
              style={styles.jobImage}
              imageStyle={styles.jobImageStyle}
            >
              <View style={styles.jobOverlay}>
                <View style={styles.jobHeader}>
                  <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(job.urgency) }]}>
                    <Text style={styles.urgencyText}>{getUrgencyText(job.urgency)}</Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
            
            <View style={styles.jobContent}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.jobMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="construct-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.trade}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.location}</Text>
                </View>
              </View>
              
              <View style={styles.jobFooter}>
                <View style={styles.rateContainer}>
                  <Text style={styles.rate}>{job.rate}</Text>
                  <Text style={styles.duration}>{job.duration}</Text>
                </View>
                <TouchableOpacity style={styles.applyButton}>
                  <Text style={styles.applyText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'System',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    marginRight: 4,
    fontFamily: 'System',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  jobImage: {
    height: 140,
    justifyContent: 'space-between',
  },
  jobImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  jobOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
  favoriteButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  jobContent: {
    padding: 16,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'System',
  },
  jobMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'System',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateContainer: {
    flex: 1,
  },
  rate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
    fontFamily: 'System',
  },
  duration: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'System',
  },
  applyButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
});