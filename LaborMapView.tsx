import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SimpleMapView } from './SimpleMapView';
import { WorkerLocation, SafetyZone, SafetyIncident, safetyService } from '../services/SafetyService';

interface LaborMapViewProps {
  siteId: string;
}

export default function LaborMapView({ siteId }: LaborMapViewProps) {
  const [workers, setWorkers] = useState<WorkerLocation[]>([
    {
      id: 'worker-1',
      name: 'John Smith',
      role: 'Foreman',
      status: 'active',
      lat: 40.7128,
      lng: -74.0060,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'worker-2',
      name: 'Mike Johnson',
      role: 'Electrician',
      status: 'active',
      lat: 40.7126,
      lng: -74.0058,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'worker-3',
      name: 'Sarah Davis',
      role: 'Plumber',
      status: 'break',
      lat: 40.7130,
      lng: -74.0062,
      lastUpdate: new Date().toISOString()
    }
  ]);

  const [zones] = useState<SafetyZone[]>(safetyService.getZones());
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers(prev => prev.map(worker => {
        const newLat = worker.lat + (Math.random() - 0.5) * 0.0002;
        const newLng = worker.lng + (Math.random() - 0.5) * 0.0002;
        
        const updatedWorker = {
          ...worker,
          lat: newLat,
          lng: newLng,
          lastUpdate: new Date().toISOString()
        };

        const incident = safetyService.checkWorkerInZone(updatedWorker);
        if (incident) {
          setIncidents(prev => [...prev, incident]);
          Alert.alert(
            'Safety Alert!',
            `${incident.workerName} entered ${incident.zoneName} (${incident.zoneType} zone)`
          );
        }

        return updatedWorker;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const mapPins = workers.map(worker => ({
    id: worker.id,
    name: worker.name,
    lat: worker.lat,
    lng: worker.lng,
    type: 'worker' as const,
    status: worker.status
  }));

  const handlePinPress = (pin: any) => {
    const worker = workers.find(w => w.id === pin.id);
    if (worker) {
      Alert.alert(
        worker.name,
        `Role: ${worker.role}\nStatus: ${worker.status}\nLast Update: ${new Date(worker.lastUpdate).toLocaleTimeString()}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Worker Map</Text>
      
      <SimpleMapView
        pins={mapPins}
        onPinPress={handlePinPress}
        title="Worker Locations"
      />

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Restricted</Text>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Caution</Text>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Active</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 18, fontWeight: 'bold', padding: 16, color: '#1e293b' },
  legend: { 
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  legendTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  legendText: { fontSize: 12, marginRight: 16 }
});