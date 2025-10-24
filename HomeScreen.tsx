import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ContractorHomePanel } from './ContractorHomePanel';
import { FABCreateMenu } from './FABCreateMenu';
import ConstructionTypesCarousel from './ConstructionTypesCarousel';

interface HomeScreenProps {
  userId: string;
  userRole: string;
}

export function HomeScreen({ userId, userRole }: HomeScreenProps) {
  const handleFABAction = (action: string) => {
    console.log('FAB Action:', action);
    // Handle different actions here
    switch (action) {
      case 'concept':
        console.log('Creating concept...');
        break;
      case 'machinery':
        console.log('Booking machinery...');
        break;
      case 'labor':
        console.log('Hiring labor...');
        break;
      case 'materials':
        console.log('Ordering materials...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ConstructionTypesCarousel />
        <ContractorHomePanel userId={userId} userRole={userRole} />
      </ScrollView>
      <FABCreateMenu onAction={handleFABAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
});