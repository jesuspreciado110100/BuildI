import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialDemandForecast, Concept, Material, Site, MaterialOffer } from '../types';
import MaterialForecastService from '../services/MaterialForecastService';
import { MaterialService } from '../services/MaterialService';

interface ForecastMaterialsPanelProps {
  concepts: Concept[];
  sites: Site[];
  onBookMaterial: (materialId: string, quantity: number, conceptId: string) => void;
}

const ForecastMaterialsPanel: React.FC<ForecastMaterialsPanelProps> = ({
  concepts,
  sites,
  onBookMaterial
}) => {
  const [forecasts, setForecasts] = useState<MaterialDemandForecast[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<string>('all');
  const [offers, setOffers] = useState<MaterialOffer[]>([]);

  useEffect(() => {
    loadData();
  }, [concepts, selectedSite]);

  const loadData = async () => {
    try {
      const allMaterials = await MaterialService.getMaterials();
      setMaterials(allMaterials);

      const filteredConcepts = selectedSite === 'all' 
        ? concepts 
        : concepts.filter(c => c.site_id === selectedSite);

      const projectPhase = getProjectPhase(filteredConcepts);
      const newForecasts = MaterialForecastService.generateForecasts(
        filteredConcepts,
        allMaterials,
        projectPhase
      );
      setForecasts(newForecasts);

      // Get supplier offers for forecasted materials
      const materialOffers = await Promise.all(
        newForecasts.slice(0, 5).map(async (forecast) => {
          const material = allMaterials.find(m => m.id === forecast.material_id);
          if (material) {
            const offers = await MaterialService.findNearbySuppliers(material.id, 'Default Location');
            return offers[0]; // Take best offer
          }
          return null;
        })
      );
      setOffers(materialOffers.filter(Boolean) as MaterialOffer[]);
    } catch (error) {
      console.error('Error loading forecast data:', error);
    }
  };

  const getProjectPhase = (concepts: Concept[]): 'planning' | 'active' | 'finishing' => {
    const inProgress = concepts.filter(c => c.status === 'in_progress').length;
    const completed = concepts.filter(c => c.status === 'completed').length;
    const total = concepts.length;
    
    if (completed / total > 0.8) return 'finishing';
    if (inProgress / total > 0.3) return 'active';
    return 'planning';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const filteredForecasts = selectedConcept === 'all'
    ? forecasts
    : forecasts.filter(f => f.concept_id === selectedConcept);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Material Demand Forecasts</Text>
      
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Site:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedSite === 'all' && styles.activeFilter]}
            onPress={() => setSelectedSite('all')}
          >
            <Text style={styles.filterText}>All Sites</Text>
          </TouchableOpacity>
          {sites.map(site => (
            <TouchableOpacity
              key={site.id}
              style={[styles.filterButton, selectedSite === site.id && styles.activeFilter]}
              onPress={() => setSelectedSite(site.id)}
            >
              <Text style={styles.filterText}>{site.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredForecasts.map(forecast => {
        const material = materials.find(m => m.id === forecast.material_id);
        const concept = concepts.find(c => c.id === forecast.concept_id);
        const offer = offers.find(o => o.materialId === forecast.material_id);
        
        return (
          <View key={forecast.id} style={styles.forecastCard}>
            <View style={styles.forecastHeader}>
              <Text style={styles.materialName}>{material?.name || 'Unknown Material'}</Text>
              <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(forecast.confidence_score) }]}>
                <Text style={styles.confidenceText}>{Math.round(forecast.confidence_score * 100)}%</Text>
              </View>
            </View>
            
            <Text style={styles.conceptName}>For: {concept?.name}</Text>
            <Text style={styles.quantity}>Predicted Quantity: {forecast.predicted_qty} {material?.category}</Text>
            
            {offer && (
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierText}>Suggested Supplier: {offer.distance.toFixed(1)}km away</Text>
                <Text style={styles.priceText}>Est. Cost: ${(offer.totalPrice * forecast.predicted_qty).toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => onBookMaterial(forecast.material_id, forecast.predicted_qty, forecast.concept_id)}
                >
                  <Text style={styles.bookButtonText}>Book Material</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  filters: {
    marginBottom: 16
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555'
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    marginRight: 8
  },
  activeFilter: {
    backgroundColor: '#2196F3'
  },
  filterText: {
    color: '#333',
    fontSize: 14
  },
  forecastCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  conceptName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  quantity: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12
  },
  supplierInfo: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12
  },
  supplierText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ForecastMaterialsPanel;