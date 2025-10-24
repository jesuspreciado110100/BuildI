import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WidgetProps {
  title: string;
  subtitle: string;
  value: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export function BuilderWidget({ title, subtitle, value, icon, color, onPress }: WidgetProps) {
  return (
    <TouchableOpacity style={styles.widget} onPress={onPress}>
      <View style={styles.widgetHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={16} color="white" />
        </View>
        <View style={styles.widgetInfo}>
          <Text style={styles.widgetTitle}>{title}</Text>
          <Text style={styles.widgetSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.widgetValue}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 70
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  widgetInfo: {
    flex: 1
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 1
  },
  widgetSubtitle: {
    fontSize: 10,
    color: '#6B7280'
  },
  widgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  }
});