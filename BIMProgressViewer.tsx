import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { BIMObject, VisualProgressLog } from '../types';
import { visualProgressService } from '../services/VisualProgressService';
import { bimConceptMapService } from '../services/BIMConceptMapService';

interface BIMProgressViewerProps {
  onObjectSelect: (object: BIMObject) => void;
  selectedObjectId?: string;
  readonly?: boolean;
}

export default function BIMProgressViewer({ onObjectSelect, selectedObjectId, readonly = false }: BIMProgressViewerProps) {
  const [bimObjects, setBimObjects] = useState<BIMObject[]>([]);
  const [progressLogs, setProgressLogs] = useState<VisualProgressLog[]>([]);
  const [objectProgress, setObjectProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBIMData();
  }, []);

  const loadBIMData = () => {
    const objects = visualProgressService.getBIMObjects();
    const logs = visualProgressService.getAllVisualProgressLogs();
    
    setBimObjects(objects);
    setProgressLogs(logs);
    
    // Calculate progress for each object
    const progress: Record<string, number> = {};
    objects.forEach(obj => {
      const objLogs = logs.filter(log => log.bim_object_id === obj.id);
      if (objLogs.length > 0) {
        progress[obj.id] = objLogs[0].progress_percentage; // Latest progress
      }
    });
    setObjectProgress(progress);
  };

  const handleObjectClick = (object: BIMObject) => {
    if (readonly) return;
    onObjectSelect(object);
  };

  const getObjectColor = (objectId: string) => {
    const progress = objectProgress[objectId];
    const isSelected = selectedObjectId === objectId;
    const isLinked = bimConceptMapService.getObjectMapping(objectId) !== null;
    
    if (isSelected) return '#3b82f6'; // Blue for selected
    if (progress !== undefined) {
      if (progress >= 100) return '#10b981'; // Green for completed
      if (progress >= 50) return '#f59e0b'; // Orange for in progress
      return '#ef4444'; // Red for started
    }
    if (isLinked) return '#8b5cf6'; // Purple for linked but no progress
    return '#6b7280'; // Gray for unlinked
  };

  const getProgressText = (objectId: string) => {
    const progress = objectProgress[objectId];
    const mapping = bimConceptMapService.getObjectMapping(objectId);
    
    if (progress !== undefined) {
      return `${progress}%`;
    }
    if (mapping) {
      return 'Linked';
    }
    return 'Unlinked';
  };

  const getTooltipText = (object: BIMObject) => {
    const mapping = bimConceptMapService.getObjectMapping(object.id);
    const progress = objectProgress[object.id];
    
    let tooltip = object.name;
    if (mapping) {
      // Mock concept name lookup
      const conceptName = mapping.concept_id === '1' ? 'Foundation Work' : 'Wall Construction';
      tooltip += `\nConcept: ${conceptName}`;
    }
    if (progress !== undefined) {
      tooltip += `\nProgress: ${progress}%`;
    }
    return tooltip;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BIM Model Viewer</Text>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#6b7280' }]} />
          <Text style={styles.legendText}>Unlinked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#8b5cf6' }]} />
          <Text style={styles.legendText}>Linked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Started</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>

      <ScrollView style={styles.viewport}>
        <View style={styles.bimModel}>
          <Text style={styles.modelTitle}>3D Model View (Mock)</Text>
          
          {bimObjects.map((object) => {
            const color = getObjectColor(object.id);
            const progressText = getProgressText(object.id);
            const isSelected = selectedObjectId === object.id;
            
            return (
              <TouchableOpacity
                key={object.id}
                style={[
                  styles.bimObject,
                  {
                    backgroundColor: color,
                    left: object.geometry.x * 20,
                    top: object.geometry.y * 20,
                    width: object.geometry.width * 20,
                    height: object.geometry.height * 20,
                    borderWidth: isSelected ? 3 : 1,
                    borderColor: isSelected ? '#1d4ed8' : '#374151'
                  }
                ]}
                onPress={() => handleObjectClick(object)}
                onLongPress={() => Alert.alert('Object Info', getTooltipText(object))}
              >
                <Text style={styles.objectLabel}>{object.name}</Text>
                <Text style={styles.objectProgress}>{progressText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      {selectedObjectId && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedTitle}>Selected Object</Text>
          <Text style={styles.selectedName}>
            {bimObjects.find(obj => obj.id === selectedObjectId)?.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 18, fontWeight: 'bold', padding: 15, color: '#1f2937' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, paddingBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 5 },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 5 },
  legendText: { fontSize: 12, color: '#6b7280' },
  viewport: { flex: 1, backgroundColor: '#ffffff', margin: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  bimModel: { position: 'relative', width: 400, height: 300, margin: 20 },
  modelTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 15, textAlign: 'center' },
  bimObject: { position: 'absolute', borderRadius: 4, padding: 4, justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  objectLabel: { fontSize: 10, color: 'white', fontWeight: 'bold', textAlign: 'center' },
  objectProgress: { fontSize: 8, color: 'white', textAlign: 'center', marginTop: 2 },
  selectedInfo: { backgroundColor: '#e0f2fe', padding: 15, margin: 15, borderRadius: 10 },
  selectedTitle: { fontSize: 14, fontWeight: '600', color: '#0369a1', marginBottom: 5 },
  selectedName: { fontSize: 16, fontWeight: 'bold', color: '#0c4a6e' }
});