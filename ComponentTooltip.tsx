import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface ComponentTooltipProps {
  visible: boolean;
  componentName: string;
  position: { x: number; y: number };
}

export const ComponentTooltip: React.FC<ComponentTooltipProps> = ({
  visible,
  componentName,
  position,
}) => {
  if (!visible) return null;

  const screenWidth = Dimensions.get('window').width;
  const tooltipWidth = 200;
  
  // Adjust position to keep tooltip on screen
  const adjustedX = Math.min(position.x, screenWidth - tooltipWidth - 10);
  const adjustedY = Math.max(position.y - 40, 10);

  return (
    <View 
      style={[
        styles.tooltip,
        {
          left: adjustedX,
          top: adjustedY,
        }
      ]}
    >
      <Text style={styles.tooltipText}>{componentName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    zIndex: 1000,
    maxWidth: 200,
  },
  tooltipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});