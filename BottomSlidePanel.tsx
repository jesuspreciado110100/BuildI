import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface BottomSlidePanelProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
}

export default function BottomSlidePanel({ 
  isVisible, 
  onClose, 
  title, 
  children, 
  height: panelHeight = height * 0.7 
}: BottomSlidePanelProps) {
  const translateY = useRef(new Animated.Value(panelHeight)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: panelHeight,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isVisible, panelHeight]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.panel, 
          { transform: [{ translateY }], height: panelHeight }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.handle} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  closeButton: {
    padding: 4
  },
  content: {
    flex: 1,
    padding: 20
  }
});