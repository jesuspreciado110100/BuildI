import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ProgressBarAndroid, Platform } from 'react-native';

export const DevelopmentTab: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const courses = [
    { id: '1', title: 'OSHA 30-Hour Construction', progress: 100, status: 'completed', icon: '🛡️' },
    { id: '2', title: 'Project Management Basics', progress: 75, status: 'in-progress', icon: '📊' },
    { id: '3', title: 'Green Building Certification', progress: 0, status: 'not-started', icon: '🌱' },
    { id: '4', title: 'Advanced Concrete Techniques', progress: 45, status: 'in-progress', icon: '🏗️' }
  ];

  const skills = [
    { name: 'Project Management', level: 85, icon: '📋' },
    { name: 'Safety Compliance', level: 95, icon: '🦺' },
    { name: 'Team Leadership', level: 78, icon: '👥' },
    { name: 'Cost Estimation', level: 82, icon: '💰' },
    { name: 'Quality Control', level: 88, icon: '✅' },
    { name: 'Client Relations', level: 91, icon: '🤝' }
  ];

  const goals = [
    { title: 'Complete PMP Certification', deadline: '2024-06-30', progress: 60, icon: '🎯' },
    { title: 'Lead 5 Major Projects', deadline: '2024-12-31', progress: 40, icon: '🏆' },
    { title: 'Mentor 3 Junior Staff', deadline: '2024-09-15', progress: 33, icon: '👨‍🏫' }
  ];

  const badges = [
    { name: 'Safety Champion', earned: true, icon: '🏅' },
    { name: 'Project Completion', earned: true, icon: '✨' },
    { name: 'Team Builder', earned: false, icon: '🤝' },
    { name: 'Innovation Leader', earned: false, icon: '💡' }
  ];

  const renderProgressBar = (progress: number) => {
    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress / 100}
          color="#3b82f6"
        />
      );
    }
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Course Progress</Text>
        {courses.map(course => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseIcon}>{course.icon}</Text>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseStatus}>
                  {course.status === 'completed' ? '✅ Completed' : 
                   course.status === 'in-progress' ? '🔄 In Progress' : '⏳ Not Started'}
                </Text>
              </View>
              <Text style={styles.courseProgress}>{course.progress}%</Text>
            </View>
            {renderProgressBar(course.progress)}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Skill Ratings</Text>
        {skills.map((skill, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.skillCard}
            onPress={() => setSelectedSkill(selectedSkill === skill.name ? null : skill.name)}
          >
            <View style={styles.skillHeader}>
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <Text style={styles.skillName}>{skill.name}</Text>
              <Text style={styles.skillLevel}>{skill.level}%</Text>
            </View>
            {renderProgressBar(skill.level)}
            {selectedSkill === skill.name && (
              <View style={styles.skillDetails}>
                <Text style={styles.skillDetailText}>
                  🎯 Target: {skill.level + 10}% by year end
                </Text>
                <TouchableOpacity style={styles.improveButton}>
                  <Text style={styles.improveButtonText}>📈 Find Training</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Professional Goals</Text>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDeadline}>📅 Due: {goal.deadline}</Text>
              </View>
              <Text style={styles.goalProgress}>{goal.progress}%</Text>
            </View>
            {renderProgressBar(goal.progress)}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏅 Achievement Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge, index) => (
            <View key={index} style={[styles.badgeCard, !badge.earned && styles.badgeCardDisabled]}>
              <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconDisabled]}>
                {badge.icon}
              </Text>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameDisabled]}>
                {badge.name}
              </Text>
              {badge.earned && <Text style={styles.earnedBadge}>✅</Text>}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16, fontFamily: 'System' },
  courseCard: { marginBottom: 16, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  courseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  courseIcon: { fontSize: 20, marginRight: 12 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937', fontFamily: 'System' },
  courseStatus: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  courseProgress: { fontSize: 16, fontWeight: '600', color: '#3b82f6', fontFamily: 'System' },
  progressBarContainer: { height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#3b82f6' },
  skillCard: { marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  skillHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  skillIcon: { fontSize: 18, marginRight: 12 },
  skillName: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1f2937', fontFamily: 'System' },
  skillLevel: { fontSize: 16, fontWeight: '600', color: '#3b82f6', fontFamily: 'System' },
  skillDetails: { marginTop: 12, padding: 8, backgroundColor: '#e0f2fe', borderRadius: 6 },
  skillDetailText: { fontSize: 14, color: '#0369a1', marginBottom: 8, fontFamily: 'System' },
  improveButton: { backgroundColor: '#0284c7', padding: 8, borderRadius: 6 },
  improveButtonText: { color: 'white', fontSize: 14, textAlign: 'center', fontFamily: 'System' },
  goalCard: { marginBottom: 16, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  goalIcon: { fontSize: 20, marginRight: 12 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937', fontFamily: 'System' },
  goalDeadline: { fontSize: 14, color: '#6b7280', fontFamily: 'System' },
  goalProgress: { fontSize: 16, fontWeight: '600', color: '#3b82f6', fontFamily: 'System' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '48%', backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#10b981' },
  badgeCardDisabled: { borderColor: '#d1d5db', opacity: 0.6 },
  badgeIcon: { fontSize: 32, marginBottom: 8 },
  badgeIconDisabled: { opacity: 0.5 },
  badgeName: { fontSize: 14, fontWeight: '500', color: '#1f2937', textAlign: 'center', fontFamily: 'System' },
  badgeNameDisabled: { color: '#9ca3af' },
  earnedBadge: { position: 'absolute', top: 4, right: 4, fontSize: 16 }
});