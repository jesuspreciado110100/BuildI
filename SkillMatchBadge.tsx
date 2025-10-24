import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SkillMatch } from '../types';

interface SkillMatchBadgeProps {
  match: SkillMatch;
  showDetails?: boolean;
}

const SkillMatchBadge: React.FC<SkillMatchBadgeProps> = ({ match, showDetails = false }) => {
  const getBadgeStyle = () => {
    if (match.total_score >= 90) {
      return { backgroundColor: '#10b981', icon: '🎯' };
    } else if (match.total_score >= 80) {
      return { backgroundColor: '#3b82f6', icon: '⭐' };
    } else if (match.total_score >= 70) {
      return { backgroundColor: '#f59e0b', icon: '📍' };
    } else {
      return { backgroundColor: '#6b7280', icon: '📋' };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
        <Text style={styles.icon}>{badgeStyle.icon}</Text>
        <Text style={styles.score}>{match.total_score}% match</Text>
      </View>
      
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.rating}>⭐ {match.rating} rating</Text>
          {match.matching_skills.length > 0 && (
            <Text style={styles.skills}>
              Skills: {match.matching_skills.slice(0, 2).join(', ')}
              {match.matching_skills.length > 2 && ` +${match.matching_skills.length - 2} more`}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  icon: {
    fontSize: 12,
    marginRight: 4
  },
  score: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  details: {
    marginTop: 4,
    paddingLeft: 8
  },
  rating: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2
  },
  skills: {
    fontSize: 11,
    color: '#6b7280'
  }
});

export default SkillMatchBadge;