import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SampleDataService } from '@/app/services/SampleDataService';

export const DatabaseSetupHelper: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInsertSampleData = async () => {
    setIsLoading(true);
    try {
      const result = await SampleDataService.insertAllSampleData();
      if (result.success) {
        Alert.alert('Success', 'Sample data inserted successfully!');
      } else {
        Alert.alert('Error', 'Failed to insert some sample data. Check console for details.');
      }
    } catch (error) {
      console.error('Error inserting sample data:', error);
      Alert.alert('Error', 'Failed to insert sample data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Setup Helper</Text>
      <Text style={styles.description}>
        This helper can insert sample data into your database tables.
        Make sure the tables exist first.
      </Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleInsertSampleData}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Inserting...' : 'Insert Sample Data'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: If you get table errors, you need to create the database tables first.
        Contact your Supabase admin for elevated privileges.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});