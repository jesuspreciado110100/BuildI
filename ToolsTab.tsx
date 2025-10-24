import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export const ToolsTab: React.FC = () => {
  const [activePortfolio, setActivePortfolio] = useState('current');

  const portfolioProjects = [
    { id: '1', name: 'Downtown Office Complex', status: 'completed', value: '$2.4M', image: '🏢', completion: '2023' },
    { id: '2', name: 'Residential Development', status: 'in-progress', value: '$1.8M', image: '🏘️', completion: '2024' },
    { id: '3', name: 'Shopping Center Renovation', status: 'completed', value: '$950K', image: '🏬', completion: '2023' }
  ];

  const proposals = [
    { id: '1', client: 'Metro Construction', project: 'Hospital Wing Addition', status: 'pending', value: '$3.2M', submitted: '2024-01-15' },
    { id: '2', client: 'City Planning Dept', project: 'Bridge Repair Project', status: 'approved', value: '$1.5M', submitted: '2024-01-10' },
    { id: '3', client: 'Private Developer', project: 'Luxury Condos', status: 'rejected', value: '$4.1M', submitted: '2024-01-05' }
  ];

  const leadershipTools = [
    { name: 'Team Performance Dashboard', description: 'Track team productivity and KPIs', icon: '📊', active: true },
    { name: 'Project Timeline Manager', description: 'Manage project schedules and milestones', icon: '📅', active: true },
    { name: 'Resource Allocation Tool', description: 'Optimize resource distribution', icon: '⚖️', active: false },
    { name: 'Safety Compliance Tracker', description: 'Monitor safety protocols and incidents', icon: '🛡️', active: true }
  ];

  const handleCreateProposal = () => {
    Alert.alert('Create Proposal', 'Proposal creation wizard will open here');
  };

  const handleExportPortfolio = () => {
    Alert.alert('Export Portfolio', 'Portfolio exported as PDF successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'approved': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#3b82f6';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'approved': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📁 Project Portfolio</Text>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportPortfolio}>
            <Text style={styles.exportButtonText}>📤 Export</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.portfolioTabs}>
          <TouchableOpacity 
            style={[styles.portfolioTab, activePortfolio === 'current' && styles.activePortfolioTab]}
            onPress={() => setActivePortfolio('current')}
          >
            <Text style={[styles.portfolioTabText, activePortfolio === 'current' && styles.activePortfolioTabText]}>
              Current Projects
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.portfolioTab, activePortfolio === 'completed' && styles.activePortfolioTab]}
            onPress={() => setActivePortfolio('completed')}
          >
            <Text style={[styles.portfolioTabText, activePortfolio === 'completed' && styles.activePortfolioTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {portfolioProjects.map(project => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <Text style={styles.projectImage}>{project.image}</Text>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectValue}>💰 {project.value}</Text>
                <Text style={styles.projectCompletion}>📅 {project.completion}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                <Text style={styles.statusText}>
                  {getStatusIcon(project.status)} {project.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Resume Builder</Text>
        <View style={styles.resumeActions}>
          <TouchableOpacity style={styles.resumeButton}>
            <Text style={styles.resumeButtonIcon}>📄</Text>
            <Text style={styles.resumeButtonText}>Generate Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resumeButton}>
            <Text style={styles.resumeButtonIcon}>🎨</Text>
            <Text style={styles.resumeButtonText}>Customize Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resumeButton}>
            <Text style={styles.resumeButtonIcon}>📧</Text>
            <Text style={styles.resumeButtonText}>Email Resume</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💼 Proposals & Bids</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateProposal}>
            <Text style={styles.createButtonText}>➕ Create</Text>
          </TouchableOpacity>
        </View>
        
        {proposals.map(proposal => (
          <View key={proposal.id} style={styles.proposalCard}>
            <View style={styles.proposalHeader}>
              <View style={styles.proposalInfo}>
                <Text style={styles.proposalProject}>{proposal.project}</Text>
                <Text style={styles.proposalClient}>🏢 {proposal.client}</Text>
                <Text style={styles.proposalValue}>💰 {proposal.value}</Text>
                <Text style={styles.proposalDate}>📅 {proposal.submitted}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proposal.status) }]}>
                <Text style={styles.statusText}>
                  {getStatusIcon(proposal.status)} {proposal.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Leadership Tools</Text>
        {leadershipTools.map((tool, index) => (
          <View key={index} style={styles.toolCard}>
            <View style={styles.toolHeader}>
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </View>
              <View style={[styles.toolStatus, { backgroundColor: tool.active ? '#10b981' : '#6b7280' }]}>
                <Text style={styles.toolStatusText}>
                  {tool.active ? '✅ Active' : '⏸️ Inactive'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.toolAction}>
              <Text style={styles.toolActionText}>
                {tool.active ? '🔧 Configure' : '▶️ Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', fontFamily: 'System' },
  exportButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  exportButtonText: { fontSize: 14, color: '#374151', fontFamily: 'System' },
  portfolioTabs: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 },
  portfolioTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activePortfolioTab: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  portfolioTabText: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  activePortfolioTabText: { color: '#1f2937', fontWeight: '500' },
  projectCard: { marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  projectHeader: { flexDirection: 'row', alignItems: 'center' },
  projectImage: { fontSize: 32, marginRight: 12 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 4, fontFamily: 'System' },
  projectValue: { fontSize: 14, color: '#059669', marginBottom: 2, fontFamily: 'System' },
  projectCompletion: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: 'white', fontWeight: '500', fontFamily: 'System' },
  resumeActions: { flexDirection: 'row', justifyContent: 'space-between' },
  resumeButton: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginHorizontal: 4 },
  resumeButtonIcon: { fontSize: 24, marginBottom: 8 },
  resumeButtonText: { fontSize: 12, color: '#374151', textAlign: 'center', fontFamily: 'System' },
  createButton: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  createButtonText: { fontSize: 14, color: 'white', fontFamily: 'System' },
  proposalCard: { marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  proposalHeader: { flexDirection: 'row', alignItems: 'center' },
  proposalInfo: { flex: 1 },
  proposalProject: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 4, fontFamily: 'System' },
  proposalClient: { fontSize: 14, color: '#6b7280', marginBottom: 2, fontFamily: 'System' },
  proposalValue: { fontSize: 14, color: '#059669', marginBottom: 2, fontFamily: 'System' },
  proposalDate: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  toolCard: { marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  toolHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  toolIcon: { fontSize: 20, marginRight: 12 },
  toolInfo: { flex: 1 },
  toolName: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 2, fontFamily: 'System' },
  toolDescription: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  toolStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  toolStatusText: { fontSize: 12, color: 'white', fontWeight: '500', fontFamily: 'System' },
  toolAction: { backgroundColor: '#e5e7eb', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  toolActionText: { fontSize: 14, color: '#374151', fontFamily: 'System' }
});