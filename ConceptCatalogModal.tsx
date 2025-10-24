import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CatalogService, CatalogSectionWithItems, CatalogItem } from '@/app/services/CatalogService';

interface ConceptCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectConcept: (item: CatalogItem) => void;
  siteId: string;
}

export default function ConceptCatalogModal({ visible, onClose, onSelectConcept, siteId }: ConceptCatalogModalProps) {
  const [sections, setSections] = useState<CatalogSectionWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      loadCatalogData();
    }
  }, [visible]);

  const loadCatalogData = async () => {
    setLoading(true);
    try {
      const data = await CatalogService.getCatalogSectionsWithItems();
      setSections(data);
    } catch (error) {
      console.error('Error loading catalog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotalCost = (item: CatalogItem) => {
    const directTotal = Object.values(item.direct_costs || {}).reduce((sum, cost) => sum + (cost || 0), 0);
    const indirectTotal = Object.values(item.indirect_costs || {}).reduce((sum, cost) => sum + (cost || 0), 0);
    return directTotal + indirectTotal;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Catálogo de Conceptos</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Cargando conceptos...</Text>
          ) : (
            sections.map((section) => (
              <View key={section.section_id} style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.section_id)}
                >
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionName}>{section.name}</Text>
                    <Text style={styles.sectionCode}>{section.section_code}</Text>
                  </View>
                  <Ionicons
                    name={expandedSections.has(section.section_id) ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {expandedSections.has(section.section_id) && (
                  <View style={styles.itemsContainer}>
                    {section.items.map((item) => (
                      <TouchableOpacity
                        key={item.item_id}
                        style={styles.itemCard}
                        onPress={() => {
                          onSelectConcept(item);
                          onClose();
                        }}
                      >
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemCode}>{item.item_code}</Text>
                        </View>
                        <Text style={styles.itemDescription}>{item.description}</Text>
                        <View style={styles.itemFooter}>
                          <Text style={styles.itemUnit}>{item.unit}</Text>
                          <Text style={styles.itemCost}>
                            {formatCurrency(calculateTotalCost(item))}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 32,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionCode: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemsContainer: {
    padding: 8,
  },
  itemCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  itemCode: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});