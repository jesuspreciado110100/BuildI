import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
}

interface ActiveSitesCarouselProps {
  sites: Site[];
  onSitePress?: (siteId: string) => void;
}

export const ActiveSitesCarousel: React.FC<ActiveSitesCarouselProps> = ({
  sites = [],
  onSitePress
}) => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth * 0.8;

  const handleSitePress = (siteId: string) => {
    if (onSitePress) {
      onSitePress(siteId);
    } else {
      router.push(`/contractor/sites/${siteId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'delayed':
        return '#F59E0B';
      case 'at risk':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981';
    if (progress >= 60) return '#3B82F6';
    if (progress >= 40) return '#F59E0B';
    return '#EF4444';
  };

  if (!sites || sites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Sites</Text>
        <Text style={styles.emptySubtitle}>Your active construction sites will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      snapToInterval={cardWidth + 16}
      decelerationRate="fast"
    >
      {sites.map((site) => (
        <TouchableOpacity
          key={site.id}
          style={[styles.siteCard, { width: cardWidth }]}
          onPress={() => handleSitePress(site.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.siteName} numberOfLines={1}>{site.name || 'Unnamed Site'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(site.status) }]}>
              <Text style={styles.statusText}>{site.status || 'Unknown'}</Text>
            </View>
          </View>
          
          <Text style={styles.siteLocation} numberOfLines={1}>{site.location || 'No location'}</Text>
          
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{site.progress || 0}%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${site.progress || 0}%`,
                    backgroundColor: getProgressColor(site.progress || 0)
                  }
                ]} 
              />
            </View>
          </View>
          
          <Text style={styles.tapHint}>Tap to view details</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
  },
  siteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  siteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  siteLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tapHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});