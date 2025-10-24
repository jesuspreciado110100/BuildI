import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SimpleMapView } from './SimpleMapView';

interface Site {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  priceChange: number;
  status: string;
}

interface Props {
  sites: Site[];
  userLocation: { lat: number; lng: number } | null;
  onSitePress: (site: Site) => void;
  onRecenter: () => void;
}

export const GoogleMapsSiteView: React.FC<Props> = ({
  sites,
  userLocation,
  onSitePress,
  onRecenter
}) => {
  const mapPins = [
    ...sites.map(site => ({
      id: site.id,
      name: site.name,
      lat: site.lat,
      lng: site.lng,
      type: 'site' as const,
      price: site.price,
      priceChange: site.priceChange,
      status: site.status
    })),
    ...(userLocation ? [{
      id: 'user-location',
      name: 'You',
      lat: userLocation.lat,
      lng: userLocation.lng,
      type: 'user' as const
    }] : [])
  ];

  const handlePinPress = (pin: any) => {
    if (pin.type === 'site') {
      const site = sites.find(s => s.id === pin.id);
      if (site) onSitePress(site);
    }
  };

  return (
    <View style={styles.container}>
      <SimpleMapView
        pins={mapPins}
        onPinPress={handlePinPress}
        onRecenter={onRecenter}
        title="Site Locations"
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Price Up</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
          <Text style={styles.legendText}>Price Down</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Your Location</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    color: '#666'
  }
});