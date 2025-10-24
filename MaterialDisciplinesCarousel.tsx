import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Discipline {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface MaterialDisciplinesCarouselProps {
  selectedDiscipline?: string;
  onDisciplineSelect: (disciplineId: string) => void;
}

export const MaterialDisciplinesCarousel: React.FC<MaterialDisciplinesCarouselProps> = ({
  selectedDiscipline,
  onDisciplineSelect
}) => {
  const { theme } = useTheme();

  const disciplines: Discipline[] = [
    { id: 'all', name: 'All Materials', icon: '🧱', color: '#007AFF' },
    { id: 'woodworking', name: 'Woodworking', icon: '🪵', color: '#8B4513' },
    { id: 'concrete', name: 'Concrete', icon: '🏗️', color: '#696969' },
    { id: 'steel', name: 'Steel', icon: '⚙️', color: '#708090' },
    { id: 'waterproofing', name: 'Waterproofing', icon: '💧', color: '#4682B4' },
    { id: 'insulation', name: 'Insulation', icon: '🏠', color: '#FFB347' },
    { id: 'roofing', name: 'Roofing', icon: '🏘️', color: '#8B0000' },
    { id: 'flooring', name: 'Flooring', icon: '📐', color: '#CD853F' },
    { id: 'electrical', name: 'Electrical', icon: '⚡', color: '#FFD700' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧', color: '#20B2AA' }
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>🧱 Material Disciplines</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {disciplines.map((discipline) => (
          <TouchableOpacity
            key={discipline.id}
            style={[
              styles.disciplineCard,
              { backgroundColor: theme.colors.card },
              selectedDiscipline === discipline.id && { 
                backgroundColor: discipline.color + '20',
                borderColor: discipline.color,
                borderWidth: 2
              }
            ]}
            onPress={() => onDisciplineSelect(discipline.id)}
          >
            <Text style={styles.disciplineIcon}>{discipline.icon}</Text>
            <Text style={[
              styles.disciplineName, 
              { color: theme.colors.text },
              selectedDiscipline === discipline.id && { color: discipline.color, fontWeight: '600' }
            ]}>
              {discipline.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  disciplineCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disciplineIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  disciplineName: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});