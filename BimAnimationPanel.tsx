import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Slider } from 'react-native';
import { BimScheduleItem } from '../types';
import { BimSchedulerService } from '../services/BimSchedulerService';

interface BimAnimationPanelProps {
  siteId: string;
  onDateChange?: (date: string) => void;
  onHighlightObjects?: (objectIds: string[]) => void;
}

const BimAnimationPanel: React.FC<BimAnimationPanelProps> = ({
  siteId,
  onDateChange,
  onHighlightObjects
}) => {
  const [scheduleItems, setScheduleItems] = useState<BimScheduleItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlanned, setShowPlanned] = useState(true);
  const [showActual, setShowActual] = useState(false);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    loadSchedule();
  }, [siteId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        advanceDate();
      }, 1000); // Advance 1 day per second
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentDate]);

  useEffect(() => {
    updateHighlightedObjects();
    onDateChange?.(currentDate.toISOString().split('T')[0]);
  }, [currentDate, showPlanned, showActual]);

  const loadSchedule = async () => {
    try {
      const schedule = await BimSchedulerService.getConceptSchedule(siteId);
      setScheduleItems(schedule);
      
      // Calculate date range
      const dates = schedule.flatMap(item => [
        new Date(item.planned_start_date),
        new Date(item.planned_end_date)
      ]);
      
      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      setDateRange({ start: startDate, end: endDate });
      setCurrentDate(startDate);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const advanceDate = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    if (nextDate <= dateRange.end) {
      setCurrentDate(nextDate);
      updateSliderValue(nextDate);
    } else {
      setIsPlaying(false);
    }
  };

  const updateSliderValue = (date: Date) => {
    const totalDays = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentDays = Math.ceil(
      (date.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    setSliderValue(currentDays / totalDays);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    const totalDays = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const targetDays = Math.floor(value * totalDays);
    const targetDate = new Date(dateRange.start);
    targetDate.setDate(targetDate.getDate() + targetDays);
    setCurrentDate(targetDate);
  };

  const updateHighlightedObjects = () => {
    const activeObjects: string[] = [];
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    scheduleItems.forEach(item => {
      const startDate = showPlanned ? item.planned_start_date : item.actual_start_date;
      const endDate = showPlanned ? item.planned_end_date : item.actual_end_date;
      
      if (startDate && endDate && currentDateStr >= startDate && currentDateStr <= endDate) {
        activeObjects.push(...item.bim_object_ids);
      }
    });
    
    onHighlightObjects?.(activeObjects);
  };

  const getActiveConceptsForDate = (date: string): BimScheduleItem[] => {
    return scheduleItems.filter(item => {
      const startDate = showPlanned ? item.planned_start_date : item.actual_start_date;
      const endDate = showPlanned ? item.planned_end_date : item.actual_end_date;
      
      return startDate && endDate && date >= startDate && date <= endDate;
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeConcepts = getActiveConceptsForDate(currentDate.toISOString().split('T')[0]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>4D Animation Control</Text>
      
      {/* Date Display */}
      <View style={styles.dateContainer}>
        <Text style={styles.currentDate}>{formatDate(currentDate)}</Text>
        <Text style={styles.dateRange}>
          {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </Text>
      </View>
      
      {/* Timeline Scrubber */}
      <View style={styles.scrubberContainer}>
        <Slider
          style={styles.slider}
          value={sliderValue}
          onValueChange={handleSliderChange}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#E0E0E0"
          thumbStyle={styles.sliderThumb}
        />
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isPlaying && styles.activeButton]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.controlButtonText}>
            {isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setCurrentDate(dateRange.start);
            setSliderValue(0);
            setIsPlaying(false);
          }}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Show:</Text>
        <TouchableOpacity
          style={[styles.toggleButton, showPlanned && styles.activeToggle]}
          onPress={() => setShowPlanned(!showPlanned)}
        >
          <Text style={styles.toggleButtonText}>Planned</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, showActual && styles.activeToggle]}
          onPress={() => setShowActual(!showActual)}
        >
          <Text style={styles.toggleButtonText}>Actual</Text>
        </TouchableOpacity>
      </View>
      
      {/* Active Concepts */}
      <View style={styles.activeConceptsContainer}>
        <Text style={styles.activeConceptsTitle}>Active Today:</Text>
        {activeConcepts.length > 0 ? (
          activeConcepts.map(concept => (
            <View key={concept.concept_id} style={styles.activeConceptItem}>
              <Text style={styles.activeConceptName}>{concept.concept_name}</Text>
              <Text style={styles.activeConceptTrade}>{concept.trade}</Text>
              <Text style={styles.activeConceptProgress}>{concept.progress_percent}%</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noActiveText}>No active concepts for this date</Text>
        )}
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeConcepts.length}</Text>
          <Text style={styles.statLabel}>Active Concepts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {activeConcepts.reduce((sum, c) => sum + c.bim_object_ids.length, 0)}
          </Text>
          <Text style={styles.statLabel}>BIM Objects</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    margin: 8
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  currentDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  dateRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  scrubberContainer: {
    marginBottom: 16
  },
  slider: {
    width: '100%',
    height: 40
  },
  sliderThumb: {
    backgroundColor: '#2196F3',
    width: 20,
    height: 20
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  controlButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginHorizontal: 8
  },
  activeButton: {
    backgroundColor: '#2196F3'
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 12
  },
  toggleButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8
  },
  activeToggle: {
    backgroundColor: '#4CAF50'
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#333'
  },
  activeConceptsContainer: {
    marginBottom: 16
  },
  activeConceptsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  activeConceptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  activeConceptName: {
    flex: 1,
    fontSize: 12,
    color: '#333'
  },
  activeConceptTrade: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
    marginRight: 8
  },
  activeConceptProgress: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  noActiveText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  statLabel: {
    fontSize: 10,
    color: '#666'
  }
});

export default BimAnimationPanel;