import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SiteBannerProps {
  siteName: string;
  region: string;
  client: string;
}

export const SiteBanner: React.FC<SiteBannerProps> = ({
  siteName,
  region,
  client
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.titleRow}>
        <Ionicons name="business-outline" size={24} color="#3b82f6" />
        <Text style={styles.siteName}>{siteName}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{region}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{client}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  siteName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
});
