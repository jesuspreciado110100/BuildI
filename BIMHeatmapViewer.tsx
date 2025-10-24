import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { BIMObject } from '../types';
import { visualProgressService } from '../services/VisualProgressService';
import { progressHeatmapService, HeatmapData } from '../services/ProgressHeatmapService';

interface BIMHeatmapViewerProps {
  onObjectSelect?: (objectId: string) => void;
  selectedObjectId?: string | null;
  heatmapMode?: boolean;
}

export default function BIMHeatmapViewer({ 
  onObjectSelect, 
  selectedObjectId, 
  heatmapMode = false 
}: BIMHeatmapViewerProps) {
  const [mockBIMObjects, setMockBIMObjects] = useState<BIMObject[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedObject, setSelectedObject] = useState<HeatmapData | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const objects = visualProgressService.getMockBIMObjects();
    setMockBIMObjects(objects);
    
    if (heatmapMode) {
      const heatmap = progressHeatmapService.generateHeatmapData();
      setHeatmapData(heatmap);
    }
  }, [heatmapMode]);

  const handleObjectPress = (objectId: string) => {
    if (heatmapMode) {
      const heatmapInfo = progressHeatmapService.getObjectHeatmapInfo(objectId);
      if (heatmapInfo) {
        setSelectedObject(heatmapInfo);
        setDetailModalVisible(true);
      }
    }
    onObjectSelect?.(objectId);
  };

  const getObjectStyle = (objectId: string) => {
    const baseStyle = {
      ...styles.bimObject,
      borderColor: selectedObjectId === objectId ? '#3b82f6' : '#e5e7eb',
      borderWidth: selectedObjectId === objectId ? 2 : 1,
    };

    if (heatmapMode) {
      const heatmapInfo = heatmapData.find(data => data.objectId === objectId);
      if (heatmapInfo) {
        return {
          ...baseStyle,
          backgroundColor: heatmapInfo.color,
          opacity: 0.8,
        };
      }
    }

    return baseStyle;
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 90) return '✅';
    if (progress >= 70) return '🟡';
    if (progress >= 40) return '🟠';
    return '🔴';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {heatmapMode ? '🌡️ Progress Heatmap' : '🏗️ BIM Viewer'}
        </Text>
        {heatmapMode && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'rgb(255, 0, 0)' }]} />
              <Text style={styles.legendText}>0%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'rgb(255, 255, 0)' }]} />
              <Text style={styles.legendText}>50%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: 'rgb(0, 255, 0)' }]} />
              <Text style={styles.legendText}>100%</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView style={styles.bimContainer}>
        <View style={styles.bimGrid}>
          {mockBIMObjects.map(object => {
            const heatmapInfo = heatmapData.find(data => data.objectId === object.id);
            return (
              <TouchableOpacity
                key={object.id}
                style={getObjectStyle(object.id)}
                onPress={() => handleObjectPress(object.id)}
              >
                <Text style={styles.objectName}>{object.name}</Text>
                <Text style={styles.objectType}>{object.type}</Text>
                {heatmapMode && heatmapInfo && (
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {getProgressIcon(heatmapInfo.progress)} {heatmapInfo.progress.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedObject && (
              <>
                <Text style={styles.modalTitle}>Progress Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Concept:</Text>
                  <Text style={styles.detailValue}>{selectedObject.conceptName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Progress:</Text>
                  <Text style={styles.detailValue}>{selectedObject.progress.toFixed(1)}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>
                    {selectedObject.quantityDone} / {selectedObject.quantityPlanned}
                  </Text>
                </View>
                <View style={[styles.colorPreview, { backgroundColor: selectedObject.color }]} />
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  legend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  legendText: { fontSize: 12, color: '#6b7280' },
  bimContainer: { flex: 1, padding: 15 },
  bimGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bimObject: { width: '48%', padding: 12, backgroundColor: 'white', borderRadius: 8, minHeight: 80 },
  objectName: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  objectType: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  progressInfo: { marginTop: 4 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '80%', maxWidth: 300 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15, textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1f2937', fontWeight: '600' },
  colorPreview: { height: 20, borderRadius: 4, marginVertical: 10 },
  closeButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  closeButtonText: { color: 'white', fontSize: 14, fontWeight: '600' }
});