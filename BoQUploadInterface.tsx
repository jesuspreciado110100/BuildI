import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import BoQFileUploader from './BoQFileUploader';
import BoQList from './BoQList';

interface BoQUploadInterfaceProps {
  projectId: string;
  userRole?: string;
  userId?: string;
}

export const BoQUploadInterface: React.FC<BoQUploadInterfaceProps> = ({
  projectId,
  userRole = 'contractor',
  userId = 'default-user'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = (sectionId: string) => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bill of Quantities</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
            onPress={() => setActiveTab('upload')}
          >
            <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
              Subir BoQ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' && styles.activeTab]}
            onPress={() => setActiveTab('list')}
          >
            <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
              Ver Items
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'upload' ? (
        <ScrollView style={styles.content}>
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Cargar Archivo BoQ</Text>
            <Text style={styles.description}>
              Sube archivos PDF o XLSX con tu Bill of Quantities. 
              El sistema extraerá automáticamente:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.feature}>• Descripción de trabajos</Text>
              <Text style={styles.feature}>• Costos de mano de obra (Factor México: 1.5186)</Text>
              <Text style={styles.feature}>• Materiales y cantidades</Text>
              <Text style={styles.feature}>• Maquinaria requerida</Text>
            </View>
            <BoQFileUploader
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          <BoQList
            key={refreshKey}
            projectId={projectId}
            userRole={userRole}
            userId={userId}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6
  },
  activeTab: {
    backgroundColor: '#007AFF'
  },
  tabText: {
    fontSize: 16,
    color: '#666'
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  uploadSection: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22
  },
  featureList: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30
  },
  feature: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20
  },
  listContainer: {
    flex: 1,
    paddingTop: 10
  }
});

export default BoQUploadInterface;