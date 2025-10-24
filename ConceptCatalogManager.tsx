import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ConceptService, Concept } from '../services/ConceptService';
import { ConceptCostForm } from './ConceptCostForm';
import { ConceptCostDisplay } from './ConceptCostDisplay';

interface ConceptCatalogManagerProps {
  siteId: string;
  onConceptSelect?: (concept: Concept) => void;
}

export interface ConceptCostData {
  // Direct costs
  machineryCost: number;
  toolCost: number;
  consumableCost: number;
  materialCost: number;
  laborCost: number;
  
  // Indirect costs
  suretiesCost: number;
  officeCost: number;
  transportationCost: number;
  consultingCost: number;
  salariesCost: number;
}

export const ConceptCatalogManager: React.FC<ConceptCatalogManagerProps> = ({
  siteId,
  onConceptSelect
}) => {
  const { theme } = useTheme();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [showCostForm, setShowCostForm] = useState(false);
  const [conceptCosts, setConceptCosts] = useState<Record<string, ConceptCostData>>({});

  useEffect(() => {
    loadConcepts();
  }, [siteId]);

  const loadConcepts = async () => {
    try {
      const data = await ConceptService.getConceptsBySite(siteId);
      setConcepts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load concepts');
    }
  };

  const handleConceptPress = (concept: Concept) => {
    setSelectedConcept(concept);
    onConceptSelect?.(concept);
  };

  const handleAddCostData = (conceptId: string, costData: ConceptCostData) => {
    setConceptCosts(prev => ({
      ...prev,
      [conceptId]: costData
    }));
    setShowCostForm(false);
  };

  const getTotalUnitaryCost = (conceptId: string): number => {
    const costs = conceptCosts[conceptId];
    if (!costs) return 0;
    
    const directCosts = costs.machineryCost + costs.toolCost + costs.consumableCost + 
                       costs.materialCost + costs.laborCost;
    const indirectCosts = costs.suretiesCost + costs.officeCost + costs.transportationCost + 
                         costs.consultingCost + costs.salariesCost;
    
    return directCosts + indirectCosts;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Concept Catalog
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCostForm(true)}
        >
          <Text style={styles.addButtonText}>Add Cost Data</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.conceptList}>
        {concepts.map(concept => (
          <TouchableOpacity
            key={concept.id}
            style={[
              styles.conceptCard,
              { 
                backgroundColor: theme.colors.surface,
                borderColor: selectedConcept?.id === concept.id ? theme.colors.primary : theme.colors.border
              }
            ]}
            onPress={() => handleConceptPress(concept)}
          >
            <View style={styles.conceptHeader}>
              <Text style={[styles.conceptDescription, { color: theme.colors.text }]}>
                {concept.description}
              </Text>
              <Text style={[styles.conceptUnit, { color: theme.colors.textSecondary }]}>
                {concept.quantity} {concept.unit}
              </Text>
            </View>
            
            {conceptCosts[concept.id] && (
              <ConceptCostDisplay
                costData={conceptCosts[concept.id]}
                unitaryCost={getTotalUnitaryCost(concept.id)}
                quantity={concept.quantity}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showCostForm && selectedConcept && (
        <ConceptCostForm
          concept={selectedConcept}
          onSave={(costData) => handleAddCostData(selectedConcept.id, costData)}
          onCancel={() => setShowCostForm(false)}
          initialData={conceptCosts[selectedConcept.id]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  conceptList: {
    flex: 1,
    padding: 16,
  },
  conceptCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptDescription: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  conceptUnit: {
    fontSize: 14,
    marginLeft: 8,
  },
});