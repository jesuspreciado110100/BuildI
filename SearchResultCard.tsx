import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SearchResult } from '../services/SearchService';

interface SearchResultCardProps {
  result: SearchResult;
  onPress: (result: SearchResult) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result, onPress }) => {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (result.type) {
      case 'worker': return '👷';
      case 'machine': return '🚜';
      case 'material': return '🧱';
      case 'concept': return '📋';
      case 'booking': return '📅';
      default: return '📄';
    }
  };

  const getStatusColor = () => {
    if (result.type === 'machine') {
      return result.metadata.available ? theme.colors.success : theme.colors.error;
    }
    if (result.type === 'booking') {
      switch (result.metadata.status) {
        case 'Confirmed': return theme.colors.success;
        case 'Pending': return theme.colors.warning;
        case 'Completed': return theme.colors.textSecondary;
        default: return theme.colors.textSecondary;
      }
    }
    return theme.colors.textSecondary;
  };

  const renderMetadata = () => {
    switch (result.type) {
      case 'worker':
        return (
          <View style={styles.metadataContainer}>
            <Text style={[styles.metadataText, { color: theme.colors.textSecondary }]}>
              Skills: {result.metadata.skills?.join(', ') || 'N/A'}
            </Text>
          </View>
        );
      case 'machine':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {result.metadata.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        );
      case 'concept':
        return (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: theme.colors.primary,
                    width: `${result.metadata.progress}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {result.metadata.progress}%
            </Text>
          </View>
        );
      case 'material':
        return (
          <Text style={[styles.priceText, { color: theme.colors.success }]}>
            ${result.metadata.price}
          </Text>
        );
      case 'booking':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {result.metadata.status}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => onPress(result)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {result.title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {result.subtitle}
        </Text>
        {renderMetadata()}
      </View>
      
      <View style={styles.chevronContainer}>
        <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  metadataContainer: {
    marginTop: 4,
  },
  metadataText: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 30,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '300',
  },
});