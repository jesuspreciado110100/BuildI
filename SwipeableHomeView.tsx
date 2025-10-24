import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, PanResponder, Text } from 'react-native';
import { InteractiveProjectDashboard } from './InteractiveProjectDashboard';
import { GoogleMapsSiteView } from './GoogleMapsSiteView';

interface Site {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Completed' | 'On Hold';
  progress: number;
  budget: number;
  teamSize: number;
  price: number;
  priceChange: number;
  type: 'Residential' | 'Commercial' | 'Industrial';
  lat: number;
  lng: number;
  photos: string[];
}

interface Props {
  sites: Site[];
  userLocation: { lat: number; lng: number } | null;
  onSitePress: (site: Site) => void;
  onRecenter: () => void;
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
}

const { height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

export const SwipeableHomeView: React.FC<Props> = ({
  sites,
  userLocation,
  onSitePress,
  onRecenter,
  searchQuery,
  statusFilter,
  typeFilter
}) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'map'>('dashboard');
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;
        
        if (Math.abs(dy) > SWIPE_THRESHOLD || Math.abs(vy) > 0.5) {
          if (dy > 0 && viewMode === 'map') {
            // Swipe down from map to dashboard
            setViewMode('dashboard');
          } else if (dy < 0 && viewMode === 'dashboard') {
            // Swipe up from dashboard to map
            setViewMode('map');
          }
        }
        
        // Reset animation
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start();
      }
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {viewMode === 'dashboard' ? (
        <Animated.View style={[styles.viewContainer, {
          transform: [{ translateY }]
        }]}>
          <InteractiveProjectDashboard
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onSitePress={onSitePress}
          />
        </Animated.View>
      ) : (
        <Animated.View style={[styles.viewContainer, {
          transform: [{ translateY }]
        }]}>
          <GoogleMapsSiteView
            sites={sites}
            userLocation={userLocation}
            onSitePress={onSitePress}
            onRecenter={onRecenter}
          />
        </Animated.View>
      )}

      {/* Swipe Indicator */}
      <View style={styles.swipeIndicator}>
        <View style={styles.swipeHandle} />
        <Text style={styles.swipeText}>
          {viewMode === 'dashboard' ? '⬆️ Swipe up for map' : '⬇️ Swipe down for dashboard'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  viewContainer: {
    flex: 1
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10
  },
  swipeHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginBottom: 8
  },
  swipeText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    color: 'white',
    textAlign: 'center'
  }
});