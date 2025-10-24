import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import VisualProgressLogCard from './VisualProgressLogCard';

interface ProgressSnapshot {
  id: string;
  conceptId: string;
  imageUrl: string;
  percentComplete: number;
  timestamp: string;
  status: 'on_track' | 'delayed' | 'critical';
  notes?: string;
}

interface ProgressLogGalleryProps {
  snapshots: ProgressSnapshot[];
  onSelect?: (snapshot: ProgressSnapshot) => void;
  groupBy?: 'date' | 'concept';
}

const ProgressLogGallery: React.FC<ProgressLogGalleryProps> = ({
  snapshots,
  onSelect,
  groupBy = 'date'
}) => {
  const [currentGroupBy, setCurrentGroupBy] = useState<'date' | 'concept'>(groupBy);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSnapshots = useMemo(() => {
    if (!searchQuery) return snapshots;
    return snapshots.filter(snapshot => 
      snapshot.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snapshot.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [snapshots, searchQuery]);

  const groupedSnapshots = useMemo(() => {
    const groups: { [key: string]: ProgressSnapshot[] } = {};
    
    filteredSnapshots.forEach(snapshot => {
      let key: string;
      if (currentGroupBy === 'date') {
        const date = new Date(snapshot.timestamp);
        key = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else {
        key = snapshot.conceptId;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(snapshot);
    });
    
    // Sort groups by date/concept
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
    
    return groups;
  }, [filteredSnapshots, currentGroupBy]);

  const renderCard = (snapshot: ProgressSnapshot) => (
    <View key={snapshot.id} className="mb-4">
      <VisualProgressLogCard snapshot={snapshot} />
      {onSelect && (
        <TouchableOpacity
          onPress={() => onSelect(snapshot)}
          className="bg-blue-500 mx-4 -mt-2 mb-2 py-2 px-4 rounded-b-lg"
        >
          <Text className="text-white text-center font-medium">View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (snapshots.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-gray-500 text-lg text-center">
          No Snapshots Found
        </Text>
        <Text className="text-gray-400 text-sm text-center mt-2">
          Progress logs will appear here once uploaded
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filter Bar */}
      <View className="bg-white border-b border-gray-200 p-4">
        <View className="flex-row mb-3">
          <TouchableOpacity
            onPress={() => setCurrentGroupBy('date')}
            className={`flex-1 py-2 px-4 rounded-l-lg border ${
              currentGroupBy === 'date' 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-white border-gray-300'
            }`}
          >
            <Text className={`text-center font-medium ${
              currentGroupBy === 'date' ? 'text-white' : 'text-gray-700'
            }`}>
              Group by Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentGroupBy('concept')}
            className={`flex-1 py-2 px-4 rounded-r-lg border ${
              currentGroupBy === 'concept' 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-white border-gray-300'
            }`}
          >
            <Text className={`text-center font-medium ${
              currentGroupBy === 'concept' ? 'text-white' : 'text-gray-700'
            }`}>
              Group by Concept
            </Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search snapshots..."
          className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2"
        />
      </View>

      {/* Gallery */}
      <ScrollView className="flex-1 p-4">
        {Object.entries(groupedSnapshots).map(([groupKey, groupSnapshots]) => (
          <View key={groupKey} className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3 px-2">
              {groupKey}
            </Text>
            {groupSnapshots.map(renderCard)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ProgressLogGallery;