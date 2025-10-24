import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { ProgressSnapshotService, SnapshotEntry } from '../services/ProgressSnapshotService';
import { VisualProgressLogCard } from './VisualProgressLogCard';
import { EmptyStateCard } from './EmptyStateCard';

interface ConceptProgressTimelineProps {
  siteId: string;
  conceptId: string;
}

export const ConceptProgressTimeline: React.FC<ConceptProgressTimelineProps> = ({
  siteId,
  conceptId
}) => {
  const [snapshots, setSnapshots] = useState<SnapshotEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, [conceptId]);

  const loadSnapshots = async () => {
    try {
      setIsLoading(true);
      const snapshotData = await ProgressSnapshotService.getForConcept(conceptId);
      setSnapshots(snapshotData);
    } catch (error) {
      console.error('Error loading snapshots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return '#10B981';
      case 'delayed': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (isLoading) {
    return (
      <View className="bg-white rounded-lg p-4 m-4 shadow-sm">
        <Text className="text-center text-gray-500">Loading timeline...</Text>
      </View>
    );
  }

  if (snapshots.length === 0) {
    return (
      <View className="bg-white rounded-lg p-4 m-4 shadow-sm">
        <EmptyStateCard
          title="No Progress Logs Yet"
          description="No progress logs yet for this concept"
          iconName="timeline"
        />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 m-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
        Progress Timeline
      </Text>
      
      <ScrollView 
        style={{ maxHeight: 400 }}
        showsVerticalScrollIndicator={false}
      >
        {snapshots.map((snapshot, index) => (
          <View key={snapshot.id} className="flex-row mb-4">
            {/* Timeline Node */}
            <View className="items-center mr-4">
              <View 
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: getStatusColor(snapshot.status) }}
              />
              {index < snapshots.length - 1 && (
                <View 
                  className="w-0.5 h-16 mt-2"
                  style={{ backgroundColor: '#E5E7EB' }}
                />
              )}
            </View>
            
            {/* Timeline Content */}
            <View className="flex-1">
              <View className="bg-gray-50 rounded-lg p-3">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="font-semibold text-gray-800">
                    {snapshot.phaseLabel || 'Progress Update'}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {formatDate(snapshot.timestamp)}
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm font-medium text-gray-600 mr-2">
                    Progress:
                  </Text>
                  <Text className="text-sm font-bold" style={{ color: getStatusColor(snapshot.status) }}>
                    {snapshot.percentComplete}%
                  </Text>
                </View>
                
                {/* Image Thumbnail */}
                <TouchableOpacity
                  onPress={() => handleImagePress(snapshot.imageUrl)}
                  className="mb-2"
                >
                  <Image
                    source={{ uri: snapshot.imageUrl }}
                    className="w-full h-32 rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                
                {snapshot.notes && (
                  <Text className="text-sm text-gray-600 italic">
                    {snapshot.notes}
                  </Text>
                )}
                
                {/* Status Badge */}
                <View className="mt-2">
                  <View 
                    className="self-start px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${getStatusColor(snapshot.status)}20` }}
                  >
                    <Text 
                      className="text-xs font-medium capitalize"
                      style={{ color: getStatusColor(snapshot.status) }}
                    >
                      {snapshot.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10"
            onPress={() => setShowImageModal(false)}
          >
            <Text className="text-white text-xl font-bold">×</Text>
          </TouchableOpacity>
          
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-4/5"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};