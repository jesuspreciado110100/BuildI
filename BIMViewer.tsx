import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface BIMViewerProps {
  siteId: string;
}

export const BIMViewer: React.FC<BIMViewerProps> = ({ siteId }) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [highlightedObjects, setHighlightedObjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'viewer' | 'timeline' | 'animation'>('viewer');

  const handleObjectClick = (objectId: string) => {
    setSelectedObjectId(objectId);
  };

  const mockBimObjects = [
    { id: 'bim_001', name: 'Foundation Wall A', type: 'wall', isHighlighted: highlightedObjects.includes('bim_001') },
    { id: 'bim_002', name: 'Foundation Wall B', type: 'wall', isHighlighted: highlightedObjects.includes('bim_002') },
    { id: 'bim_003', name: 'Column C1', type: 'column', isHighlighted: highlightedObjects.includes('bim_003') },
    { id: 'bim_004', name: 'Beam B1', type: 'beam', isHighlighted: highlightedObjects.includes('bim_004') },
    { id: 'bim_005', name: 'Slab S1', type: 'slab', isHighlighted: highlightedObjects.includes('bim_005') },
    { id: 'bim_006', name: 'Roof R1', type: 'roof', isHighlighted: highlightedObjects.includes('bim_006') }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BIM Viewer - 4D Simulation</Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'viewer' && styles.activeTab]}
          onPress={() => setActiveTab('viewer')}
        >
          <Text style={[styles.tabText, activeTab === 'viewer' && styles.activeTabText]}>3D Viewer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabText, activeTab === 'timeline' && styles.activeTabText]}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'animation' && styles.activeTab]}
          onPress={() => setActiveTab('animation')}
        >
          <Text style={[styles.tabText, activeTab === 'animation' && styles.activeTabText]}>4D Animation</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* 3D Viewer */}
        <View style={styles.viewerContainer}>
          <Text style={styles.sectionTitle}>3D Model View</Text>
          <View style={styles.bimPlaceholder}>
            <Text style={styles.placeholderIcon}>🏗️</Text>
            <Text style={styles.placeholderText}>Interactive 3D BIM Model</Text>
            <Text style={styles.placeholderSubtext}>Click objects to select and link to concepts</Text>
            
            {/* Mock BIM Objects */}
            <View style={styles.objectsGrid}>
              {mockBimObjects.map(object => (
                <TouchableOpacity
                  key={object.id}
                  style={[
                    styles.objectPreview,
                    selectedObjectId === object.id && styles.objectSelected,
                    object.isHighlighted && styles.objectHighlighted
                  ]}
                  onPress={() => handleObjectClick(object.id)}
                >
                  <Text style={styles.objectName}>{object.name}</Text>
                  <Text style={styles.objectType}>{object.type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.mockControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlText}>🔄 Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlText}>🔍 Zoom</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlText}>📏 Measure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  activeTab: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  content: {
    maxHeight: 400
  },
  viewerContainer: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  bimPlaceholder: {
    minHeight: 300,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    padding: 16
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 10
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 5
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%'
  },
  objectPreview: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    margin: 4,
    borderWidth: 2,
    borderColor: '#4a90e2',
    minWidth: 80,
    alignItems: 'center'
  },
  objectSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3'
  },
  objectHighlighted: {
    backgroundColor: '#fff3e0',
    borderColor: '#FF9800'
  },
  objectName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333'
  },
  objectType: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  mockControls: {
    flexDirection: 'row',
    gap: 10
  },
  controlButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  controlText: {
    color: '#fff',
    fontSize: 12
  }
});