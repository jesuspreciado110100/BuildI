import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const LaborMaterialScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('labor');

  const laborTypes = [
    { id: 'general', name: 'General Labor', icon: '👷', rate: '$25/hr' },
    { id: 'electrician', name: 'Electricians', icon: '⚡', rate: '$45/hr' },
    { id: 'plumber', name: 'Plumbers', icon: '🔧', rate: '$40/hr' },
    { id: 'carpenter', name: 'Carpenters', icon: '🔨', rate: '$35/hr' },
  ];

  const materials = [
    { id: 'concrete', name: 'Concrete', icon: '🧱', unit: 'per yard' },
    { id: 'steel', name: 'Steel Rebar', icon: '🔩', unit: 'per ton' },
    { id: 'lumber', name: 'Lumber', icon: '🪵', unit: 'per board ft' },
    { id: 'brick', name: 'Bricks', icon: '🧱', unit: 'per thousand' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Labor & Materials</Text>
        <Text style={styles.subtitle}>Find workers and construction materials</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'labor' && styles.activeTab]}
          onPress={() => setActiveTab('labor')}
        >
          <Text style={[styles.tabText, activeTab === 'labor' && styles.activeTabText]}>
            ⛑️ Labor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'materials' && styles.activeTab]}
          onPress={() => setActiveTab('materials')}
        >
          <Text style={[styles.tabText, activeTab === 'materials' && styles.activeTabText]}>
            🧱 Materials
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {(activeTab === 'labor' ? laborTypes : materials).map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardRate}>
              {activeTab === 'labor' ? (item as any).rate : (item as any).unit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardRate: {
    fontSize: 12,
    color: '#6B7280',
  },
});