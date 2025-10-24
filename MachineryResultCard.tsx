import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MachineryDetailModal } from './machinery/MachineryDetailModal';

interface MachineryResultCardProps {
  machinery: {
    id: string;
    machinery_id?: string;
    name: string;
    description?: string;
    model?: string;
    capacity?: string;
    reach?: string;
    rate?: number;
    daily_rate?: number;
    hourly_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
    image_url?: string;
    location?: any;
    eta?: string;
    machinery_types?: { type_name: string };
  };
  onPress?: () => void;
  unitRate?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export const MachineryResultCard: React.FC<MachineryResultCardProps> = ({
  machinery,
  onPress,
  unitRate = 'daily'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Get rate based on unit rate, convert to MXN (multiply by 20)
  const getDisplayRate = () => {
    let rateUSD = 0;
    let label = '';
    
    switch (unitRate) {
      case 'hourly':
        rateUSD = machinery.hourly_rate || machinery.rate || 0;
        label = '/hora';
        break;
      case 'weekly':
        rateUSD = machinery.weekly_rate || (machinery.daily_rate ? machinery.daily_rate * 7 : machinery.rate * 7) || 0;
        label = '/semana';
        break;
      case 'monthly':
        rateUSD = machinery.monthly_rate || (machinery.daily_rate ? machinery.daily_rate * 30 : machinery.rate * 30) || 0;
        label = '/mes';
        break;
      default: // daily
        rateUSD = machinery.daily_rate || machinery.rate || 0;
        label = '/día';
    }
    
    const rateMXN = rateUSD * 20;
    return { rate: rateMXN, label };
  };

  const { rate: displayRate, label: rateLabel } = getDisplayRate();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  // Handle location coordinates
  const getLocationText = () => {
    if (!machinery.location) return 'Ubicación disponible';
    
    if (machinery.location.coordinates && Array.isArray(machinery.location.coordinates)) {
      const [lng, lat] = machinery.location.coordinates;
      return `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
    
    return machinery.location.toString();
  };

  const machineryId = machinery.machinery_id || machinery.id;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handleCardPress}>
        <Image
          source={{ 
            uri: machinery.image_url || 'https://d64gsuwffb70l.cloudfront.net/machinery-placeholder.jpg' 
          }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.name}>{machinery.name}</Text>
          
          {machinery.machinery_types?.type_name && (
            <Text style={styles.typeText}>
              Tipo: {machinery.machinery_types.type_name}
            </Text>
          )}

          {machinery.model && (
            <Text style={styles.infoText}>Modelo: {machinery.model}</Text>
          )}

          {machinery.capacity && (
            <Text style={styles.infoText}>Capacidad: {machinery.capacity}</Text>
          )}

          {machinery.reach && (
            <Text style={styles.infoText}>Alcance: {machinery.reach}</Text>
          )}

          <Text style={styles.infoText}>{getLocationText()}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{displayRate.toFixed(2)} MXN{rateLabel}</Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleCardPress}>
              <Text style={styles.contactText}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <MachineryDetailModal
        visible={modalVisible}
        machineryId={machineryId}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};



const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  contactButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
