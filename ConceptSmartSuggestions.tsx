import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SmartSuggestionsService } from '../services/SmartSuggestionsService';

interface Suggestion {
  id: string;
  type: 'worker' | 'machinery' | 'material';
  title: string;
  description: string;
  rating?: number;
  price?: number;
  availability: string;
  matchScore: number;
  urgent?: boolean;
}

interface ConceptSmartSuggestionsProps {
  conceptId: string;
  conceptCategory: string;
  siteId: string;
  onQuickAdd?: (suggestion: Suggestion) => void;
}

export const ConceptSmartSuggestions: React.FC<ConceptSmartSuggestionsProps> = ({
  conceptId,
  conceptCategory,
  siteId,
  onQuickAdd
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'worker' | 'machinery' | 'material'>('all');

  useEffect(() => {
    loadSuggestions();
    checkForAlerts();
  }, [conceptId, conceptCategory]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      // Mock suggestions based on concept category
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          type: 'worker',
          title: 'John Smith - Concrete Specialist',
          description: 'Expert in foundation work, 4.8★ rating',
          rating: 4.8,
          price: 45,
          availability: 'Available tomorrow',
          matchScore: 95
        },
        {
          id: '2',
          type: 'machinery',
          title: 'Excavator CAT 320',
          description: 'Perfect for foundation excavation',
          price: 350,
          availability: 'Available this week',
          matchScore: 88
        },
        {
          id: '3',
          type: 'material',
          title: 'Ready-Mix Concrete',
          description: 'High-strength concrete for foundations',
          price: 120,
          availability: 'Same day delivery',
          matchScore: 92,
          urgent: true
        }
      ];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForAlerts = () => {
    // Mock AI notifications
    const alerts = [
      'Potential delay detected: Weather forecast shows rain next week',
      'Material shortage alert: Concrete supply may be limited'
    ];
    setNotifications(alerts);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worker': return '👷';
      case 'machinery': return '🚜';
      case 'material': return '🧱';
      default: return '💡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'worker': return '#4CAF50';
      case 'machinery': return '#FF9800';
      case 'material': return '#2196F3';
      default: return '#666';
    }
  };

  const handleQuickAdd = (suggestion: Suggestion) => {
    if (onQuickAdd) {
      onQuickAdd(suggestion);
    }
  };

  const filteredSuggestions = activeFilter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === activeFilter);

  const renderSuggestion = ({ item }: { item: Suggestion }) => (
    <View style={[styles.suggestionCard, item.urgent && styles.urgentCard]}>
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionTitle}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <View style={styles.titleInfo}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.matchScore}>
          <Text style={styles.matchText}>{item.matchScore}%</Text>
          <Text style={styles.matchLabel}>match</Text>
        </View>
      </View>
      
      <View style={styles.suggestionDetails}>
        {item.rating && (
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        )}
        {item.price && (
          <Text style={styles.price}>${item.price}/day</Text>
        )}
        <Text style={styles.availability}>{item.availability}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.quickAddButton, { backgroundColor: getTypeColor(item.type) }]}
        onPress={() => handleQuickAdd(item)}
      >
        <Text style={styles.quickAddText}>Quick Add</Text>
      </TouchableOpacity>
      
      {item.urgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>⚠️ Urgent</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Suggestions</Text>
        <Text style={styles.subtitle}>AI-powered recommendations</Text>
      </View>
      
      {notifications.length > 0 && (
        <View style={styles.notificationsSection}>
          <Text style={styles.notificationsTitle}>🤖 AI Notifications</Text>
          {notifications.map((notification, index) => (
            <View key={index} style={styles.notification}>
              <Text style={styles.notificationText}>{notification}</Text>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.filterContainer}>
        {['all', 'worker', 'machinery', 'material'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, activeFilter === filter && styles.activeFilter]}
            onPress={() => setActiveFilter(filter as any)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={filteredSuggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No suggestions available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  notificationsSection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  notificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8
  },
  notification: {
    marginBottom: 4
  },
  notificationText: {
    fontSize: 12,
    color: '#856404'
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0'
  },
  activeFilter: {
    backgroundColor: '#007AFF'
  },
  filterText: {
    fontSize: 12,
    color: '#666'
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600'
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    position: 'relative'
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336'
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  suggestionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8
  },
  titleInfo: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  description: {
    fontSize: 12,
    color: '#666'
  },
  matchScore: {
    alignItems: 'center'
  },
  matchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  matchLabel: {
    fontSize: 10,
    color: '#666'
  },
  suggestionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  rating: {
    fontSize: 12,
    color: '#666'
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  availability: {
    fontSize: 12,
    color: '#4CAF50'
  },
  quickAddButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  quickAddText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  urgentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  emptyState: {
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    color: '#666'
  }
});