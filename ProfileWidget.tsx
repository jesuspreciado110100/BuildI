import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileWidgetProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  onPress?: () => void;
  subtitle?: string;
}

export default function ProfileWidget({ 
  title, 
  value, 
  icon, 
  color = '#3B82F6',
  onPress,
  subtitle 
}: ProfileWidgetProps) {
  return (
    <TouchableOpacity 
      style={[styles.widget, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  }
});