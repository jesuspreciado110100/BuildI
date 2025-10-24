import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafetyChecklistItem, Phase } from '../types';
import { FileUploader } from './FileUploader';
import { SafetyService } from '../services/SafetyService';

interface SafetyChecklistPanelProps {
  phase: Phase;
  tradeType: string;
  laborChiefId: string;
  onItemComplete: (itemId: string, photoUrl?: string) => void;
}

export const SafetyChecklistPanel: React.FC<SafetyChecklistPanelProps> = ({
  phase,
  tradeType,
  laborChiefId,
  onItemComplete
}) => {
  const [checklistItems, setChecklistItems] = useState<SafetyChecklistItem[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadChecklistItems();
  }, [phase.id, tradeType]);

  const loadChecklistItems = async () => {
    try {
      const items = await SafetyService.getChecklistItems(phase.id, tradeType);
      setChecklistItems(items);
    } catch (error) {
      console.error('Failed to load checklist items:', error);
    }
  };

  const handleItemToggle = async (item: SafetyChecklistItem) => {
    if (item.is_completed) return;

    try {
      await SafetyService.completeChecklistItem(item.id, laborChiefId);
      setChecklistItems(prev => prev.map(i => 
        i.id === item.id 
          ? { ...i, is_completed: true, completed_by: laborChiefId, timestamp: new Date().toISOString() }
          : i
      ));
      onItemComplete(item.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete checklist item');
    }
  };

  const handlePhotoUpload = async (itemId: string, photoUrl: string) => {
    try {
      await SafetyService.addPhotoToChecklistItem(itemId, photoUrl);
      setChecklistItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, photo_url: photoUrl } : i
      ));
      setUploadingPhoto(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  const completedCount = checklistItems.filter(item => item.is_completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Checklist - {phase.title}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{completedCount}/{totalCount} completed</Text>
        </View>
      </View>

      <ScrollView style={styles.itemsList}>
        {checklistItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => handleItemToggle(item)}
              disabled={item.is_completed}
            >
              <View style={[
                styles.checkbox,
                item.is_completed && styles.checkboxCompleted
              ]}>
                {item.is_completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.itemContent}>
                <Text style={[
                  styles.itemText,
                  item.is_completed && styles.itemTextCompleted
                ]}>
                  {item.item}
                </Text>
                {item.is_required && (
                  <Text style={styles.requiredBadge}>REQUIRED</Text>
                )}
                {item.completed_by && (
                  <Text style={styles.completedInfo}>
                    Completed by {item.completed_by} at {new Date(item.timestamp!).toLocaleString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            
            {item.is_completed && !item.photo_url && (
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => setUploadingPhoto(item.id)}
              >
                <Text style={styles.photoButtonText}>Add Photo</Text>
              </TouchableOpacity>
            )}
            
            {item.photo_url && (
              <Text style={styles.photoStatus}>📷 Photo attached</Text>
            )}
          </View>
        ))}
      </ScrollView>

      {uploadingPhoto && (
        <FileUploader
          onUpload={(url) => handlePhotoUpload(uploadingPhoto, url)}
          onCancel={() => setUploadingPhoto(null)}
          acceptedTypes={['image/*']}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    lineHeight: 22,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  requiredBadge: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: 'bold',
    marginTop: 4,
  },
  completedInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  photoButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photoStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
  },
});