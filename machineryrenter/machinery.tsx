import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { MachinerySupabaseService, MachineryItem } from '../services/MachinerySupabaseService';
import { EditMachineryModal } from '../components/EditMachineryModal';

export default function MachineryRenterMachinery() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMachinery, setEditingMachinery] = useState<MachineryItem | null>(null);

  useEffect(() => {
    loadMachinery();
  }, [user]);

  const loadMachinery = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const data = await MachinerySupabaseService.getMachineryByOwnerId(user.id);
    setMachinery(data);
    setIsLoading(false);
  };

  const handleDelete = (item: MachineryItem) => {
    Alert.alert(
      'Delete Machinery',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await MachinerySupabaseService.deleteMachinery(item.id);
            if (result.success) {
              Alert.alert('Success', 'Machinery deleted successfully');
              loadMachinery();
            } else {
              Alert.alert('Error', result.error || 'Could not delete machinery');
            }
          },
        },
      ]
    );
  };

  const getStats = () => {
    const available = machinery.filter(m => m.availability_status === 'available').length;
    const rented = machinery.filter(m => m.availability_status === 'rented').length;
    const maintenance = machinery.filter(m => m.availability_status === 'maintenance').length;
    return { available, rented, maintenance, total: machinery.length };
  };

  const stats = getStats();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme === 'dark' ? '#000000' : '#F2F2F7' },
    header: { padding: 20, backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: theme === 'dark' ? '#FFFFFF' : '#000000', marginBottom: 5 },
    headerSubtitle: { fontSize: 16, color: theme === 'dark' ? '#8E8E93' : '#666666' },
    addButton: { backgroundColor: '#007AFF', margin: 20, padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF', marginHorizontal: 20, borderRadius: 12, marginBottom: 20 },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: theme === 'dark' ? '#FFFFFF' : '#000000' },
    statLabel: { fontSize: 12, color: theme === 'dark' ? '#8E8E93' : '#666666', marginTop: 4 },
    machineryCard: { backgroundColor: theme === 'dark' ? '#1C1C1E' : '#FFFFFF', margin: 20, marginTop: 10, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    machineryImage: { width: '100%', height: 150, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#E5E5EA' },
    cardContent: { padding: 16 },
    machineryName: { fontSize: 18, fontWeight: '600', color: theme === 'dark' ? '#FFFFFF' : '#000000', marginBottom: 4 },
    machineryType: { fontSize: 14, color: theme === 'dark' ? '#8E8E93' : '#666666', marginBottom: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    locationText: { fontSize: 14, color: theme === 'dark' ? '#8E8E93' : '#666666' },
    rateText: { fontSize: 16, fontWeight: '600', color: '#34C759' },
    actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
    actionButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    editButton: { backgroundColor: '#007AFF' },
    deleteButton: { backgroundColor: '#FF3B30' },
    actionText: { color: '#FFF', fontWeight: '600', marginLeft: 5 },
    emptyState: { alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 16, color: theme === 'dark' ? '#8E8E93' : '#666666', marginTop: 10 },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#34C759', text: '#FFFFFF' };
      case 'rented': return { bg: '#FF9500', text: '#FFFFFF' };
      case 'maintenance': return { bg: '#FF3B30', text: '#FFFFFF' };
      default: return { bg: '#8E8E93', text: '#FFFFFF' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Machinery</Text>
        <Text style={styles.headerSubtitle}>Manage your equipment fleet</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>{stats.available}</Text>
          <Text style={styles.statLabel}>AVAILABLE</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>{stats.rented}</Text>
          <Text style={styles.statLabel}>RENTED</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{stats.maintenance}</Text>
          <Text style={styles.statLabel}>MAINTENANCE</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/machineryrenter/add-machinery')}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Machinery</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {machinery.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>No machinery added yet</Text>
          </View>
        ) : (
          machinery.map((item) => {
            const statusColors = getStatusColor(item.availability_status);
            return (
              <View key={item.id} style={styles.machineryCard}>
                {item.image_url && <Image source={{ uri: item.image_url }} style={styles.machineryImage} />}
                <View style={styles.cardContent}>
                  <Text style={styles.machineryName}>{item.name}</Text>
                  <Text style={styles.machineryType}>{item.model}</Text>
                  
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>{item.availability_status}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.locationText}>📍 {item.location}</Text>
                    <Text style={styles.rateText}>${item.daily_rate}/day</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => setEditingMachinery(item)}>
                      <Ionicons name="pencil" size={16} color="#FFF" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash" size={16} color="#FFF" />
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {editingMachinery && (
        <EditMachineryModal
          machinery={editingMachinery}
          visible={!!editingMachinery}
          onClose={() => setEditingMachinery(null)}
          onSave={() => {
            setEditingMachinery(null);
            loadMachinery();
          }}
        />
      )}
    </View>
  );
}
