import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { PricingInsight } from '../types';

interface PricingInsightsModalProps {
  visible: boolean;
  onClose: () => void;
  insight: PricingInsight | null;
  onApplyPrice?: (newPrice: number) => void;
}

export default function PricingInsightsModal({ 
  visible, 
  onClose, 
  insight, 
  onApplyPrice 
}: PricingInsightsModalProps) {
  if (!insight) return null;

  const getPricePosition = () => {
    const range = insight.market_max_price - insight.market_min_price;
    const position = ((insight.current_price - insight.market_min_price) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'low': return '#dc2626';
      case 'fair': return '#16a34a';
      case 'high': return '#ea580c';
      default: return '#6b7280';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pricing Insights</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Current vs Market */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Comparison</Text>
            <View style={styles.priceComparison}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Your Price</Text>
                <Text style={styles.currentPrice}>${insight.current_price}/day</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Market Average</Text>
                <Text style={styles.marketPrice}>${insight.market_avg_price}/day</Text>
              </View>
            </View>
          </View>

          {/* Market Range Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Position</Text>
            <View style={styles.chartContainer}>
              <View style={styles.priceRange}>
                <View style={styles.rangeBar}>
                  <View 
                    style={[
                      styles.currentPriceMarker,
                      { left: `${getPricePosition()}%` }
                    ]}
                  />
                </View>
                <View style={styles.rangeLabels}>
                  <Text style={styles.rangeLabel}>${insight.market_min_price}</Text>
                  <Text style={styles.rangeLabel}>${insight.market_max_price}</Text>
                </View>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(insight.pricing_score) }]}>
                <Text style={styles.scoreText}>{insight.pricing_score.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Suggested Price */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recommendation</Text>
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestedPrice}>${insight.suggested_price}/day</Text>
              <Text style={styles.visibilityBoost}>
                {insight.visibility_boost_estimate > 0 
                  ? `+${insight.visibility_boost_estimate}% visibility boost` 
                  : insight.visibility_boost_estimate < 0
                  ? `${insight.visibility_boost_estimate}% visibility impact`
                  : 'Optimal visibility'
                }
              </Text>
              {onApplyPrice && (
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => onApplyPrice(insight.suggested_price)}
                >
                  <Text style={styles.applyButtonText}>Apply This Price</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Tips</Text>
            {insight.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>💡</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb' 
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  closeButton: { padding: 8 },
  closeText: { fontSize: 18, color: '#6b7280' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  priceComparison: { flexDirection: 'row', justifyContent: 'space-between' },
  priceItem: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderRadius: 8, marginHorizontal: 4 },
  priceLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  currentPrice: { fontSize: 18, fontWeight: 'bold', color: '#dc2626' },
  marketPrice: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
  chartContainer: { alignItems: 'center' },
  priceRange: { width: '100%', marginBottom: 16 },
  rangeBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, position: 'relative', marginBottom: 8 },
  currentPriceMarker: { position: 'absolute', top: -4, width: 16, height: 16, backgroundColor: '#dc2626', borderRadius: 8, transform: [{ translateX: -8 }] },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeLabel: { fontSize: 12, color: '#6b7280' },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  scoreText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  suggestionContainer: { alignItems: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 },
  suggestedPrice: { fontSize: 24, fontWeight: 'bold', color: '#0369a1', marginBottom: 4 },
  visibilityBoost: { fontSize: 14, color: '#0369a1', marginBottom: 12 },
  applyButton: { backgroundColor: '#dc2626', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  applyButtonText: { color: 'white', fontWeight: '600' },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  tipBullet: { fontSize: 16, marginRight: 8, marginTop: 2 },
  tipText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
});