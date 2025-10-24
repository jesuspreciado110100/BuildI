import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ReferralService } from '../services/ReferralService';

interface ReferralRewardTrackerProps {
  onClose: () => void;
}

export default function ReferralRewardTracker({ onClose }: ReferralRewardTrackerProps) {
  const { theme } = useTheme();
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({
    total_referrals: 0,
    successful_referrals: 0,
    total_credits_earned: 0,
    referral_history: []
  });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const referralService = ReferralService.getInstance();
      const link = await referralService.generateReferralLink('contractor1');
      const referralStats = await referralService.getReferralStats('contractor1');
      setReferralLink(link);
      setStats(referralStats);
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Referral Rewards</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={[styles.statsCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.total_referrals}</Text>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Total Referrals</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: theme.success }]}>{stats.successful_referrals}</Text>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Successful</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: theme.warning }]}>${stats.total_credits_earned}</Text>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Credits Earned</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.linkCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Your Referral Link</Text>
            <Text style={[styles.linkText, { color: theme.secondaryText }]}>{referralLink}</Text>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.shareButtonText}>Share Link</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.historyCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Referral History</Text>
            {stats.referral_history.map((item: any, index: number) => (
              <View key={index} style={styles.historyItem}>
                <Text style={[styles.historyName, { color: theme.text }]}>{item.referred_user_name}</Text>
                <Text style={[styles.historyRole, { color: theme.secondaryText }]}>{item.referred_user_role}</Text>
                <Text style={[styles.historyReward, { color: theme.success }]}>
                  {item.reward_earned ? `$${item.reward_earned}` : 'Pending'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  linkCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  historyRole: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  historyReward: {
    fontSize: 14,
    fontWeight: '600',
  },
});