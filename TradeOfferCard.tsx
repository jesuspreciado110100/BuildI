import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { TradeOffer, Concept } from '../types';
import { escrowService } from '../services/EscrowService';
import { calendarSyncService } from '../services/CalendarSyncService';
import PaymentModal from './PaymentModal';

interface TradeOfferCardProps {
  offer: TradeOffer;
  concepts: Concept[];
  onAccept?: () => void;
  onDecline?: () => void;
  onCounterOffer?: () => void;
  showActions?: boolean;
  isContractor?: boolean;
}

const TradeOfferCard: React.FC<TradeOfferCardProps> = ({
  offer,
  concepts,
  onAccept,
  onDecline,
  onCounterOffer,
  showActions = false,
  isContractor = false
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [escrow, setEscrow] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'accepted': return '#4caf50';
      case 'declined': return '#f44336';
      case 'counter_offered': return '#2196f3';
      default: return '#757575';
    }
  };

  const offerConcepts = concepts.filter(c => offer.concept_ids.includes(c.id));
  const totalPlannedCost = offerConcepts.reduce((sum, c) => sum + c.total_cost, 0);
  const contractorFee = offer.total_price * 0.04;
  const subcontractorFee = offer.total_price * 0.03;
  const netToSubcontractor = offer.total_price - subcontractorFee;

  const handleAccept = async () => {
    if (isContractor) {
      setShowPaymentModal(true);
    } else {
      onAccept?.();
    }
  };

  const handlePaymentComplete = async () => {
    const newEscrow = await escrowService.createEscrow(offer);
    await escrowService.createPaymentIntent(offer);
    setEscrow(newEscrow);
    onAccept?.();
  };

  const handleSyncToCalendar = async () => {
    setSyncing(true);
    try {
      const calendarLink = await calendarSyncService.syncTradeOfferToCalendar(offer);
      calendarSyncService.downloadICSFile(calendarLink, `trade-offer-${offer.id}.ics`);
      Alert.alert('Success', 'Trade offer synced to calendar! Calendar file downloaded.');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync to calendar');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={{
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Trade Offer #{offer.id.slice(-6)}</Text>
        <View style={{
          backgroundColor: getStatusColor(offer.status),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {offer.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Deadline: {offer.deadline}</Text>

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Included Concepts:</Text>
      {offerConcepts.map(concept => (
        <View key={concept.id} style={{ marginLeft: 12, marginBottom: 4 }}>
          <Text style={{ fontSize: 14 }}>• {concept.name}</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {concept.planned_quantity} {concept.unit} @ ${concept.unit_price}
          </Text>
        </View>
      ))}

      <View style={{ backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginTop: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Financial Breakdown:</Text>
        <Text style={{ fontSize: 12 }}>Planned Cost: ${totalPlannedCost.toFixed(2)}</Text>
        <Text style={{ fontSize: 12 }}>Offer Price: ${offer.total_price.toFixed(2)}</Text>
        <Text style={{ fontSize: 12 }}>Contractor Fee (4%): ${contractorFee.toFixed(2)}</Text>
        <Text style={{ fontSize: 12 }}>Subcontractor Fee (3%): ${subcontractorFee.toFixed(2)}</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
          Total: ${(offer.total_price + contractorFee).toFixed(2)}
        </Text>
        {!isContractor && (
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4caf50', marginTop: 4 }}>
            Your Payout: ${netToSubcontractor.toFixed(2)}
          </Text>
        )}
      </View>

      {escrow && (
        <View style={{ backgroundColor: '#e8f5e8', padding: 12, borderRadius: 8, marginTop: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>Escrow Status:</Text>
          <Text style={{ fontSize: 12 }}>Status: {escrow.status.toUpperCase()}</Text>
          <Text style={{ fontSize: 12 }}>Amount: ${escrow.total_price.toFixed(2)}</Text>
          <Text style={{ fontSize: 12 }}>Your Net: ${escrow.net_to_subcontractor.toFixed(2)}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSyncToCalendar}
        disabled={syncing}
        style={{
          backgroundColor: offer.sync_enabled ? '#4caf50' : '#2196f3',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
          marginTop: 12,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {syncing ? 'Syncing...' : offer.sync_enabled ? 'Synced to Calendar ✓' : 'Sync to Calendar'}
        </Text>
      </TouchableOpacity>

      {showActions && offer.status === 'pending' && (
        <View style={{ flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={onDecline}
            style={{
              backgroundColor: '#f44336',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              flex: 1,
              marginRight: 4
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onCounterOffer}
            style={{
              backgroundColor: '#ff9800',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              flex: 1,
              marginHorizontal: 4
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Counter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleAccept}
            style={{
              backgroundColor: '#4caf50',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
              flex: 1,
              marginLeft: 4
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        tradeOffer={offer}
        onPaymentComplete={handlePaymentComplete}
      />
    </View>
  );
};

export default TradeOfferCard;