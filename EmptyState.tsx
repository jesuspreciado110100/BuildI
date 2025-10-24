import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  primaryCTA: {
    text: string;
    onPress: () => void;
  };
  secondaryCTA?: {
    text: string;
    onPress: () => void;
  };
}

export function EmptyState({ title, description, icon, primaryCTA, secondaryCTA }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={primaryCTA.onPress}>
          <Text style={styles.primaryButtonText}>{primaryCTA.text}</Text>
        </TouchableOpacity>
        
        {secondaryCTA && (
          <TouchableOpacity style={styles.secondaryButton} onPress={secondaryCTA.onPress}>
            <Text style={styles.secondaryButtonText}>{secondaryCTA.text}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9fafb'
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
    opacity: 0.6
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 300
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db'
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  }
});