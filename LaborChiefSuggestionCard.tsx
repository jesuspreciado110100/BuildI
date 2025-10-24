import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SkillMatch, LaborChiefProfile } from '../types';
import SkillMatchBadge from './SkillMatchBadge';

interface LaborChiefSuggestionCardProps {
  match: SkillMatch;
  laborChief: LaborChiefProfile;
  onSelect: (laborChiefId: string) => void;
  isSelected?: boolean;
}

const LaborChiefSuggestionCard: React.FC<LaborChiefSuggestionCardProps> = ({
  match,
  laborChief,
  onSelect,
  isSelected = false
}) => {
  const getCertificationBadges = () => {
    return laborChief.skill_certifications.slice(0, 2).map((cert, index) => (
      <View key={index} style={styles.certBadge}>
        <Text style={styles.certText}>✓ {cert}</Text>
      </View>
    ));
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isSelected && styles.selectedCard]} 
      onPress={() => onSelect(match.labor_chief_id)}
    >
      <View style={styles.header}>
        <Text style={styles.crewName}>{laborChief.specialties[0]} Crew</Text>
        <SkillMatchBadge match={match} />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.crewSize}>👥 {laborChief.crew_size} workers</Text>
        <Text style={styles.rate}>${laborChief.hourly_rate}/hr</Text>
        <Text style={styles.location}>📍 {laborChief.location}</Text>
      </View>

      {laborChief.skill_certifications.length > 0 && (
        <View style={styles.certifications}>
          {getCertificationBadges()}
          {laborChief.skill_certifications.length > 2 && (
            <Text style={styles.moreCerts}>+{laborChief.skill_certifications.length - 2} more</Text>
          )}
        </View>
      )}

      <View style={styles.skills}>
        <Text style={styles.skillsLabel}>Skills:</Text>
        <Text style={styles.skillsList}>
          {match.matching_skills.length > 0 
            ? match.matching_skills.join(', ')
            : laborChief.skills.slice(0, 3).join(', ')
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  selectedCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#eff6ff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  crewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  crewSize: {
    fontSize: 12,
    color: '#6b7280'
  },
  rate: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600'
  },
  location: {
    fontSize: 12,
    color: '#6b7280'
  },
  certifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  certBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2
  },
  certText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '500'
  },
  moreCerts: {
    fontSize: 10,
    color: '#6b7280',
    alignSelf: 'center'
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  skillsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4
  },
  skillsList: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1
  }
});

export default LaborChiefSuggestionCard;