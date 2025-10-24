import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BimScheduleItem } from '../types';
import { BimSchedulerService } from '../services/BimSchedulerService';

interface BimTimelineViewerProps {
  siteId: string;
  onConceptSelect?: (conceptId: string) => void;
}

const BimTimelineViewer: React.FC<BimTimelineViewerProps> = ({ siteId, onConceptSelect }) => {
  const [scheduleItems, setScheduleItems] = useState<BimScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  useEffect(() => {
    loadSchedule();
  }, [siteId]);

  const loadSchedule = async () => {
    try {
      const schedule = await BimSchedulerService.getConceptSchedule(siteId);
      setScheduleItems(schedule);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTradeColor = (trade: string): string => {
    const colors: { [key: string]: string } = {
      concrete: '#8B4513',
      carpentry: '#D2691E',
      roofing: '#CD853F',
      plumbing: '#4682B4',
      electrical: '#FFD700',
      painting: '#98FB98'
    };
    return colors[trade] || '#808080';
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      not_started: '#E0E0E0',
      in_progress: '#4CAF50',
      completed: '#2196F3',
      delayed: '#F44336'
    };
    return colors[status] || '#808080';
  };

  const calculateBarWidth = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(days * 8, 40); // 8px per day, minimum 40px
  };

  const calculateBarPosition = (startDate: string): number => {
    const projectStart = new Date('2024-01-01'); // Mock project start
    const start = new Date(startDate);
    const days = Math.ceil((start.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    return days * 8; // 8px per day
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading timeline...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>4D Construction Timeline</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.timelineContainer}>
        <View style={styles.timeline}>
          {/* Timeline Header */}
          <View style={styles.timelineHeader}>
            <Text style={styles.headerText}>Jan 2024</Text>
            <Text style={styles.headerText}>Feb 2024</Text>
            <Text style={styles.headerText}>Mar 2024</Text>
          </View>
          
          {/* Timeline Rows */}
          {scheduleItems.map((item, index) => (
            <TouchableOpacity
              key={item.concept_id}
              style={styles.timelineRow}
              onPress={() => onConceptSelect?.(item.concept_id)}
            >
              <View style={styles.conceptInfo}>
                <Text style={styles.conceptName}>{item.concept_name}</Text>
                <Text style={styles.tradeText}>{item.trade}</Text>
                <Text style={styles.progressText}>{item.progress_percent}%</Text>
              </View>
              
              <View style={styles.timelineTrack}>
                <View
                  style={[
                    styles.timelineBar,
                    {
                      backgroundColor: getTradeColor(item.trade),
                      borderColor: getStatusColor(item.status),
                      width: calculateBarWidth(item.planned_start_date, item.planned_end_date),
                      left: calculateBarPosition(item.planned_start_date)
                    }
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${item.progress_percent}%`,
                        backgroundColor: getStatusColor(item.status)
                      }
                    ]}
                  />
                </View>
              </View>
              
              {hoveredConcept === item.concept_id && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{item.concept_name}</Text>
                  <Text style={styles.tooltipText}>Start: {item.planned_start_date}</Text>
                  <Text style={styles.tooltipText}>End: {item.planned_end_date}</Text>
                  <Text style={styles.tooltipText}>BIM Objects: {item.bim_object_ids.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Delayed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50
  },
  timelineContainer: {
    flex: 1,
    marginBottom: 16
  },
  timeline: {
    minWidth: 800
  },
  timelineHeader: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    paddingLeft: 200
  },
  headerText: {
    width: 100,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333'
  },
  timelineRow: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center'
  },
  conceptInfo: {
    width: 180,
    paddingRight: 16
  },
  conceptName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  tradeText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize'
  },
  progressText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  timelineTrack: {
    flex: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    marginLeft: 20
  },
  timelineBar: {
    position: 'absolute',
    height: 24,
    top: 3,
    borderRadius: 4,
    borderWidth: 2,
    opacity: 0.8
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    opacity: 0.7
  },
  tooltip: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 4,
    zIndex: 1000
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12
  },
  legend: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4
  },
  legendText: {
    fontSize: 12,
    color: '#666'
  }
});

export default BimTimelineViewer;