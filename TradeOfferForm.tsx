import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Concept, TradeOffer } from '../types';

interface TradeOfferFormProps {
  concepts: Concept[];
  contractorId: string;
  onSubmit: (offer: Omit<TradeOffer, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

const TradeOfferForm: React.FC<TradeOfferFormProps> = ({
  concepts,
  contractorId,
  onSubmit,
  onCancel
}) => {
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState('');
  const [deadline, setDeadline] = useState('');
  const [subcontractorId, setSubcontractorId] = useState('');

  const toggleConcept = (conceptId: string) => {
    setSelectedConcepts(prev => 
      prev.includes(conceptId) 
        ? prev.filter(id => id !== conceptId)
        : [...prev, conceptId]
    );
  };

  const calculateFees = () => {
    const price = parseFloat(totalPrice) || 0;
    const contractorFee = price * 0.04;
    const subcontractorFee = price * 0.03;
    const totalWithFees = price + contractorFee + subcontractorFee;
    return { contractorFee, subcontractorFee, totalWithFees };
  };

  const handleSubmit = () => {
    if (!selectedConcepts.length || !totalPrice || !deadline || !subcontractorId) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const { contractorFee, subcontractorFee } = calculateFees();
    
    onSubmit({
      contractor_id: contractorId,
      subcontractor_id: subcontractorId,
      concept_ids: selectedConcepts,
      total_price: parseFloat(totalPrice),
      contractor_fee: contractorFee,
      subcontractor_fee: subcontractorFee,
      deadline,
      status: 'pending'
    });
  };

  const { contractorFee, subcontractorFee, totalWithFees } = calculateFees();

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Create Trade Offer</Text>
      
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Select Concepts:</Text>
      {concepts.map(concept => (
        <TouchableOpacity
          key={concept.id}
          onPress={() => toggleConcept(concept.id)}
          style={{
            padding: 12,
            marginBottom: 8,
            backgroundColor: selectedConcepts.includes(concept.id) ? '#e3f2fd' : '#f5f5f5',
            borderRadius: 8,
            borderWidth: selectedConcepts.includes(concept.id) ? 2 : 1,
            borderColor: selectedConcepts.includes(concept.id) ? '#2196f3' : '#ddd'
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{concept.name}</Text>
          <Text>Qty: {concept.planned_quantity} {concept.unit}</Text>
          <Text>Cost: ${concept.total_cost}</Text>
        </TouchableOpacity>
      ))}

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Subcontractor ID:</Text>
      <TextInput
        value={subcontractorId}
        onChangeText={setSubcontractorId}
        placeholder="Enter subcontractor ID"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}
      />

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Total Offer Price:</Text>
      <TextInput
        value={totalPrice}
        onChangeText={setTotalPrice}
        placeholder="Enter total price"
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}
      />

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Deadline:</Text>
      <TextInput
        value={deadline}
        onChangeText={setDeadline}
        placeholder="YYYY-MM-DD"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16
        }}
      />

      {totalPrice && (
        <View style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Cost Breakdown:</Text>
          <Text>Base Price: ${parseFloat(totalPrice).toFixed(2)}</Text>
          <Text>Contractor Fee (4%): ${contractorFee.toFixed(2)}</Text>
          <Text>Subcontractor Fee (3%): ${subcontractorFee.toFixed(2)}</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Total with Fees: ${totalWithFees.toFixed(2)}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={onCancel}
          style={{
            flex: 1,
            backgroundColor: '#f44336',
            padding: 16,
            borderRadius: 8,
            marginRight: 8
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            flex: 1,
            backgroundColor: '#4caf50',
            padding: 16,
            borderRadius: 8,
            marginLeft: 8
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Create Offer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TradeOfferForm;