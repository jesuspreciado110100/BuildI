import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface FleetProvider {
  id: string;
  name: string;
  location: string;
  machineCount: number;
  rating: number;
  verified: boolean;
}

export default function MachineryRenterFleet() {
  const { theme } = useTheme();
  const [providers] = useState<FleetProvider[]>([
    { id: '1', name: 'BuildCorp Fleet', location: 'Downtown', machineCount: 45, rating: 4.8, verified: true },
    { id: '2', name: 'Heavy Machinery Co', location: 'Industrial Zone', machineCount: 32, rating: 4.6, verified: true },
    { id: '3', name: 'Construction Partners', location: 'North Side', machineCount: 28, rating: 4.5, verified: false }
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#000000' : '#F2F2F7',
    },
    header: {
      padding: 20,
      backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    },
    providerCard: {
      backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF',
      margin: 20,
      marginTop: 10,
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    providerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    providerName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    },
    verifiedBadge: {
      backgroundColor: '#34C759',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    verifiedText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    providerInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    infoText: {
      color: theme === 'dark' ? '#8E8E93' : '#666666',
      fontSize: 14,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      marginLeft: 4,
      color: theme === 'dark' ? '#8E8E93' : '#666666',
      fontSize: 14,
    },
    viewButton: {
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fleet Access</Text>
      </View>

      <ScrollView>
        {providers.map((provider) => (
          <View key={provider.id} style={styles.providerCard}>
            <View style={styles.providerHeader}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              )}
            </View>
            
            <View style={styles.providerInfo}>
              <Text style={styles.infoText}>📍 {provider.location}</Text>
              <Text style={styles.infoText}>{provider.machineCount} machines</Text>
            </View>

            <View style={styles.providerInfo}>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{provider.rating}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.buttonText}>View Fleet</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
