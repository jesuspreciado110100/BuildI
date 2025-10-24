import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface NewFeatureBadgeProps {
  featureId: string;
  children: React.ReactNode;
  onPress?: () => void;
}

const NewFeatureBadge: React.FC<NewFeatureBadgeProps> = ({ featureId, children, onPress }) => {
  const { theme } = useTheme();
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Check if feature has been visited using a simple in-memory store
    const visitedFeatures = global.visitedFeatures || new Set();
    if (!visitedFeatures.has(featureId)) {
      setShowBadge(true);
    }
  }, [featureId]);

  const handlePress = () => {
    // Mark feature as visited
    global.visitedFeatures = global.visitedFeatures || new Set();
    global.visitedFeatures.add(featureId);
    setShowBadge(false);
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      {children}
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.badgeText, { color: theme.colors.background }]}>✨ New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NewFeatureBadge;