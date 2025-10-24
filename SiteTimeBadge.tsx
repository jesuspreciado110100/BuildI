import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimezoneService } from '../services/TimezoneService';

interface SiteTimeBadgeProps {
  timezone: string;
  region?: string;
  showRegion?: boolean;
}

export const SiteTimeBadge: React.FC<SiteTimeBadgeProps> = ({
  timezone,
  region,
  showRegion = true
}) => {
  const currentTime = TimezoneService.getCurrentSiteTime(timezone);
  const timezoneName = TimezoneService.getTimezoneDisplayName(timezone);
  
  return (
    <View style={styles.container}>
      <Text style={styles.time}>{currentTime}</Text>
      {showRegion && region && (
        <Text style={styles.region}>{region}</Text>
      )}
      <Text style={styles.timezone}>{timezoneName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    minWidth: 80,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  region: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 1,
  },
  timezone: {
    fontSize: 9,
    color: '#868e96',
    marginTop: 1,
  },
});