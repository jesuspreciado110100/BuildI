import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CrewManager() {
  const [searchQuery, setSearchQuery] = useState('');

  const crews = [
    {
      id: 1,
      name: 'Alpha Crew',
      leader: 'John Smith',
      members: 8,
      status: 'active',
      project: 'Downtown Plaza',
      efficiency: 95,
    },
    {
      id: 2,
      name: 'Beta Crew',
      leader: 'Maria Garcia',
      members: 6,
      status: 'active',
      project: 'Residential Complex',
      efficiency: 88,
    },
    {
      id: 3,
      name: 'Gamma Crew',
      leader: 'David Johnson',
      members: 10,
      status: 'break',
      project: 'Office Building',
      efficiency: 92,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'break': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crew Manager</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search crews..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Active Crews</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>24</Text>
          <Text style={styles.summaryLabel}>Total Workers</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>92%</Text>
          <Text style={styles.summaryLabel}>Avg Efficiency</Text>
        </View>
      </View>

      <View style={styles.crewsList}>
        {crews.map((crew) => (
          <TouchableOpacity key={crew.id} style={styles.crewCard}>
            <View style={styles.crewHeader}>
              <View style={styles.crewInfo}>
                <Text style={styles.crewName}>{crew.name}</Text>
                <Text style={styles.crewLeader}>Led by {crew.leader}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crew.status) }]}>
                <Text style={styles.statusText}>{crew.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.crewDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{crew.members} members</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="construct" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{crew.project}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="trending-up" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{crew.efficiency}% efficiency</Text>
              </View>
            </View>

            <View style={styles.crewActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="eye" size={16} color="#2563EB" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="create" size={16} color="#2563EB" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  crewsList: {
    padding: 20,
  },
  crewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  crewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  crewLeader: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  crewDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  crewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
});