import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TimezoneToggleProps {
  showSiteTime: boolean;
  onToggle: (showSiteTime: boolean) => void;
  userTimezone?: string;
  siteTimezone?: string;
}

export const TimezoneToggle: React.FC<TimezoneToggleProps> = ({
  showSiteTime,
  onToggle,
  userTimezone = 'America/New_York',
  siteTimezone = 'America/Los_Angeles'
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !showSiteTime && styles.activeButton]}
        onPress={() => onToggle(false)}
      >
        <Text style={[styles.buttonText, !showSiteTime && styles.activeText]}>
          My Time
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, showSiteTime && styles.activeButton]}
        onPress={() => onToggle(true)}
      >
        <Text style={[styles.buttonText, showSiteTime && styles.activeText]}>
          Site Time
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
    marginVertical: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeText: {
    color: '#fff',
  },
});