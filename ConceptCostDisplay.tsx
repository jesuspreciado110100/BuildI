import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ConceptCostData } from './ConceptCatalogManager';

interface ConceptCostDisplayProps {
  costData: ConceptCostData;
  unitaryCost: number;
  quantity: number;
}

export const ConceptCostDisplay: React.FC<ConceptCostDisplayProps> = ({
  costData,
  unitaryCost,
  quantity
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const directCosts = costData.machineryCost + costData.toolCost + costData.consumableCost + 
                     costData.materialCost + costData.laborCost;
  const indirectCosts = costData.suretiesCost + costData.officeCost + costData.transportationCost + 
                       costData.consultingCost + costData.salariesCost;
  const totalCost = unitaryCost * quantity;

  const costBreakdown = [
    { label: 'Machinery', value: costData.machineryCost, type: 'direct' },
    { label: 'Tools', value: costData.toolCost, type: 'direct' },
    { label: 'Consumables', value: costData.consumableCost, type: 'direct' },
    { label: 'Materials', value: costData.materialCost, type: 'direct' },
    { label: 'Labor', value: costData.laborCost, type: 'direct' },
    { label: 'Sureties', value: costData.suretiesCost, type: 'indirect' },
    { label: 'Office', value: costData.officeCost, type: 'indirect' },
    { label: 'Transportation', value: costData.transportationCost, type: 'indirect' },
    { label: 'Consulting', value: costData.consultingCost, type: 'indirect' },
    { label: 'Salaries', value: costData.salariesCost, type: 'indirect' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.costSummary}>
          <Text style={[styles.unitaryCost, { color: theme.colors.primary }]}>
            ${unitaryCost.toLocaleString()} / unit
          </Text>
          <Text style={[styles.totalCost, { color: theme.colors.text }]}>
            Total: ${totalCost.toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>
          {expanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.breakdown}>
          <View style={styles.costSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Direct Costs</Text>
            {costBreakdown.filter(item => item.type === 'direct' && item.value > 0).map((item, index) => (
              <View key={index} style={styles.costRow}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.costValue, { color: theme.colors.text }]}>
                  ${item.value.toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={[styles.subtotalRow, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.subtotalLabel, { color: theme.colors.text }]}>
                Direct Subtotal
              </Text>
              <Text style={[styles.subtotalValue, { color: theme.colors.primary }]}>
                ${directCosts.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.costSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Indirect Costs</Text>
            {costBreakdown.filter(item => item.type === 'indirect' && item.value > 0).map((item, index) => (
              <View key={index} style={styles.costRow}>
                <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.costValue, { color: theme.colors.text }]}>
                  ${item.value.toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={[styles.subtotalRow, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.subtotalLabel, { color: theme.colors.text }]}>
                Indirect Subtotal
              </Text>
              <Text style={[styles.subtotalValue, { color: theme.colors.primary }]}>
                ${indirectCosts.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[styles.totalRow, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.totalRowText}>
              Total Unitary: ${unitaryCost.toLocaleString()}
            </Text>
            <Text style={styles.totalRowText}>
              Total Project: ${totalCost.toLocaleString()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  costSummary: {
    flex: 1,
  },
  unitaryCost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCost: {
    fontSize: 14,
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  breakdown: {
    padding: 12,
    paddingTop: 0,
  },
  costSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  costLabel: {
    fontSize: 13,
    flex: 1,
  },
  costValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  totalRowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});