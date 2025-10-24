import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SimpleMapView } from './SimpleMapView';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'offline';
  latitude: number;
  longitude: number;
  dailyRate: number;
}

interface MachineryMapViewProps {
  machines?: Machine[];
  onMachineSelect?: (machine: Machine) => void;
  selectedMachineId?: string;
  selectedMachineType?: string;
}

const statusColors = {
  available: '#16a34a',
  in_use: '#eab308',
  offline: '#dc2626'
};

const mockMachines: Machine[] = [
  { id: '1', name: 'CAT 320 Excavator', type: 'excavator', status: 'available', latitude: 40.7128, longitude: -74.0060, dailyRate: 500 },
  { id: '2', name: 'Liebherr Crane', type: 'crane', status: 'available', latitude: 40.7589, longitude: -73.9851, dailyRate: 800 },
  { id: '3', name: 'John Deere Bulldozer', type: 'bulldozer', status: 'in_use', latitude: 40.7505, longitude: -73.9934, dailyRate: 600 },
  { id: '4', name: 'Caterpillar Loader', type: 'loader', status: 'available', latitude: 40.7282, longitude: -73.7949, dailyRate: 450 }
];

export default function MachineryMapView({ 
  machines = mockMachines, 
  onMachineSelect, 
  selectedMachineId, 
  selectedMachineType 
}: MachineryMapViewProps) {
  const filteredMachines = selectedMachineType 
    ? machines.filter(m => m.type === selectedMachineType)
    : machines;

  const mapPins = filteredMachines.map(machine => ({
    id: machine.id,
    name: machine.name,
    lat: machine.latitude,
    lng: machine.longitude,
    type: 'machine' as const,
    status: machine.status,
    price: machine.dailyRate
  }));

  const handlePinPress = (pin: any) => {
    const machine = machines.find(m => m.id === pin.id);
    if (machine) onMachineSelect?.(machine);
  };

  return (
    <View style={styles.container}>
      <SimpleMapView
        pins={mapPins}
        onPinPress={handlePinPress}
        title="Machine Locations"
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: statusColors.available }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: statusColors.in_use }]} />
          <Text style={styles.legendText}>In Use</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: statusColors.offline }]} />
          <Text style={styles.legendText}>Offline</Text>
        </View>
      </View>

      <View style={styles.machinesList}>
        <Text style={styles.listTitle}>Available Machines:</Text>
        {filteredMachines.filter(m => m.status === 'available').map((machine) => (
          <TouchableOpacity
            key={machine.id}
            style={styles.machineCard}
            onPress={() => onMachineSelect?.(machine)}
          >
            <Text style={styles.machineName}>{machine.name}</Text>
            <Text style={styles.machineRate}>${machine.dailyRate}/day</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  legend: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 5 },
  legendText: { fontSize: 10, color: '#374151' },
  machinesList: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  listTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1e293b', backgroundColor: 'white', padding: 8, borderRadius: 8 },
  machineCard: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  machineName: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  machineRate: { fontSize: 14, fontWeight: 'bold', color: '#059669' }
});