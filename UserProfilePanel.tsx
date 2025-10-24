import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from './ProfileHeader';
import MyRatingsTab from './MyRatingsTab';
import PaymentHistoryTab from './PaymentHistoryTab';
import RoleSwitcher from './RoleSwitcher';
import ReferralRewardTracker from './ReferralRewardTracker';
import ThemeToggleButton from './ThemeToggleButton';
import LanguagePicker from './LanguagePicker';
import AuthService from '../services/AuthService';
import ReviewService from '../services/ReviewService';
import PaymentService from '../services/PaymentService';
import NotificationService from '../services/NotificationService';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  rating: number;
  completedProjects: number;
  avatar?: string;
}

export default function UserProfilePanel() {
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [ratings, setRatings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showReferralTracker, setShowReferralTracker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userRatings = await ReviewService.getUserRatings(currentUser.id);
        const userPayments = await PaymentService.getPaymentHistory(currentUser.id);
        setRatings(userRatings);
        setPayments(userPayments);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => AuthService.logout() }
      ]
    );
  };

  const renderSettingsCard = (title: string, subtitle: string, onPress: () => void, icon: string) => (
    <TouchableOpacity style={[styles.settingsCard, { backgroundColor: theme.cardBackground }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>{subtitle}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.secondaryText }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Section 1: Profile Header */}
      <ProfileHeader user={user} onEditProfile={() => {}} />
      
      {/* Section 2: Account & Ratings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account & Ratings</Text>
        
        {renderSettingsCard(
          'My Ratings & Reviews',
          `${user.rating}/5 average rating`,
          () => setShowRatingsModal(true),
          '⭐'
        )}
        
        {renderSettingsCard(
          'Payment History',
          'View transactions and invoices',
          () => setShowPaymentModal(true),
          '💳'
        )}
      </View>
      
      {/* Section 3: Settings & Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings & Actions</Text>
        
        {renderSettingsCard(
          'Switch Role',
          `Current: ${user.role}`,
          () => setShowRoleSwitcher(true),
          '🔄'
        )}
        
        {renderSettingsCard(
          'Invite & Referrals',
          'Earn rewards for referrals',
          () => setShowReferralTracker(true),
          '🎁'
        )}
        
        <View style={[styles.settingsCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>🎨</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Theme</Text>
              <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>Light/Dark mode</Text>
            </View>
            <ThemeToggleButton />
          </View>
        </View>
        
        {renderSettingsCard(
          'Language',
          'App language settings',
          () => setShowLanguagePicker(true),
          '🌐'
        )}
        
        {renderSettingsCard(
          'Notification Settings',
          'Manage your notifications',
          () => NotificationService.openSettings(),
          '🔔'
        )}
        
        <TouchableOpacity style={[styles.logoutCard, { backgroundColor: '#ff4444' }]} onPress={handleLogout}>
          <View style={styles.cardContent}>
            <Text style={styles.cardIcon}>🚪</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: 'white' }]}>Log Out</Text>
              <Text style={[styles.cardSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Sign out of your account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Modals */}
      {showRatingsModal && (
        <MyRatingsTab
          ratings={ratings}
          averageRating={user.rating}
          totalRatings={ratings.length}
          onClose={() => setShowRatingsModal(false)}
        />
      )}
      
      {showPaymentModal && (
        <PaymentHistoryTab
          payments={payments}
          userId={user.id}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      
      {showRoleSwitcher && (
        <RoleSwitcher
          onClose={() => setShowRoleSwitcher(false)}
          onRoleChange={(role) => {
            setUser({ ...user, role });
            setShowRoleSwitcher(false);
          }}
        />
      )}
      
      {showReferralTracker && (
        <ReferralRewardTracker onClose={() => setShowReferralTracker(false)} />
      )}
      
      {showLanguagePicker && (
        <LanguagePicker onClose={() => setShowLanguagePicker(false)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutCard: {
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
});