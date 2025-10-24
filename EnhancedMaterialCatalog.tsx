import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Material } from '../types';
import { MaterialService } from '../services/MaterialService';
import { MaterialCategoryCarousel } from './MaterialCategoryCarousel';
import { MaterialOrdersPanel } from './MaterialOrdersPanel';

interface EnhancedMaterialCatalogProps {
  supplierId: string;
  conceptId?: string;
  siteId?: string;
}

interface MaterialOrder {
  id: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  supplierName: string;
  status: 'quote_pending' | 'quote_accepted' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryDate?: string;
  trackingNumber?: string;
}

const EnhancedMaterialCatalog: React.FC<EnhancedMaterialCatalogProps> = ({ 
  supplierId, 
  conceptId, 
  siteId 
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  const categories = ['All', 'Concrete', 'Steel', 'Lumber', 'Electrical', 'Plumbing', 'Insulation', 'Roofing'];

  useEffect(() => {
    loadMaterials();
    loadMaterialOrders();
  }, [supplierId]);

  const loadMaterials = async () => {
    try {
      const supplierMaterials = await MaterialService.getMaterialsBySupplier(supplierId);
      setMaterials(supplierMaterials);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const loadMaterialOrders = () => {
    // Mock data for material orders
    const mockOrders: MaterialOrder[] = [
      {
        id: '1',
        materialName: 'Portland Cement',
        category: 'Concrete',
        quantity: 50,
        unit: 'bags',
        pricePerUnit: 12.50,
        totalPrice: 625,
        supplierName: 'BuildCorp',
        status: 'in_transit',
        deliveryDate: '2024-01-15',
        trackingNumber: 'BC123456'
      },
      {
        id: '2',
        materialName: 'Rebar 12mm',
        category: 'Steel',
        quantity: 100,
        unit: 'pieces',
        pricePerUnit: 8.75,
        totalPrice: 875,
        supplierName: 'SteelWorks',
        status: 'quote_pending'
      }
    ];
    setMaterialOrders(mockOrders);
  };

  const filteredMaterials = selectedCategory === 'All' 
    ? materials 
    : materials.filter(material => material.category === selectedCategory);

  const renderMaterial = ({ item }: { item: Material }) => (
    <View style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialName}>{item.name}</Text>
        <Text style={styles.price}>${item.unitPrice}/unit</Text>
      </View>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.stock}>Stock: {item.stockQuantity} units</Text>
      <Text style={styles.delivery}>Delivery: {item.deliveryTimeEstimate}h</Text>
      <TouchableOpacity style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Add to Order</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Material Catalog</Text>
        <TouchableOpacity 
          style={styles.ordersButton}
          onPress={() => setShowOrders(!showOrders)}
        >
          <Text style={styles.ordersButtonText}>
            {showOrders ? 'Hide Orders' : `Orders (${materialOrders.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <MaterialCategoryCarousel
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {showOrders && (
        <MaterialOrdersPanel
          conceptId={conceptId || ''}
          siteId={siteId || ''}
          materialOrders={materialOrders}
          onRefresh={loadMaterialOrders}
        />
      )}

      <Text style={styles.sectionTitle}>
        {selectedCategory} Materials ({filteredMaterials.length})
      </Text>

      <FlatList
        data={filteredMaterials}
        renderItem={renderMaterial}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  ordersButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  ordersButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginHorizontal: 16, marginBottom: 8 },
  row: { justifyContent: 'space-between', paddingHorizontal: 16 },
  materialCard: { backgroundColor: 'white', padding: 12, margin: 4, borderRadius: 8, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  materialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  materialName: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  category: { fontSize: 12, color: '#666', marginBottom: 2 },
  stock: { fontSize: 12, color: '#666', marginBottom: 2 },
  delivery: { fontSize: 12, color: '#666', marginBottom: 8 },
  orderButton: { backgroundColor: '#34C759', paddingVertical: 6, borderRadius: 4, alignItems: 'center' },
  orderButtonText: { color: 'white', fontSize: 12, fontWeight: '600' }
});

export default EnhancedMaterialCatalog;