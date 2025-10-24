import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { MaterialQuoteRequest, MaterialItem } from '../types';

interface MaterialQuoteRequestsTabProps {
  quoteRequests: MaterialQuoteRequest[];
  materials: MaterialItem[];
  onAcceptQuote: (quoteId: string, counterOffer?: number) => void;
  onDeclineQuote: (quoteId: string) => void;
}

interface QuoteRequestCardProps {
  quote: MaterialQuoteRequest;
  material: MaterialItem;
  onAccept: (counterOffer?: number) => void;
  onDecline: () => void;
}

function QuoteRequestCard({ quote, material, onAccept, onDecline }: QuoteRequestCardProps) {
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterPrice, setCounterPrice] = useState(material.unit_price.toString());

  const estimatedTotal = quote.quantity * material.unit_price;
  const counterTotal = quote.quantity * parseFloat(counterPrice || '0');

  const handleAccept = () => {
    onAccept();
  };

  const handleCounterOffer = () => {
    const price = parseFloat(counterPrice);
    if (price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    onAccept(price);
    setShowCounterOffer(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'declined': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <View style={styles.quoteCard}>
      <View style={styles.quoteHeader}>
        <Text style={styles.materialName}>{material.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) }]}>
          <Text style={styles.statusText}>{quote.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.quoteDetail}>Quantity: {quote.quantity} {material.unit_type}</Text>
      <Text style={styles.quoteDetail}>Site: {quote.site_id}</Text>
      <Text style={styles.quoteDetail}>Unit Price: ${material.unit_price.toFixed(2)}</Text>
      <Text style={styles.quoteTotal}>Total: ${estimatedTotal.toFixed(2)}</Text>
      
      {quote.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{quote.notes}</Text>
        </View>
      )}
      
      {quote.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.counterButton} 
            onPress={() => setShowCounterOffer(true)}
          >
            <Text style={styles.buttonText}>Counter Offer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {quote.counter_offer_price && (
        <View style={styles.counterOfferInfo}>
          <Text style={styles.counterOfferText}>
            Counter Offer: ${quote.counter_offer_price.toFixed(2)} per {material.unit_type}
          </Text>
          <Text style={styles.counterOfferTotal}>
            New Total: ${(quote.quantity * quote.counter_offer_price).toFixed(2)}
          </Text>
        </View>
      )}
      
      {/* Counter Offer Modal */}
      <Modal
        visible={showCounterOffer}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Counter Offer</Text>
            <Text style={styles.modalSubtitle}>
              Original price: ${material.unit_price.toFixed(2)} per {material.unit_type}
            </Text>
            
            <TextInput
              style={styles.priceInput}
              placeholder="New unit price"
              value={counterPrice}
              onChangeText={setCounterPrice}
              keyboardType="numeric"
            />
            
            <Text style={styles.newTotal}>
              New Total: ${counterTotal.toFixed(2)}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowCounterOffer(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitButton} 
                onPress={handleCounterOffer}
              >
                <Text style={styles.modalButtonText}>Send Counter Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function MaterialQuoteRequestsTab({ 
  quoteRequests, 
  materials, 
  onAcceptQuote, 
  onDeclineQuote 
}: MaterialQuoteRequestsTabProps) {
  const getMaterialById = (materialId: string) => {
    return materials.find(m => m.id === materialId);
  };

  const pendingQuotes = quoteRequests.filter(q => q.status === 'pending');
  const processedQuotes = quoteRequests.filter(q => q.status !== 'pending');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Pending Quotes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Quotes ({pendingQuotes.length})</Text>
          {pendingQuotes.length === 0 ? (
            <Text style={styles.emptyText}>No pending quote requests</Text>
          ) : (
            pendingQuotes.map((quote) => {
              const material = getMaterialById(quote.material_id);
              if (!material) return null;
              
              return (
                <QuoteRequestCard
                  key={quote.id}
                  quote={quote}
                  material={material}
                  onAccept={(counterOffer) => onAcceptQuote(quote.id, counterOffer)}
                  onDecline={() => onDeclineQuote(quote.id)}
                />
              );
            })
          )}
        </View>
        
        {/* Processed Quotes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processed Quotes ({processedQuotes.length})</Text>
          {processedQuotes.length === 0 ? (
            <Text style={styles.emptyText}>No processed quotes</Text>
          ) : (
            processedQuotes.map((quote) => {
              const material = getMaterialById(quote.material_id);
              if (!material) return null;
              
              return (
                <QuoteRequestCard
                  key={quote.id}
                  quote={quote}
                  material={material}
                  onAccept={() => {}}
                  onDecline={() => {}}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#495057'
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20
  },
  quoteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  quoteDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  quoteTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 8
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  notesText: {
    fontSize: 14,
    color: '#666'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1
  },
  counterButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1
  },
  declineButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14
  },
  counterOfferInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  counterOfferText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404'
  },
  counterOfferTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center'
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12
  },
  newTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalCancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1
  },
  modalSubmitButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});