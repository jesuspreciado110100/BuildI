import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppDiagnostics from './AppDiagnostics';
import AppCapabilityAnalyzer from './AppCapabilityAnalyzer';
import ErrorBoundary from './ErrorBoundary';

type TabType = 'diagnostics' | 'capabilities' | 'main';

export default function DiagnosticDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('main');

  const renderMainDashboard = () => (
    <View style={styles.mainContainer}>
      <Text style={styles.title}>FamousAI App Analysis</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>White Screen Analysis</Text>
        <Text style={styles.summaryText}>
          White screens in this app typically occur due to:
        </Text>
        <Text style={styles.bulletPoint}>• Authentication failures (most common)</Text>
        <Text style={styles.bulletPoint}>• Missing component dependencies</Text>
        <Text style={styles.bulletPoint}>• Supabase connection issues</Text>
        <Text style={styles.bulletPoint}>• JavaScript errors in render methods</Text>
        <Text style={styles.bulletPoint}>• Memory exhaustion from too many components</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>AI Rendering Limitations</Text>
        <Text style={styles.bulletPoint}>• Maximum 15 interaction loops per session</Text>
        <Text style={styles.bulletPoint}>• 2500 character limit per file write</Text>
        <Text style={styles.bulletPoint}>• Must write dependencies before imports</Text>
        <Text style={styles.bulletPoint}>• ~400 components currently in codebase</Text>
        <Text style={styles.bulletPoint}>• Complex component hierarchy increases failure risk</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Maximum Capabilities</Text>
        <Text style={styles.bulletPoint}>• ~500 components before performance degrades</Text>
        <Text style={styles.bulletPoint}>• 15 nested component levels maximum</Text>
        <Text style={styles.bulletPoint}>• Memory limit varies by device (typically 50-100MB)</Text>
        <Text style={styles.bulletPoint}>• File splitting required for large components</Text>
        <Text style={styles.bulletPoint}>• Error boundaries prevent cascade failures</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('diagnostics')}
        >
          <Text style={styles.buttonText}>Run Diagnostics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('capabilities')}
        >
          <Text style={styles.buttonText}>Analyze Capabilities</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'diagnostics':
        return <AppDiagnostics />;
      case 'capabilities':
        return <AppCapabilityAnalyzer />;
      default:
        return renderMainDashboard();
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {activeTab !== 'main' && (
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setActiveTab('main')}
            >
              <Text style={styles.backButtonText}>← Back to Overview</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {renderContent()}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    padding: 10
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500'
  },
  mainContainer: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333'
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});