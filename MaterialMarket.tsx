import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native';
import { MaterialOffer, MaterialBooking, Concept } from '../types';
import MaterialOrderSummary from './MaterialOrderSummary';
import ConceptSelector from './ConceptSelector';
import AIProviderSuggestions from './AIProviderSuggestions';
import { Provider } from './ProviderSuggestion';
import { MaterialService } from '../services/MaterialService';
import InventoryService from '../services/InventoryService';

interface MaterialMarketProps {
  contractorId: string;
  concepts?: Concept[];
}

const MaterialMarket: React.FC<MaterialMarketProps> = ({ contractorId, concepts = [] }) => {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [contractorLat, setContractorLat] = useState(40.7128);
  const [contractorLng, setContractorLng] = useState(-74.0060);
  const [offers, setOffers] = useState<MaterialOffer[]>([]);
  const [currentBooking, setCurrentBooking] = useState<MaterialBooking | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [customBidPrice, setCustomBidPrice] = useState('');
  const [showCustomBid, setShowCustomBid] = useState<string | null>(null);
  const [conceptId, setConceptId] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [budget, setBudget] = useState('');
  const inventoryService = InventoryService.getInstance();

  const materialTypes = ['Concrete Mix', 'Steel Rebar', 'Cement Bags', 'Bricks', 'Sand'];

  const searchMaterials = async () => {
    if (!selectedMaterial || !quantity || !siteLocation) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const nearbyStores = inventoryService.findNearbyStores(contractorLat, contractorLng, 50);
      const materialOffers: MaterialOffer[] = [];
      
      nearbyStores.forEach(store => {
        const storeMaterials = inventoryService.getMaterialsByStore(store.id);
        const matchingMaterials = storeMaterials.filter(m => 
          m.name.toLowerCase().includes(selectedMaterial.toLowerCase()) && 
          m.stockQuantity >= parseInt(quantity)
        );
        
        matchingMaterials.forEach(material => {
          const distance = inventoryService['calculateDistance'](
            contractorLat, contractorLng, store.latitude, store.longitude
          );
          
          materialOffers.push({
            id: `${store.id}-${material.id}`,
            materialId: material.id,
            supplierId: material.supplierId,
            storeId: store.id,
            material,
            distance,
            totalPrice: material.unitPrice * parseInt(quantity),
            deliveryTime: material.deliveryTimeEstimate + Math.floor(distance / 30)
          });
        });
      });
      
      const sortedOffers = materialOffers.sort((a, b) => {
        const priceScore = a.totalPrice - b.totalPrice;
        const timeScore = (a.deliveryTime - b.deliveryTime) * 10;
        return priceScore + timeScore;
      });
      
      setOffers(sortedOffers);
      
      if (sortedOffers.length === 0) {
        Alert.alert('No Results', 'No suppliers found with the requested material in your area');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search materials');
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setBudget(provider.estimatedPrice.toString());
    setShowSuggestions(false);
    Alert.alert('Provider Selected', `${provider.name} has been selected.`);
  };

  const requestNow = async (offer: MaterialOffer) => {
    try {
      const booking = await MaterialService.createBooking({
        contractorId,
        supplierId: selectedProvider?.id || offer.supplierId,
        storeId: offer.storeId,
        materialId: offer.materialId,
        quantity: parseInt(quantity),
        siteLocation,
        status: 'pending',
        totalPrice: selectedProvider?.estimatedPrice || offer.totalPrice,
        concept_id: conceptId || undefined
      });
      
      setTimeout(async () => {
        const updatedBooking = await MaterialService.updateBookingStatus(
          booking.id, 
          'accepted', 
          new Date(Date.now() + offer.deliveryTime * 60 * 60 * 1000).toLocaleString()
        );
        if (updatedBooking) {
          setCurrentBooking(updatedBooking);
          setShowOrderSummary(true);
        }
      }, 2000);
      
      Alert.alert('Success', 'Material request sent! Waiting for supplier response...');
    } catch (error) {
      Alert.alert('Error', 'Failed to send request');
    }
  };

  const canShowSuggestions = siteLocation && quantity && selectedMaterial;

  const renderOffer = ({ item }: { item: MaterialOffer }) => (
    <View style={styles.offerCard}>
      <Text style={styles.materialName}>{item.material.name}</Text>
      <Text>Price: ${item.material.unitPrice}/unit</Text>
      <Text>Total: ${item.totalPrice}</Text>
      <Text>Distance: {item.distance.toFixed(1)}km</Text>
      <Text>Delivery: {item.deliveryTime}h</Text>
      <Text>Stock: {item.material.stockQuantity} units</Text>
      {item.material.sku && <Text>SKU: {item.material.sku}</Text>}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.requestButton} onPress={() => requestNow(item)}>
          <Text style={styles.buttonText}>Request Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Material Market</Text>
      
      <View style={styles.searchContainer}>
        <Text style={styles.label}>Material Type:</Text>
        <FlatList
          horizontal
          data={materialTypes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.materialButton, selectedMaterial === item && styles.selectedMaterial]}
              onPress={() => setSelectedMaterial(item)}
            >
              <Text style={[styles.materialButtonText, selectedMaterial === item && styles.selectedText]}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
        
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Quantity needed"
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          value={siteLocation}
          onChangeText={setSiteLocation}
          placeholder="Site location"
        />

        {concepts.length > 0 && (
          <>
            <Text style={styles.label}>Assign to Concept (Optional)</Text>
            <ConceptSelector
              concepts={concepts}
              selectedConceptId={conceptId}
              onSelect={setConceptId}
              placeholder="Select concept to assign"
            />
          </>
        )}

        {canShowSuggestions && (
          <TouchableOpacity 
            style={styles.suggestButton} 
            onPress={() => setShowSuggestions(true)}
          >
            <Text style={styles.suggestButtonText}>🤖 Suggest Providers</Text>
          </TouchableOpacity>
        )}

        {selectedProvider && (
          <View style={styles.selectedProviderCard}>
            <Text style={styles.selectedProviderTitle}>Selected Provider:</Text>
            <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
            <Text style={styles.selectedProviderDetails}>
              ${selectedProvider.estimatedPrice}/order • {selectedProvider.distance}km away
            </Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.searchButton} onPress={searchMaterials}>
          <Text style={styles.buttonText}>Search Materials</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
      />

      <Modal visible={showOrderSummary} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          {currentBooking && (
            <MaterialOrderSummary
              booking={currentBooking}
              onClose={() => setShowOrderSummary(false)}
            />
          )}
        </View>
      </Modal>

      <Modal visible={showSuggestions} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <AIProviderSuggestions
            resourceType="materials"
            location={siteLocation}
            budget={parseFloat(budget) || 500}
            onSelectProvider={handleProviderSelect}
            onClose={() => setShowSuggestions(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  searchContainer: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  materialButton: { backgroundColor: '#e0e0e0', padding: 8, margin: 4, borderRadius: 4 },
  selectedMaterial: { backgroundColor: '#007bff' },
  materialButtonText: { color: '#333' },
  selectedText: { color: 'white' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 8, borderRadius: 4 },
  searchButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 4 },
  suggestButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  suggestButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  selectedProviderCard: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#0ea5e9' },
  selectedProviderTitle: { fontSize: 14, fontWeight: '600', color: '#0369a1', marginBottom: 4 },
  selectedProviderName: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },
  selectedProviderDetails: { fontSize: 14, color: '#6b7280' },
  offerCard: { backgroundColor: '#f5f5f5', padding: 16, marginBottom: 12, borderRadius: 8 },
  materialName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  requestButton: { backgroundColor: '#28a745', padding: 8, borderRadius: 4, flex: 1 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }
});

export default MaterialMarket;