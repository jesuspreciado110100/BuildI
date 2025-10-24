import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimezoneService } from '../services/TimezoneService';
import { TimezoneToggle } from './TimezoneToggle';

interface TimestampDisplayProps {
  timestamp: string;
  userTimezone?: string;
  siteTimezone?: string;
  showToggle?: boolean;
  label?: string;
}

export const TimestampDisplay: React.FC<TimestampDisplayProps> = ({
  timestamp,
  userTimezone = 'America/New_York',
  siteTimezone,
  showToggle = true,
  label
}) => {
  const [showSiteTime, setShowSiteTime] = useState(false);
  
  const displayTime = TimezoneService.displayTime(
    timestamp,
    userTimezone,
    siteTimezone,
    showSiteTime
  );
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Text style={styles.timestamp}>{displayTime}</Text>
      {showToggle && siteTimezone && (
        <TimezoneToggle
          showSiteTime={showSiteTime}
          onToggle={setShowSiteTime}
          userTimezone={userTimezone}
          siteTimezone={siteTimezone}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});