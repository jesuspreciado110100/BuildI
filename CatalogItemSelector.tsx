import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/app/lib/supabase';

interface CatalogItem {
  item_id: string;
  item_code: string;
  name?: string;
  description: string;
  unit: string;
  quantity: number;
  rate?: number;
  section_id: string;
  section_name?: string;
}

interface CatalogSection {
  section_id: string;
  section_code: string;
  name: string;
  description?: string;
}

interface CatalogItemSelectorProps {
  projectId: string;
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  onItemSelect?: (item: CatalogItem) => void;
}

export default function CatalogItemSelector({ 
  projectId, 
  selectedItems, 
  onItemsChange,
  onItemSelect 
}: CatalogItemSelectorProps) {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSections();
  }, [projectId]);

  useEffect(() => {
    if (selectedSection) {
      fetchItems();
    }
  }, [selectedSection, searchQuery]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('catalog_sections')
        .select('*')
        .eq('project_id', projectId)
        .order('section_code');

      if (data) {
        setSections(data);
        if (data.length > 0 && !selectedSection) {
          setSelectedSection(data[0].section_id);
        }
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('catalog_items')
        .select(`
          *,
          catalog_sections!inner(
            section_id,
            name,
            section_code
          )
        `)
        .eq('section_id', selectedSection)
        .order('item_code');

      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,item_code.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (data) {
        const formattedItems = data.map(item => ({
          ...item,
          section_name: item.catalog_sections?.name
        }));
        setItems(formattedItems);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    onItemsChange(newSelection);
    
    if (onItemSelect && !selectedItems.includes(itemId)) {
      const item = items.find(i => i.item_id === itemId);
      if (item) onItemSelect(item);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Catalog Items</Text>
      
      {/* Section Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.section_id}
            style={[
              styles.sectionTab,
              selectedSection === section.section_id && styles.selectedSectionTab
            ]}
            onPress={() => setSelectedSection(section.section_id)}
          >
            <Text style={[
              styles.sectionTabText,
              selectedSection === section.section_id && styles.selectedSectionTabText
            ]}>
              {section.section_code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Items List */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.item_id}
            style={[
              styles.itemCard,
              selectedItems.includes(item.item_id) && styles.selectedItemCard
            ]}
            onPress={() => toggleItemSelection(item.item_id)}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemCode}>{item.item_code}</Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name || item.description}
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                selectedItems.includes(item.item_id) && styles.checkedBox
              ]}>
                {selectedItems.includes(item.item_id) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemUnit}>Unit: {item.unit}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              {item.rate && (
                <Text style={styles.itemRate}>Rate: ${item.rate.toFixed(2)}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {items.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  title: { fontSize: 18, fontWeight: '600', color: '#1F2937', padding: 16, paddingBottom: 8 },
  sectionScroll: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTab: { backgroundColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  selectedSectionTab: { backgroundColor: '#3B82F6' },
  sectionTabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  selectedSectionTabText: { color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' },
  itemsList: { flex: 1, paddingHorizontal: 16 },
  itemCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  selectedItemCard: { borderColor: '#3B82F6', backgroundColor: '#EBF4FF' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemInfo: { flex: 1, marginRight: 12 },
  itemCode: { fontSize: 14, fontWeight: '600', color: '#3B82F6', marginBottom: 2 },
  itemName: { fontSize: 16, color: '#1F2937', lineHeight: 20 },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  checkedBox: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  itemDetails: { flexDirection: 'row', gap: 16 },
  itemUnit: { fontSize: 12, color: '#6B7280' },
  itemQuantity: { fontSize: 12, color: '#6B7280' },
  itemRate: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 8 }
});