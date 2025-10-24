import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface ProgressGraphProps {
  siteId: string;
}

interface DataPoint {
  date: string;
  progress: number;
}

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ siteId }) => {
  const screenWidth = Dimensions.get('window').width;
  const graphWidth = screenWidth - 64;
  const graphHeight = 200;

  // Mock data - in real app, fetch based on siteId
  const data: DataPoint[] = [
    { date: 'Jan', progress: 10 },
    { date: 'Feb', progress: 25 },
    { date: 'Mar', progress: 40 },
    { date: 'Apr', progress: 55 },
    { date: 'May', progress: 68 },
  ];

  const maxProgress = 100;
  const stepSize = graphWidth / (data.length - 1);

  const getPointPosition = (index: number, progress: number) => {
    const x = index * stepSize;
    const y = graphHeight - (progress / maxProgress) * graphHeight;
    return { x, y };
  };

  const createPath = () => {
    let path = '';
    data.forEach((point, index) => {
      const { x, y } = getPointPosition(index, point.progress);
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Timeline</Text>
      
      <View style={styles.graphContainer}>
        <View style={[styles.graph, { width: graphWidth, height: graphHeight }]}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = graphHeight - (value / maxProgress) * graphHeight;
            return (
              <View key={value} style={[styles.gridLine, { top: y }]} />
            );
          })}
          
          {/* Data points */}
          {data.map((point, index) => {
            const { x, y } = getPointPosition(index, point.progress);
            return (
              <View
                key={index}
                style={[
                  styles.dataPoint,
                  { left: x - 4, top: y - 4 }
                ]}
              />
            );
          })}
          
          {/* Progress line */}
          <View style={styles.progressLine}>
            {data.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = getPointPosition(index - 1, data[index - 1].progress);
              const currentPoint = getPointPosition(index, point.progress);
              const width = Math.sqrt(
                Math.pow(currentPoint.x - prevPoint.x, 2) + 
                Math.pow(currentPoint.y - prevPoint.y, 2)
              );
              const angle = Math.atan2(
                currentPoint.y - prevPoint.y,
                currentPoint.x - prevPoint.x
              ) * (180 / Math.PI);
              
              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: width,
                      transform: [{ rotate: `${angle}deg` }]
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>
        
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[100, 75, 50, 25, 0].map((value) => (
            <Text key={value} style={styles.yAxisLabel}>{value}%</Text>
          ))}
        </View>
        
        {/* X-axis labels */}
        <View style={[styles.xAxisLabels, { width: graphWidth }]}>
          {data.map((point, index) => {
            const x = index * stepSize;
            return (
              <Text
                key={index}
                style={[styles.xAxisLabel, { left: x - 15 }]}
              >
                {point.date}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  graphContainer: {
    position: 'relative',
    flexDirection: 'row',
  },
  graph: {
    position: 'relative',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  progressLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#3b82f6',
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    height: 200,
    marginLeft: 12,
    paddingVertical: 4,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    height: 20,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#6b7280',
    width: 30,
    textAlign: 'center',
  },
});