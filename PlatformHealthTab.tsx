import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface PlatformKPIs {
  activeUsers: number;
  bookingsToday: number;
  uptimePercent: number;
  flaggedJobsPercent: number;
  bookingDistribution: {
    labor: number;
    machinery: number;
    material: number;
  };
}

export const PlatformHealthTab: React.FC = () => {
  const [kpis, setKpis] = useState<PlatformKPIs>({
    activeUsers: 1247,
    bookingsToday: 89,
    uptimePercent: 99.8,
    flaggedJobsPercent: 2.3,
    bookingDistribution: {
      labor: 156,
      machinery: 89,
      material: 203
    }
  });

  const [activityTimeline] = useState([
    { time: '09:00', event: 'Peak booking activity started', type: 'info' },
    { time: '10:30', event: 'Material order spike detected', type: 'warning' },
    { time: '11:45', event: 'System maintenance completed', type: 'success' },
    { time: '13:20', event: 'Payment processing delay resolved', type: 'info' },
    { time: '14:15', event: 'New contractor registrations: 12', type: 'success' }
  ]);

  const KPICard = ({ title, value, color = '#007AFF', suffix = '' }: { 
    title: string; 
    value: number; 
    color?: string; 
    suffix?: string; 
  }) => (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}{suffix}</Text>
    </View>
  );

  const BookingChart = () => {
    const total = kpis.bookingDistribution.labor + kpis.bookingDistribution.machinery + kpis.bookingDistribution.material;
    const laborPercent = (kpis.bookingDistribution.labor / total) * 100;
    const machineryPercent = (kpis.bookingDistribution.machinery / total) * 100;
    const materialPercent = (kpis.bookingDistribution.material / total) * 100;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Today's Booking Distribution</Text>
        <View style={styles.pieChart}>
          <View style={[styles.pieSegment, { backgroundColor: '#FF6B6B', flex: laborPercent }]} />
          <View style={[styles.pieSegment, { backgroundColor: '#4ECDC4', flex: machineryPercent }]} />
          <View style={[styles.pieSegment, { backgroundColor: '#45B7D1', flex: materialPercent }]} />
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Labor ({kpis.bookingDistribution.labor})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.legendText}>Machinery ({kpis.bookingDistribution.machinery})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#45B7D1' }]} />
            <Text style={styles.legendText}>Material ({kpis.bookingDistribution.material})</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Platform Health KPIs</Text>
      
      <View style={styles.kpiGrid}>
        <KPICard title="Active Users" value={kpis.activeUsers} color="#28A745" />
        <KPICard title="Bookings Today" value={kpis.bookingsToday} color="#007AFF" />
        <KPICard title="Uptime" value={kpis.uptimePercent} color="#28A745" suffix="%" />
        <KPICard title="Flagged Jobs" value={kpis.flaggedJobsPercent} color="#DC3545" suffix="%" />
      </View>

      <BookingChart />

      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Today's Platform Activity</Text>
        {activityTimeline.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <Text style={styles.timelineTime}>{item.time}</Text>
            <View style={[styles.timelineDot, { backgroundColor: 
              item.type === 'success' ? '#28A745' : 
              item.type === 'warning' ? '#FFC107' : '#007AFF' 
            }]} />
            <Text style={styles.timelineEvent}>{item.event}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    width: (width - 240 - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  pieChart: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pieSegment: {
    height: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  timelineContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
    width: 50,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  timelineEvent: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});