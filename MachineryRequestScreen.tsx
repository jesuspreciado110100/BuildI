import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MachineryRequest {
  id: string;
  type: string;
  description: string;
  duration: string;
  location: string;
  status: 'pending' | 'matched' | 'active';
}

export const MachineryRequestScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests] = useState<MachineryRequest[]>([
    { id: '1', type: 'Excavator', description: '20-ton excavator needed', duration: '5 days', location: 'Downtown', status: 'active' },
    { id: '2', type: 'Crane', description: 'Tower crane for high-rise', duration: '30 days', location: 'North Zone', status: 'pending' },
  ]);

  const machineryTypes = ['Excavator', 'Crane', 'Bulldozer', 'Loader', 'Dump Truck', 'Concrete Mixer'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search machinery..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      <View style={styles.quickRequest}>
        <Text style={styles.sectionTitle}>Quick Request</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
          {machineryTypes.map((type) => (
            <TouchableOpacity key={type} style={styles.typeCard}>
              <Ionicons name="construct-outline" size={24} color="#0EA5E9" />
              <Text style={styles.typeText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Requests</Text>
          <TouchableOpacity style={styles.newRequestButton}>
            <Ionicons name="add-outline" size={20} color="#FFFFFF" />
            <Text style={styles.newRequestText}>New Request</Text>
          </TouchableOpacity>
        </View>

        {requests.map((request) => (
          <TouchableOpacity key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestType}>{request.type}</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: request.status === 'active' ? '#10B981' : 
                               request.status === 'pending' ? '#F59E0B' : '#6B7280' 
              }]}>
                <Text style={styles.statusText}>{request.status}</Text>
              </View>
            </View>
            <Text style={styles.requestDescription}>{request.description}</Text>
            <View style={styles.requestDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.detailText}>{request.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#64748B" />
                <Text style={styles.detailText}>{request.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: '#1E293B',
    fontFamily: 'Inter',
  },
  quickRequest: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  typesScroll: {
    marginHorizontal: -4,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeText: {
    fontSize: 8,
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newRequestText: {
    fontSize: 8,
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'Inter',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  requestDescription: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 8,
    color: '#64748B',
    fontFamily: 'Inter',
  },
});