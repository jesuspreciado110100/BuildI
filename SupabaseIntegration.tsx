import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { DatabaseService } from '@/app/services/DatabaseService';

export const SupabaseSitesList = ({ contractorId }: { contractorId: string }) => {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSites();
  }, [contractorId]);

  const loadSites = async () => {
    const { data, error } = await DatabaseService.getSites(contractorId);
    if (data) setSites(data);
    setLoading(false);
  };

  if (loading) return <Text>Loading sites...</Text>;

  return (
    <FlatList
      data={sites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.siteCard}>
          <Text style={styles.siteName}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>Status: {item.status}</Text>
        </View>
      )}
    />
  );
};

export const CreateSiteForm = ({ contractorId, onSuccess }: { contractorId: string; onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    const { data, error } = await DatabaseService.createSite({
      name,
      description,
      address,
      contractor_id: contractorId
    });
    if (data) {
      setName('');
      setDescription('');
      setAddress('');
      onSuccess();
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Site Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Site</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  siteCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  form: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});