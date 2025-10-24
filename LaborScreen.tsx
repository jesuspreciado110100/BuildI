import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LaborTradesCarousel } from './LaborTradesCarousel';
import { LaborRequestForm } from './LaborRequestForm';
import { LaborEmptyState } from './LaborEmptyState';

interface LaborScreenProps {
  userId: string;
  userRole: string;
}

export function LaborScreen({ userId, userRole }: LaborScreenProps) {
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleTradeSelect = (trade: any) => {
    setSelectedTrade(trade);
    setShowRequestForm(true);
  };

  const handleRequestSubmit = () => {
    setShowRequestForm(false);
    setSelectedTrade(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={24} color="#007AFF" />
          <Ionicons name="people" size={24} color="#007AFF" style={styles.iconSpacing} />
        </View>
        <Text style={styles.title}>Labor & Materials</Text>
        <Text style={styles.subtitle}>Manage workforce and materials</Text>
      </View>
      
      <LaborTradesCarousel 
        onTradeSelect={handleTradeSelect}
        selectedTradeId={selectedTrade?.id}
      />
      
      <View style={styles.content}>
        {showRequestForm && selectedTrade ? (
          <View style={styles.requestSection}>
            <Text style={styles.sectionTitle}>
              Solicitar: {selectedTrade.name}
            </Text>
            <LaborRequestForm 
              tradeType={selectedTrade.id}
              onSubmit={handleRequestSubmit}
              onCancel={() => setShowRequestForm(false)}
            />
          </View>
        ) : (
          <LaborEmptyState 
            message="Selecciona un oficio para solicitar trabajadores"
            onAction={() => {}}
          />
        )}
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Material Orders</Text>
          <Text style={styles.cardDescription}>Order construction materials</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconSpacing: {
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  requestSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});