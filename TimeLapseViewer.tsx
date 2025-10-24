import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { TimeLapseData, ProgressSnapshot } from '../types';
import { ProgressSnapshotService } from '../services/ProgressSnapshotService';

interface TimeLapseViewerProps {
  conceptId: string;
  onClose?: () => void;
}

export const TimeLapseViewer: React.FC<TimeLapseViewerProps> = ({ conceptId, onClose }) => {
  const [timeLapseData, setTimeLapseData] = useState<TimeLapseData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  useEffect(() => {
    loadTimeLapseData();
  }, [conceptId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLapseData) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= timeLapseData.snapshots.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLapseData]);

  const loadTimeLapseData = async () => {
    try {
      setLoading(true);
      const data = await ProgressSnapshotService.getTimeLapse(conceptId);
      setTimeLapseData(data);
    } catch (error) {
      console.error('Error loading time-lapse data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVideo = async () => {
    try {
      setIsGeneratingVideo(true);
      const videoUrl = await ProgressSnapshotService.generateTimeLapseVideo(conceptId);
      Alert.alert('Video Generated', `Time-lapse video ready: ${videoUrl}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Text>Loading time-lapse...</Text>
      </View>
    );
  }

  if (!timeLapseData || timeLapseData.snapshots.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Text>No snapshots available for time-lapse</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20, padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}>
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const currentSnapshot = timeLapseData.snapshots[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Time-Lapse Viewer</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#007AFF', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Image */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Image
          source={{ uri: currentSnapshot.photo_url }}
          style={{ width: '100%', height: 300, borderRadius: 10, marginBottom: 15 }}
          resizeMode="cover"
        />
        
        {/* Progress Info */}
        <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, width: '100%', marginBottom: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{currentSnapshot.phase_label}</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
            {new Date(currentSnapshot.timestamp).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007AFF' }}>
            {currentSnapshot.progress_percentage}% Complete
          </Text>
          {currentSnapshot.notes && (
            <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>{currentSnapshot.notes}</Text>
          )}
        </View>

        {/* Controls */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
          <TouchableOpacity
            onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            style={{ padding: 10, backgroundColor: currentIndex === 0 ? '#ccc' : '#007AFF', borderRadius: 5, marginHorizontal: 5 }}
          >
            <Text style={{ color: 'white' }}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            style={{ padding: 10, backgroundColor: '#4CAF50', borderRadius: 5, marginHorizontal: 5 }}
          >
            <Text style={{ color: 'white' }}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setCurrentIndex(Math.min(timeLapseData.snapshots.length - 1, currentIndex + 1))}
            disabled={currentIndex === timeLapseData.snapshots.length - 1}
            style={{ padding: 10, backgroundColor: currentIndex === timeLapseData.snapshots.length - 1 ? '#ccc' : '#007AFF', borderRadius: 5, marginHorizontal: 5 }}
          >
            <Text style={{ color: 'white' }}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          onPress={handleDownloadVideo}
          disabled={isGeneratingVideo}
          style={{ padding: 15, backgroundColor: isGeneratingVideo ? '#ccc' : '#FF9800', borderRadius: 10, width: '100%' }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {isGeneratingVideo ? 'Generating Video...' : 'Download MP4'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 120, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', padding: 10 }}>
          {timeLapseData.snapshots.map((snapshot, index) => (
            <TouchableOpacity
              key={snapshot.id}
              onPress={() => setCurrentIndex(index)}
              style={{ marginRight: 10, borderWidth: index === currentIndex ? 2 : 0, borderColor: '#007AFF', borderRadius: 5 }}
            >
              <Image
                source={{ uri: snapshot.photo_url }}
                style={{ width: 80, height: 60, borderRadius: 5 }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 2 }}>{snapshot.progress_percentage}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};