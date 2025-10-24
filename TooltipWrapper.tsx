import React, { useState } from 'react';
import { View, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { ComponentTooltip } from './ComponentTooltip';

interface TooltipWrapperProps {
  children: React.ReactNode;
  componentName: string;
  style?: any;
  onPress?: () => void;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  componentName,
  style,
  onPress,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handlePressIn = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    setTooltipPosition({ x: pageX, y: pageY });
    setShowTooltip(true);
  };

  const handlePressOut = () => {
    setShowTooltip(false);
  };

  const handlePress = () => {
    setShowTooltip(false);
    if (onPress) {
      onPress();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={style}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
      
      <ComponentTooltip
        visible={showTooltip}
        componentName={componentName}
        position={tooltipPosition}
      />
    </>
  );
};