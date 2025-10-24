import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HapticFeedbackService } from '../services/HapticFeedbackService';

interface Site {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
}

interface SiteSelectorProps {
  selectedSite?: Site;
  onSiteChange: (site: Site) => void;
  sticky?: boolean;
}

const mockSites: Site[] = [
  { id: '1', name: 'Downtown Plaza', location: 'New York, NY', status: 'active' },
  { id: '2', name: 'Harbor Bridge', location: 'San Francisco, CA', status: 'active' },
  { id: '3', name: 'Metro Station', location: 'Chicago, IL', status: 'maintenance' },
  { id: '4', name: 'Office Complex', location: 'Austin, TX', status: 'active' },
];

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  selectedSite = mockSites[0],
  onSiteChange,
  sticky = false
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSiteSelect = (site: Site) => {
    HapticFeedbackService.onButtonPress();
    onSiteChange(site);
    setModalVisible(false);
  };

  const getStatusColor = (status: Site['status']) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'inactive': return theme.colors.textSecondary;
      case 'maintenance': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Site['status']) => {
    switch (status) {
      case 'active': return '🟢';
      case 'inactive': return '🔴';
      case 'maintenance': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <>
      <View style={[
        styles.container,
        sticky && styles.sticky,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.siteInfo}>
            <Text style={[styles.siteName, { color: theme.colors.text }]}>
              🏗️ {selectedSite.name}
            </Text>
            <Text style={[styles.siteLocation, { color: theme.colors.textSecondary }]}>
              {selectedSite.location}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(selectedSite.status)}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Construction Site
            </Text>
            
            <ScrollView style={styles.siteList}>
              {mockSites.map((site) => (
                <TouchableOpacity
                  key={site.id}
                  style={[
                    styles.siteItem,
                    { borderColor: theme.colors.border },
                    selectedSite.id === site.id && {
                      backgroundColor: theme.colors.primary + '20',
                      borderColor: theme.colors.primary
                    }
                  ]}
                  onPress={() => handleSiteSelect(site)}
                  activeOpacity={0.8}
                >
                  <View style={styles.siteItemContent}>
                    <Text style={[styles.siteItemName, { color: theme.colors.text }]}>
                      🏗️ {site.name}
                    </Text>
                    <Text style={[styles.siteItemLocation, { color: theme.colors.textSecondary }]}>
                      {site.location}
                    </Text>
                  </View>
                  <View style={styles.siteItemStatus}>
                    <Text style={styles.statusIcon}>
                      {getStatusIcon(site.status)}
                    </Text>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(site.status) }
                    ]}>
                      {site.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  siteLocation: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 12,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  siteList: {
    maxHeight: 400,
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  siteItemContent: {
    flex: 1,
  },
  siteItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  siteItemLocation: {
    fontSize: 14,
  },
  siteItemStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});