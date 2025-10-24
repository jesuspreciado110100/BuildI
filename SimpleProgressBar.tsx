import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SimpleProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({ 
  progress, 
  color = '#007AFF', 
  height = 8 
}) => {
  return (
    <View style={[styles.track, { height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${Math.min(100, Math.max(0, progress))}%`, 
            backgroundColor: color,
            height 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    borderRadius: 4
  }
});