import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WorkerAnalytics } from '../types';

interface AnalyticsChartsProps {
  analytics: WorkerAnalytics[];
}

const { width } = Dimensions.get('window');

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  const getJobsDistribution = () => {
    const conceptCounts: { [key: string]: number } = {};
    
    analytics.forEach(worker => {
      Object.entries(worker.jobs_by_concept).forEach(([concept, count]) => {
        conceptCounts[concept] = (conceptCounts[concept] || 0) + count;
      });
    });
    
    return Object.entries(conceptCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 concepts
  };

  const getWorkerJobsData = () => {
    return analytics
      .sort((a, b) => b.completed_jobs - a.completed_jobs)
      .slice(0, 5) // Top 5 workers
      .map(worker => ({
        name: `Worker ${worker.worker_id}`,
        jobs: worker.completed_jobs,
        rating: worker.avg_rating
      }));
  };

  const renderBarChart = () => {
    const data = getWorkerJobsData();
    const maxJobs = Math.max(...data.map(d => d.jobs));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top Workers by Completed Jobs</Text>
        <View style={styles.barChart}>
          {data.map((item, index) => (
            <View key={index} style={styles.barItem}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: (item.jobs / maxJobs) * 100,
                      backgroundColor: `hsl(${200 + index * 30}, 70%, 50%)`
                    }
                  ]}
                />
                <Text style={styles.barValue}>{item.jobs}</Text>
              </View>
              <Text style={styles.barLabel}>{item.name}</Text>
              <Text style={styles.barRating}>★ {item.rating.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    const data = getJobsDistribution();
    const total = data.reduce((sum, [, count]) => sum + count, 0);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Job Distribution by Concept</Text>
        <View style={styles.pieChart}>
          <View style={styles.pieContainer}>
            {data.map(([concept, count], index) => {
              const percentage = ((count / total) * 100).toFixed(1);
              return (
                <View key={concept} style={styles.pieItem}>
                  <View 
                    style={[
                      styles.pieColor,
                      { backgroundColor: `hsl(${index * 60}, 70%, 50%)` }
                    ]}
                  />
                  <Text style={styles.pieLabel}>
                    {concept}: {count} ({percentage}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderSummaryStats = () => {
    const totalJobs = analytics.reduce((sum, w) => sum + w.completed_jobs, 0);
    const avgRating = analytics.length > 0 
      ? analytics.reduce((sum, w) => sum + w.avg_rating, 0) / analytics.length 
      : 0;
    const totalReviews = analytics.reduce((sum, w) => sum + w.feedback_stats.total_reviews, 0);
    
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Performance Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalJobs}</Text>
            <Text style={styles.summaryLabel}>Total Jobs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Avg Rating</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{analytics.length}</Text>
            <Text style={styles.summaryLabel}>Active Workers</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalReviews}</Text>
            <Text style={styles.summaryLabel}>Total Reviews</Text>
          </View>
        </View>
      </View>
    );
  };

  if (analytics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSummaryStats()}
      {renderBarChart()}
      {renderPieChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: 30,
    borderRadius: 4,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  barRating: {
    fontSize: 10,
    color: '#FFD700',
    marginTop: 2,
  },
  pieChart: {
    alignItems: 'center',
  },
  pieContainer: {
    width: '100%',
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  pieLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AnalyticsCharts;