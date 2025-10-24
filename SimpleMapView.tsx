import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: 'site' | 'worker' | 'machine' | 'user';
  status?: string;
  price?: number;
  priceChange?: number;
}

interface SimpleMapViewProps {
  pins: MapPin[];
  onPinPress?: (pin: MapPin) => void;
  onRecenter?: () => void;
  showControls?: boolean;
  title?: string;
}

export const SimpleMapView: React.FC<SimpleMapViewProps> = ({
  pins,
  onPinPress,
  onRecenter,
  showControls = true,
  title = 'Map View'
}) => {
  const getPinColor = (pin: MapPin) => {
    if (pin.type === 'user') return '#007AFF';
    if (pin.type === 'worker') return '#16a34a';
    if (pin.type === 'machine') return '#eab308';
    if (pin.priceChange !== undefined) {
      return pin.priceChange >= 0 ? '#4CAF50' : '#f44336';
    }
    return '#6b7280';
  };

  const getPinIcon = (pin: MapPin) => {
    switch (pin.type) {
      case 'user': return '📍';
      case 'worker': return '👷';
      case 'machine': return '🚜';
      case 'site': return '🏗️';
      default: return '📌';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>{title}</Text>
        
        {pins.map((pin, index) => (
          <TouchableOpacity
            key={pin.id}
            style={[
              styles.pin,
              {
                left: `${20 + (index * 15) % 60}%`,
                top: `${30 + (Math.floor(index / 4) * 20) % 40}%`,
                backgroundColor: getPinColor(pin)
              }
            ]}
            onPress={() => onPinPress?.(pin)}
          >
            <Text style={styles.pinIcon}>{getPinIcon(pin)}</Text>
            <View style={styles.pinInfo}>
              <Text style={styles.pinName}>{pin.name}</Text>
              {pin.price && (
                <Text style={styles.pinPrice}>${pin.price}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {showControls && (
        <TouchableOpacity style={styles.recenterButton} onPress={onRecenter}>
          <Text style={styles.recenterText}>📍</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    position: 'relative',
    padding: 16
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 60
  },
  pinIcon: { fontSize: 16, marginBottom: 4 },
  pinInfo: { alignItems: 'center' },
  pinName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  pinPrice: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginTop: 2
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recenterText: { fontSize: 16, color: 'white' }
});