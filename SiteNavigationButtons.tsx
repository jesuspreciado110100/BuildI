import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NavigationButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  color: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  title,
  icon,
  onPress,
  color
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      </View>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

interface SiteNavigationButtonsProps {
  siteId: string;
}

export const SiteNavigationButtons: React.FC<SiteNavigationButtonsProps> = ({
  siteId
}) => {
  const router = useRouter();

  const navigateToCalendar = () => {
    router.push(`/contractor/sites/${siteId}/calendar`);
  };

  const navigateToDocuments = () => {
    router.push(`/contractor/sites/${siteId}/documents`);
  };

  const navigateToPayments = () => {
    router.push(`/contractor/sites/${siteId}/payments`);
  };

  const navigateToAnalytics = () => {
    router.push(`/contractor/sites/${siteId}/analytics`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <NavigationButton
          title="Calendar"
          icon="calendar-outline"
          onPress={navigateToCalendar}
          color="#3b82f6"
        />
        <NavigationButton
          title="Documents"
          icon="document-text-outline"
          onPress={navigateToDocuments}
          color="#10b981"
        />
      </View>
      <View style={styles.row}>
        <NavigationButton
          title="Payments"
          icon="card-outline"
          onPress={navigateToPayments}
          color="#f59e0b"
        />
        <NavigationButton
          title="Analytics"
          icon="analytics-outline"
          onPress={navigateToAnalytics}
          color="#8b5cf6"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
