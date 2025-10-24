import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface FilterState {
  jobTypes: string[];
  digDepth: number;
  sizeWeight: string;
  techCost: string[];
}

interface SmartFiltersPanelProps {
  onFiltersChange: (filters: FilterState) => void;
  selectedCategory: string | null;
}

export const SmartFiltersPanel: React.FC<SmartFiltersPanelProps> = ({
  onFiltersChange,
  selectedCategory
}) => {
  const [filters, setFilters] = useState<FilterState>({
    jobTypes: [],
    digDepth: 15,
    sizeWeight: '',
    techCost: []
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const jobTypeOptions = [
    { id: 'construction', label: 'Construction' },
    { id: 'landscaping', label: 'Landscaping/Land Management' },
    { id: 'demolition', label: 'Demolition/Recycling' },
    { id: 'mining', label: 'Mining/Quarry' },
    { id: 'dredging', label: 'Dredging/Infrastructure' },
    { id: 'government', label: 'Government/Public Works' },
    { id: 'industrial', label: 'Industrial Power' }
  ];

  const sizeWeightOptions = [
    { id: 'compact', label: 'Compact (<20,000 lb)' },
    { id: 'midsize', label: 'Mid-Size (20,000-70,000 lb)' },
    { id: 'heavy', label: 'Heavy (>70,000 lb)' }
  ];

  const techCostOptions = [
    { id: 'hightech', label: 'High Productivity/Max Tech' },
    { id: 'lowcost', label: 'Low Cost/Fewer Tech' },
    { id: 'balanced', label: 'Balanced' }
  ];

  const toggleDropdown = (filterType: string) => {
    setActiveDropdown(activeDropdown === filterType ? null : filterType);
  };

  const toggleJobType = (jobType: string) => {
    const newJobTypes = filters.jobTypes.includes(jobType)
      ? filters.jobTypes.filter(t => t !== jobType)
      : [...filters.jobTypes, jobType];
    
    const newFilters = { ...filters, jobTypes: newJobTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const selectSizeWeight = (size: string) => {
    const newFilters = { ...filters, sizeWeight: size };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    setActiveDropdown(null);
  };

  const toggleTechCost = (tech: string) => {
    const newTechCost = filters.techCost.includes(tech)
      ? filters.techCost.filter(t => t !== tech)
      : [...filters.techCost, tech];
    
    const newFilters = { ...filters, techCost: newTechCost };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  if (!selectedCategory) return null;

  return (
    <View style={styles.container}>
      <View style={styles.horizontalFilters}>
        {/* Job Types Filter */}
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={[styles.filterButton, activeDropdown === 'jobTypes' && styles.activeFilterButton]}
            onPress={() => toggleDropdown('jobTypes')}
          >
            <Text style={[styles.filterButtonText, activeDropdown === 'jobTypes' && styles.activeFilterButtonText]}>
              Job Types {filters.jobTypes.length > 0 && `(${filters.jobTypes.length})`}
            </Text>
          </TouchableOpacity>
          
          {activeDropdown === 'jobTypes' && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                {jobTypeOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.dropdownItem, filters.jobTypes.includes(option.id) && styles.selectedDropdownItem]}
                    onPress={() => toggleJobType(option.id)}
                  >
                    <Text style={[styles.dropdownItemText, filters.jobTypes.includes(option.id) && styles.selectedDropdownItemText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Size/Weight Filter */}
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={[styles.filterButton, activeDropdown === 'sizeWeight' && styles.activeFilterButton]}
            onPress={() => toggleDropdown('sizeWeight')}
          >
            <Text style={[styles.filterButtonText, activeDropdown === 'sizeWeight' && styles.activeFilterButtonText]}>
              Size/Weight {filters.sizeWeight && '(1)'}
            </Text>
          </TouchableOpacity>
          
          {activeDropdown === 'sizeWeight' && (
            <View style={styles.dropdown}>
              {sizeWeightOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.dropdownItem, filters.sizeWeight === option.id && styles.selectedDropdownItem]}
                  onPress={() => selectSizeWeight(option.id)}
                >
                  <Text style={[styles.dropdownItemText, filters.sizeWeight === option.id && styles.selectedDropdownItemText]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Technology & Cost Filter */}
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={[styles.filterButton, activeDropdown === 'techCost' && styles.activeFilterButton]}
            onPress={() => toggleDropdown('techCost')}
          >
            <Text style={[styles.filterButtonText, activeDropdown === 'techCost' && styles.activeFilterButtonText]}>
              Tech & Cost {filters.techCost.length > 0 && `(${filters.techCost.length})`}
            </Text>
          </TouchableOpacity>
          
          {activeDropdown === 'techCost' && (
            <View style={styles.dropdown}>
              {techCostOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.dropdownItem, filters.techCost.includes(option.id) && styles.selectedDropdownItem]}
                  onPress={() => toggleTechCost(option.id)}
                >
                  <Text style={[styles.dropdownItemText, filters.techCost.includes(option.id) && styles.selectedDropdownItemText]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  horizontalFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterWrapper: {
    flex: 1,
    position: 'relative',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedDropdownItem: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  selectedDropdownItemText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
});