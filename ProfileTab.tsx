import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserService, UserProfile, UserStats } from '../services/UserService';

export const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    company: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    loadUserData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        phone: profile.phone || '',
        company: profile.company || '',
        location: profile.location || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const loadUserData = async () => {
    if (user?.id) {
      const userProfile = await UserService.getUserProfile(user.id);
      const userStats = await UserService.getUserStats(user.id);
      if (userProfile) setProfile(userProfile);
      if (userStats) setStats(userStats);
    }
  };
  const handleSave = async () => {
    if (user?.id && profile) {
      const success = await UserService.updateUserProfile(user.id, editForm);
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
        loadUserData();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Contact Information</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? '💾 Save' : '✏️ Edit'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {profile && Object.entries(editForm).map(([key, value]) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={value}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, [key]: text }))}
              />
            ) : (
              <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
            )}
          </View>
        ))}
        
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Performance Statistics</Text>
        <View style={styles.statsGrid}>
          {stats && [
            { label: 'Projects Completed', value: stats.projects_completed.toString(), icon: '🏗️' },
            { label: 'Client Rating', value: `${stats.rating}/5`, icon: '⭐' },
            { label: 'Total Earnings', value: `$${stats.total_earnings.toLocaleString()}`, icon: '💰' },
            { label: 'Years Experience', value: stats.years_experience.toString(), icon: '📅' }
          ].map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Download Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📧</Text>
          <Text style={styles.actionText}>Update Email Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔒</Text>
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', fontFamily: 'System' },
  editButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editButtonText: { fontSize: 14, color: '#374151', fontFamily: 'System' },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: '#6b7280', marginBottom: 4, fontFamily: 'System' },
  fieldValue: { fontSize: 16, color: '#1f2937', fontFamily: 'System' },
  fieldInput: { fontSize: 16, color: '#1f2937', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 8, fontFamily: 'System' },
  saveButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, marginTop: 8 },
  saveButtonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600', fontFamily: 'System' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 4, fontFamily: 'System' },
  statLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center', fontFamily: 'System' },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionText: { fontSize: 16, color: '#374151', fontFamily: 'System' }
});