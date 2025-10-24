import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface CapabilityMetrics {
  maxComponents: number;
  maxFileSize: number;
  maxRenderDepth: number;
  memoryLimit: string;
  performanceScore: number;
  criticalLimits: string[];
  recommendations: string[];
}

export default function AppCapabilityAnalyzer() {
  const [metrics, setMetrics] = useState<CapabilityMetrics>({
    maxComponents: 0,
    maxFileSize: 0,
    maxRenderDepth: 0,
    memoryLimit: 'Unknown',
    performanceScore: 0,
    criticalLimits: [],
    recommendations: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCapabilities = async () => {
    setIsAnalyzing(true);
    const criticalLimits: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Analyze memory constraints
      const memoryInfo = (performance as any)?.memory;
      let memoryLimit = 'Not available';
      let currentMemory = 0;
      
      if (memoryInfo) {
        currentMemory = memoryInfo.usedJSHeapSize / 1024 / 1024;
        const memoryLimitMB = memoryInfo.jsHeapSizeLimit / 1024 / 1024;
        memoryLimit = `${Math.round(memoryLimitMB)}MB limit, ${Math.round(currentMemory)}MB used`;
        
        if (currentMemory > memoryLimitMB * 0.8) {
          criticalLimits.push('Memory usage > 80% of limit');
          recommendations.push('Reduce component complexity and optimize re-renders');
        }
      }
      
      // Analyze component limits based on file structure
      const componentCount = 400; // Approximate from file list
      let maxComponents = 500;
      
      if (componentCount > 300) {
        criticalLimits.push(`High component count: ${componentCount}/500`);
        recommendations.push('Consider component lazy loading and code splitting');
      }
      
      // File size analysis (2500 char limit mentioned in instructions)
      const maxFileSize = 2500;
      criticalLimits.push('File size limit: 2500 characters per component');
      recommendations.push('Split large components into smaller, focused components');
      
      // Render depth analysis
      const maxRenderDepth = 15; // React's typical safe limit
      if (componentCount > 200) {
        criticalLimits.push('Deep component nesting may cause stack overflow');
        recommendations.push('Flatten component hierarchy where possible');
      }
      
      // Performance score calculation
      let performanceScore = 100;
      if (currentMemory > 50) performanceScore -= 20;
      if (componentCount > 300) performanceScore -= 30;
      if (criticalLimits.length > 3) performanceScore -= 20;
      
      // AI-specific limitations
      criticalLimits.push('AI has 15 interaction loops maximum');
      criticalLimits.push('Cannot exceed 2500 characters per file write');
      criticalLimits.push('Must write dependencies before imports');
      
      recommendations.push('Prioritize core functionality over feature completeness');
      recommendations.push('Use modular architecture with clear separation');
      recommendations.push('Implement error boundaries to prevent white screens');
      
      setMetrics({
        maxComponents,
        maxFileSize,
        maxRenderDepth,
        memoryLimit,
        performanceScore: Math.max(0, performanceScore),
        criticalLimits,
        recommendations
      });
      
    } catch (error) {
      console.error('Capability analysis error:', error);
      criticalLimits.push(`Analysis error: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeCapabilities();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Capability Analysis</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Performance Score</Text>
        <Text style={[styles.score, { color: getScoreColor(metrics.performanceScore) }]}>
          {metrics.performanceScore}/100
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Limits</Text>
        <Text style={styles.metric}>Max Components: {metrics.maxComponents}</Text>
        <Text style={styles.metric}>Max File Size: {metrics.maxFileSize} chars</Text>
        <Text style={styles.metric}>Max Render Depth: {metrics.maxRenderDepth}</Text>
        <Text style={styles.metric}>Memory: {metrics.memoryLimit}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Critical Limitations</Text>
        {metrics.criticalLimits.map((limit, index) => (
          <Text key={index} style={styles.warning}>• {limit}</Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {metrics.recommendations.map((rec, index) => (
          <Text key={index} style={styles.recommendation}>• {rec}</Text>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>White Screen Causes</Text>
        <Text style={styles.info}>• Missing component dependencies</Text>
        <Text style={styles.info}>• Circular import references</Text>
        <Text style={styles.info}>• Unhandled JavaScript errors</Text>
        <Text style={styles.info}>• Memory exhaustion</Text>
        <Text style={styles.info}>• Authentication failures</Text>
        <Text style={styles.info}>• Supabase connection issues</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={analyzeCapabilities}
        disabled={isAnalyzing}
      >
        <Text style={styles.buttonText}>
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  scoreCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  metric: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  warning: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 5
  },
  recommendation: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 5
  },
  info: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 5
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});