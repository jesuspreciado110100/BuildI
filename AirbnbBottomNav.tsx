import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

interface NavItem {
  key: string;
  label: string;
  icon: string;
}

interface AirbnbBottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export const AirbnbBottomNav: React.FC<AirbnbBottomNavProps> = ({
  items,
  activeTab,
  onTabPress
}) => {
  const handleTabPress = (key: string) => {
    HapticFeedbackService.onTabChange();
    onTabPress(key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => handleTabPress(item.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.navIcon,
                { color: isActive ? '#3B82F6' : '#9CA3AF' }
              ]}>
                {item.icon}
              </Text>
              <Text style={[
                styles.navLabel,
                { color: isActive ? '#3B82F6' : '#9CA3AF' }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 34, // Safe area for iPhone
  },
  navBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});