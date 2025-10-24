import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { RentalIssue, MachineryItem } from '../types';
import RentalHistoryService from '../services/RentalHistoryService';
import { styles } from './ContractorDashboardStyles';

interface IssuesTabProps {
  renterId: string;
}

const mockMachinery: MachineryItem[] = [
  {
    id: 'excavator-1',
    renter_id: 'renter-1',
    category: 'Excavator',
    brand: 'CAT',
    model: '320D',
    year: '2020',
    rate: 500,
    rate_type: 'day',
    photos: ['excavator1.jpg'],
    description: 'Heavy duty excavator',
    available: true,
    region: 'North',
    created_at: '2024-01-01T00:00:00Z',
    status: 'active'
  }
];

export default function IssuesTab({ renterId }: IssuesTabProps) {
  const [issues, setIssues] = useState<RentalIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<RentalIssue[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<RentalIssue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadIssues();
  }, [renterId]);

  useEffect(() => {
    applyFilters();
  }, [issues, severityFilter, statusFilter]);

  const loadIssues = async () => {
    try {
      const renterIssues = await RentalHistoryService.getIssuesByRenter(renterId);
      setIssues(renterIssues);
    } catch (error) {
      console.error('Failed to load issues:', error);
    }
  };

  const applyFilters = () => {
    let filtered = issues;
    
    if (severityFilter !== 'All') {
      filtered = filtered.filter(issue => issue.severity === severityFilter);
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    setFilteredIssues(filtered);
  };

  const resolveIssue = async (issueId: string) => {
    try {
      const resolved = await RentalHistoryService.resolveIssue(issueId, resolutionNotes);
      if (resolved) {
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? resolved : issue
        ));
        setSelectedIssue(null);
        setResolutionNotes('');
      }
    } catch (error) {
      console.error('Failed to resolve issue:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#ff4444';
      case 'Medium': return '#ffaa00';
      case 'Low': return '#44ff44';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#ff4444';
      case 'Under Review': return '#ffaa00';
      case 'Resolved': return '#44ff44';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Equipment Issues</Text>
      
      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Severity:</Text>
          <View style={styles.filterButtons}>
            {['All', 'High', 'Medium', 'Low'].map(severity => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.filterButton,
                  severityFilter === severity && styles.activeFilter
                ]}
                onPress={() => setSeverityFilter(severity)}
              >
                <Text style={[
                  styles.filterButtonText,
                  severityFilter === severity && styles.activeFilterText
                ]}>
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterButtons}>
            {['All', 'Open', 'Under Review', 'Resolved'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.activeFilter
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.activeFilterText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Issues List */}
      {filteredIssues.map(issue => {
        const machinery = mockMachinery.find(m => m.id === issue.booking_id);
        
        return (
          <View key={issue.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Issue #{issue.id.slice(-4)}
              </Text>
              <View style={styles.badgeContainer}>
                <View style={[
                  styles.badge,
                  { backgroundColor: getSeverityColor(issue.severity) }
                ]}>
                  <Text style={styles.badgeText}>{issue.severity}</Text>
                </View>
                <View style={[
                  styles.badge,
                  { backgroundColor: getStatusColor(issue.status) }
                ]}>
                  <Text style={styles.badgeText}>{issue.status}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.cardSubtitle}>
              Equipment: {machinery?.brand} {machinery?.model}
            </Text>
            <Text style={styles.cardSubtitle}>
              Submitted: {new Date(issue.submitted_at).toLocaleDateString()}
            </Text>
            
            <Text style={styles.issueDescription}>{issue.description}</Text>
            
            {issue.photos.length > 0 && (
              <View style={styles.photoContainer}>
                <Text style={styles.photoLabel}>Photos:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {issue.photos.map((photo, index) => (
                    <View key={index} style={styles.photoPreview}>
                      <Text style={styles.photoText}>{photo}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {issue.status === 'Resolved' && issue.resolution_notes && (
              <View style={styles.resolutionSection}>
                <Text style={styles.resolutionLabel}>Resolution:</Text>
                <Text style={styles.resolutionText}>{issue.resolution_notes}</Text>
                <Text style={styles.resolutionDate}>
                  Resolved: {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            )}
            
            {issue.status !== 'Resolved' && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setSelectedIssue(issue)}
              >
                <Text style={styles.buttonText}>Resolve Issue</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      
      {filteredIssues.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No issues found</Text>
        </View>
      )}
      
      {/* Resolution Modal */}
      {selectedIssue && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resolve Issue</Text>
            <Text style={styles.modalSubtitle}>
              Issue #{selectedIssue.id.slice(-4)}
            </Text>
            
            <Text style={styles.formLabel}>Resolution Notes:</Text>
            <TextInput
              style={styles.textInput}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholder="Describe the resolution..."
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => resolveIssue(selectedIssue.id)}
              >
                <Text style={styles.buttonText}>Mark Resolved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setSelectedIssue(null);
                  setResolutionNotes('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}