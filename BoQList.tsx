import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, PanResponder } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface BoQItem {
  item_id: string;
  description: string;
  status: string;
  labor_cost: number;
  material_cost: number;
  machinery_cost: number;
  calculated_total_cost: number;
  quantity: number;
  unit: string;
}

interface BoQListProps {
  projectId: string;
  userRole: string;
  userId: string;
}

const BoQList: React.FC<BoQListProps> = ({ projectId, userRole, userId }) => {
  const [catalogItems, setCatalogItems] = useState<BoQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoQItems();
    setupRealtimeSubscription();
  }, [projectId, userRole, userId]);

  const fetchBoQItems = async () => {
    try {
      let query = supabase
        .from('catalog_cost_comparison')
        .select('*')
        .eq('project_id', projectId);

      if (userRole === 'worker') {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('item_id')
          .eq('assignee_id', userId)
          .eq('assignee_type', 'worker');
        
        const itemIds = assignments?.map(a => a.item_id) || [];
        if (itemIds.length > 0) {
          query = query.in('item_id', itemIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setCatalogItems(data || []);
    } catch (error) {
      console.error('Error fetching BoQ items:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('boq_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'catalog_items' },
        () => fetchBoQItems()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    try {
      await supabase
        .from('catalog_items')
        .update({ 
          status: newStatus,
          is_checked: newStatus === 'completed'
        })
        .eq('item_id', itemId);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const SwipeableItem: React.FC<{ item: BoQItem }> = ({ item }) => {
    const translateX = new Animated.Value(0);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => 
        Math.abs(gestureState.dx) > 20,
      
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          // Swipe right - mark in progress
          updateItemStatus(item.item_id, 'in_progress');
        } else if (gestureState.dx < -100) {
          // Swipe left - mark completed
          updateItemStatus(item.item_id, 'completed');
        }
        
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    });

    return (
      <Animated.View
        style={[styles.itemContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.title}>{item.description}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Costos (MXN)</Text>
          <Text>Labor: ${item.labor_cost?.toFixed(2) || '0.00'} (Factor: 1.5186)</Text>
          <Text>Materiales: ${item.material_cost?.toFixed(2) || '0.00'}</Text>
          <Text>Maquinaria: ${item.machinery_cost?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.total}>
            Total: ${item.calculated_total_cost?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, getStatusStyle(item.status)]}>
            {getStatusText(item.status)}
          </Text>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { color: '#4CAF50' };
      case 'in_progress': return { color: '#FF9800' };
      default: return { color: '#757575' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      default: return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando BoQ...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={catalogItems}
      renderItem={({ item }) => <SwipeableItem item={item} />}
      keyExtractor={item => item.item_id}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  itemContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  section: {
    marginVertical: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
  },
  total: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  status: {
    fontStyle: 'italic',
    fontWeight: '600'
  },
  quantity: {
    color: '#666',
    fontSize: 14
  }
});

export default BoQList;