import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Vibration } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SwipeableBoQCardProps {
  job: {
    id: string;
    title: string;
    status: string;
    labor: { crew: number; cost: number };
    materials: Array<{ name: string; quantity: number; cost: number }>;
    machinery: Array<{ name: string; hours: number; cost: number }>;
  };
  onComplete: () => void;
  onStatusChange: () => void;
}

export const SwipeableBoQCard: React.FC<SwipeableBoQCardProps> = ({ 
  job, 
  onComplete, 
  onStatusChange 
}) => {
  const [pan] = useState(new Animated.Value(0));
  const [showUndo, setShowUndo] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => 
      Math.abs(gestureState.dx) > 20,
    onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 100) {
        // Swipe right - status change
        Vibration.vibrate(50);
        onStatusChange();
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      } else if (gestureState.dx < -100) {
        // Swipe left - complete
        Vibration.vibrate(50);
        onComplete();
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      }
      Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      default: return '#757575';
    }
  };

  const totalCost = job.labor.cost + 
    job.materials.reduce((sum, m) => sum + m.cost, 0) +
    job.machinery.reduce((sum, m) => sum + m.cost, 0);

  return (
    <View>
      <Animated.View 
        style={[styles.card, { transform: [{ translateX: pan }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{job.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>{job.status}</Text>
          </View>
        </View>

        <CollapsibleSection 
          title="Labor" 
          icon="engineering" 
          summary={`${job.labor.crew} crew • $${job.labor.cost}`}
          details={[`Crew size: ${job.labor.crew}`, `Cost: $${job.labor.cost}`]}
        />

        <CollapsibleSection 
          title="Materials" 
          icon="inventory" 
          summary={`${job.materials.length} items • $${job.materials.reduce((sum, m) => sum + m.cost, 0)}`}
          details={job.materials.map(m => `${m.name}: ${m.quantity} @ $${m.cost}`)}
        />

        <CollapsibleSection 
          title="Machinery" 
          icon="construction" 
          summary={`${job.machinery.length} items • $${job.machinery.reduce((sum, m) => sum + m.cost, 0)}`}
          details={job.machinery.map(m => `${m.name}: ${m.hours}h @ $${m.cost}`)}
        />

        <View style={styles.footer}>
          <Text style={styles.totalCost}>Total: ${totalCost}</Text>
        </View>
      </Animated.View>

      {showUndo && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Action completed</Text>
          <TouchableOpacity style={styles.undoButton}>
            <Text style={styles.undoButtonText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: string;
  summary: string;
  details: string[];
}> = ({ title, icon, summary, details }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => setExpanded(!expanded)}
      >
        <MaterialIcons name={icon as any} size={20} color="#666" />
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialIcons 
          name={expanded ? "expand-less" : "expand-more"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
      <Text style={styles.summary}>{summary}</Text>
      {expanded && (
        <View style={styles.details}>
          {details.map((detail, index) => (
            <Text key={index} style={styles.detailText}>• {detail}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  summary: {
    fontSize: 13,
    color: '#666',
    marginLeft: 28,
  },
  details: {
    marginLeft: 28,
    marginTop: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  undoBar: {
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  undoButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});