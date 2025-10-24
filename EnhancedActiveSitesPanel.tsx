import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BottomSlidePanel from './BottomSlidePanel';
import { ConceptStatusManager } from './ConceptStatusManager';
import { AICrewOptimizerIntegration } from './AICrewOptimizerIntegration';
export default function EnhancedActiveSitesPanel() {
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [conceptStatuses, setConceptStatuses] = useState<{[key: string]: string}>({});

  const alfonsoSite = {
    id: '1',
    name: 'Auditorio Cívico',
    location: 'Magdalena de Kino, Sonora',
    status: 'En Progreso',
    progress: 65,
    startDate: '2024-01-15',
    budget: 15000000,
    spent: 9750000,
    workers: [
      { id: '1', name: 'Martin Albelais', role: 'Supervisor de Obra', status: 'Activo' },
      { id: '2', name: 'Felipe Miranda', role: 'Maestro de Obra', status: 'Activo' }
    ],
    concepts: [
      { 
        code: 'PRE-001', 
        description: 'Trazo y nivelación del terreno', 
        quantity: 1300, 
        unit: 'M2', 
        unitPrice: 13.13, 
        total: 17069,
        status: 'completed',
        materials: [
          { name: 'Cal hidratada', quantity: 65, unit: 'kg' },
          { name: 'Estacas de madera', quantity: 200, unit: 'pzas' }
        ],
        labor: [
          { role: 'Topógrafo', workers: 1, hours: 16 },
          { role: 'Peón', workers: 4, hours: 32 }
        ],
        machinery: [
          { type: 'Nivel topográfico', quantity: 1, hours: 16 },
          { type: 'Teodolito', quantity: 1, hours: 8 }
        ]
      },
      { 
        code: 'CIM-001', 
        description: 'Excavación por medios mecánicos', 
        quantity: 816, 
        unit: 'M3', 
        unitPrice: 94.08, 
        total: 76769.28,
        status: 'in-progress',
        materials: [
          { name: 'Combustible diesel', quantity: 500, unit: 'lts' }
        ],
        labor: [
          { role: 'Operador de excavadora', workers: 1, hours: 40 },
          { role: 'Ayudante general', workers: 2, hours: 40 }
        ],
        machinery: [
          { type: 'Excavadora CAT 320', quantity: 1, hours: 40 },
          { type: 'Camión volteo 7m³', quantity: 2, hours: 32 }
        ]
      },
      { 
        code: 'ALB-001', 
        description: 'Muros de ladrillo listón', 
        quantity: 1375.32, 
        unit: 'M2', 
        unitPrice: 799.65, 
        total: 1099774.64,
        status: 'pending',
        materials: [
          { name: 'Ladrillo listón', quantity: 68766, unit: 'pzas' },
          { name: 'Cemento Portland', quantity: 275, unit: 'bultos' },
          { name: 'Arena', quantity: 137, unit: 'm³' }
        ],
        labor: [
          { role: 'Albañil especialista', workers: 6, hours: 220 },
          { role: 'Ayudante de albañil', workers: 6, hours: 220 }
        ],
        machinery: [
          { type: 'Revolvedora 1 bulto', quantity: 2, hours: 110 },
          { type: 'Andamios tubulares', quantity: 50, hours: 220 }
        ]
      }
    ]
  };

  const renderWorkers = () => (
    <ScrollView style={styles.panelContent}>
      <Text style={styles.panelTitle}>Equipo de Trabajo</Text>
      {alfonsoSite.workers.map((worker) => (
        <View key={worker.id} style={styles.workerCard}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerInitials}>
              {worker.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{worker.name}</Text>
            <Text style={styles.workerRole}>{worker.role}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.statusText}>{worker.status}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const handleConceptStatusChange = (conceptCode: string, status: string) => {
    setConceptStatuses(prev => ({
      ...prev,
      [conceptCode]: status
    }));
  };

  const renderConcepts = () => (
    <ScrollView style={styles.panelContent}>
      <View style={styles.conceptsHeader}>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => {
            router.push('/job-concepts');
          }}
        >
          <Text style={styles.viewAllText}>Ver todos los conceptos</Text>
          <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      {alfonsoSite.concepts.map((concept, index) => (
        <ConceptStatusManager
          key={index}
          concept={{
            name: concept.code,
            description: concept.description,
            materials: concept.materials.map(m => ({
              name: m.name,
              quantity: m.quantity,
              unit: m.unit,
              unitPrice: 0
            })),
            labor: concept.labor.map(l => ({
              role: l.role,
              quantity: l.workers,
              hours: l.hours,
              hourlyRate: 0
            })),
            machinery: concept.machinery.map(m => ({
              type: m.type,
              quantity: m.quantity,
              hours: m.hours,
              hourlyRate: 0
            }))
          }}
          siteId={alfonsoSite.id}
          userId="alfonso-user-id"
        />
      ))}
    </ScrollView>
  );

  const renderSiteDetails = () => (
    <ScrollView style={styles.panelContent}>
      <Text style={styles.panelTitle}>Detalles del Proyecto</Text>
      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>Presupuesto Total</Text>
        <Text style={styles.detailValue}>
          ${alfonsoSite.budget.toLocaleString('es-MX')} MXN
        </Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>Gastado</Text>
        <Text style={styles.detailValue}>
          ${alfonsoSite.spent.toLocaleString('es-MX')} MXN
        </Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>Fecha de Inicio</Text>
        <Text style={styles.detailValue}>{alfonsoSite.startDate}</Text>
      </View>
    </ScrollView>
  );

  const renderAICrewOptimizer = () => (
    <View style={styles.panelContent}>
      <Text style={styles.panelTitle}>Optimización de Cuadrilla con IA</Text>
      <AICrewOptimizerIntegration
        conceptId={alfonsoSite.concepts[1].code} // Using the in-progress concept
        conceptType="excavation"
        contractorId="alfonso-contractor-id"
        onRecommendationsLoaded={(recommendations) => {
          console.log('AI Recommendations loaded:', recommendations);
        }}
      />
    </View>
  );

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'workers': return renderWorkers();
      case 'concepts': return renderConcepts();
      case 'details': return renderSiteDetails();
      case 'ai-crew': return renderAICrewOptimizer();
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.siteCard}>
          <View style={styles.siteHeader}>
            <View>
              <Text style={styles.siteName}>{alfonsoSite.name}</Text>
              <Text style={styles.siteLocation}>📍 {alfonsoSite.location}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.statusText}>{alfonsoSite.status}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progreso: {alfonsoSite.progress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${alfonsoSite.progress}%` }]} />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setActivePanel('workers')}
            >
              <Ionicons name="people" size={18} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Equipo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setActivePanel('concepts')}
            >
              <Ionicons name="construct" size={18} color="#10B981" />
              <Text style={styles.actionButtonText}>Conceptos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setActivePanel('ai-crew')}
            >
              <Ionicons name="bulb" size={18} color="#F59E0B" />
              <Text style={styles.actionButtonText}>IA Crew</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setActivePanel('details')}
            >
              <Ionicons name="information-circle" size={18} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomSlidePanel
        isVisible={activePanel !== null}
        onClose={() => setActivePanel(null)}
        title={
          activePanel === 'workers' ? 'Equipo de Trabajo' :
          activePanel === 'concepts' ? 'Conceptos de Obra' :
          activePanel === 'ai-crew' ? 'Optimización de Cuadrilla con IA' :
          activePanel === 'details' ? 'Detalles del Proyecto' : ''
        }
      >
        {renderPanelContent()}
      </BottomSlidePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    flex: 1,
    padding: 16
  },
  siteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  siteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  siteName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter'
  },
  siteLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter'
  },
  progressSection: {
    marginBottom: 24
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 70,
    flex: 1,
    marginHorizontal: 2
  },
  actionButtonText: {
    fontSize: 10,
    color: '#374151',
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'Inter'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  panelContent: {
    flex: 1
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  workerInitials: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  workerInfo: {
    flex: 1
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  workerRole: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 2
  },
  conceptCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  conceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  conceptCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6'
  },
  conceptTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669'
  },
  conceptDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8
  },
  conceptDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8
  },
  conceptDetail: {
    fontSize: 12,
    color: '#6B7280'
  },
  detailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280'
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  conceptsHeader: {
    marginBottom: 16
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 8
  }
});