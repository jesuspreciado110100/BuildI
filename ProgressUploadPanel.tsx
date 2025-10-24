import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConceptSelector } from './ConceptSelector';
import { MultiPhotoUploader } from './MultiPhotoUploader';
import { ProgressTrackingService } from '../services/ProgressTrackingService';
import { visualProgressService } from '../services/VisualProgressService';
import { ChatService } from '../services/ChatService';

interface ProgressUploadPanelProps {
  siteId: string;
  conceptId?: string;
  onProgressUpdated?: (progress: number) => void;
}

export function ProgressUploadPanel({ siteId, conceptId, onProgressUpdated }: ProgressUploadPanelProps) {
  const [selectedConceptId, setSelectedConceptId] = useState(conceptId || '');
  const [quantityCompleted, setQuantityCompleted] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Real-time progress calculation
  useEffect(() => {
    if (quantityCompleted && totalQuantity) {
      const completed = parseFloat(quantityCompleted);
      const total = parseFloat(totalQuantity);
      if (total > 0) {
        const percent = Math.round((completed / total) * 100);
        setProgressPercent(percent);
        onProgressUpdated?.(percent);
      }
    }
  }, [quantityCompleted, totalQuantity, onProgressUpdated]);

  const handleSubmit = async () => {
    if (!selectedConceptId || !quantityCompleted || !totalQuantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please upload at least one photo as visual proof');
      return;
    }

    setIsSubmitting(true);

    try {
      const completed = parseFloat(quantityCompleted);
      const total = parseFloat(totalQuantity);
      const progress = Math.round((completed / total) * 100);

      // Create progress entry
      await ProgressTrackingService.createProgressEntry(
        `req_${selectedConceptId}`,
        'current_worker',
        'current_user',
        photos[0],
        completed,
        total,
        notes
      );

      // Create visual progress log
      const visualLog = visualProgressService.createVisualProgressLog({
        concept_id: selectedConceptId,
        bim_object_id: `bim_${selectedConceptId}`,
        progress_percentage: progress,
        photo_urls: photos,
        notes,
        submitted_by: 'current_user',
        submitted_by_name: 'Current User'
      });

      // Send notification via chat
      await ChatService.sendMessage(
        `site_${siteId}`,
        'system',
        `Progress update: ${progress}% completed for concept. Visual proof attached.`,
        'progress_update',
        visualLog.id
      );

      // Trigger BIM visual update if linked
      if (progress >= 100) {
        // Mark concept as completed in BIM
        await visualProgressService.updateVisualProgressLog(visualLog.id, {
          contractor_approved: true
        });
      }

      Alert.alert('Success', 'Progress log submitted successfully!', [
        { text: 'OK', onPress: () => resetForm() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit progress log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuantityCompleted('');
    setTotalQuantity('');
    setUnit('');
    setNotes('');
    setPhotos([]);
    setProgressPercent(0);
    if (!conceptId) {
      setSelectedConceptId('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Progress Log</Text>
        <Text style={styles.subtitle}>Site: {siteId}</Text>
      </View>

      {/* Concept Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Concept</Text>
        <ConceptSelector
          siteId={siteId}
          selectedConceptId={selectedConceptId}
          onConceptSelect={setSelectedConceptId}
        />
      </View>

      {/* Quantity Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quantity Completed</Text>
        <View style={styles.quantityRow}>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            value={quantityCompleted}
            onChangeText={setQuantityCompleted}
            placeholder="Completed"
            keyboardType="numeric"
          />
          <Text style={styles.divider}>of</Text>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            value={totalQuantity}
            onChangeText={setTotalQuantity}
            placeholder="Total"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.unitInput]}
            value={unit}
            onChangeText={setUnit}
            placeholder="Unit"
          />
        </View>
        
        {/* Real-time Progress Display */}
        {progressPercent > 0 && (
          <View style={styles.progressDisplay}>
            <Text style={styles.progressText}>Progress: {progressPercent}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes about the progress..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Photo Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visual Proof (Photos)</Text>
        <MultiPhotoUploader
          photos={photos}
          onPhotosChange={setPhotos}
          maxPhotos={5}
        />
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Progress Log'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  quantityInput: {
    flex: 2,
  },
  unitInput: {
    flex: 1,
  },
  divider: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  progressDisplay: {
    marginTop: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  footer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});