import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';

interface ProgressSnapshot {
  id: string;
  conceptId: string;
  imageUrl: string;
  percentComplete: number;
  timestamp: string;
  status: 'on_track' | 'delayed' | 'critical';
  notes?: string;
  phaseLabel?: string;
}

interface VisualProgressLogCardProps {
  snapshot: ProgressSnapshot;
}

export const VisualProgressLogCard: React.FC<VisualProgressLogCardProps> = ({ snapshot }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return '#10B981';
      case 'delayed': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track': return 'On Track';
      case 'delayed': return 'Delayed';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 overflow-hidden"
    >
      <View className="relative">
        <Image
          source={{ uri: snapshot.imageUrl }}
          className="w-full h-48 rounded-t-lg"
          resizeMode="cover"
        />
        
        {/* Completion Badge */}
        <View className="absolute top-3 right-3 bg-black bg-opacity-70 rounded-full w-12 h-12 items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {snapshot.percentComplete}%
          </Text>
        </View>
        
        {/* Status Badge */}
        <View 
          className="absolute top-3 left-3 px-2 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(snapshot.status) }}
        >
          <Text className="text-white text-xs font-medium">
            {getStatusText(snapshot.status)}
          </Text>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold text-gray-800">
            {snapshot.phaseLabel || 'Progress Update'}
          </Text>
          <Text className="text-sm text-gray-600">
            {formatTimestamp(snapshot.timestamp)}
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View className="bg-gray-200 rounded-full h-2 mb-3">
          <View 
            className="h-2 rounded-full"
            style={{ 
              width: `${snapshot.percentComplete}%`,
              backgroundColor: getStatusColor(snapshot.status)
            }}
          />
        </View>
        
        {snapshot.notes && (
          <Text className="text-sm text-gray-700 mt-2">
            {snapshot.notes}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

export default VisualProgressLogCard;