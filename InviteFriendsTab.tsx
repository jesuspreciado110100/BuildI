import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, FlatList, Alert } from 'react-native';
import { referralService } from '../services/ReferralService';
import { notificationService } from '../services/NotificationService';
import { ReferralStats, ReferralHistoryItem } from '../types';

interface InviteFriendsTabProps {
  userId: string;
  userRole: string;
}

export const InviteFriendsTab: React.FC<InviteFriendsTabProps> = ({ userId, userRole }) => {
  const [referralLink, setReferralLink] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    try {
      const [link, referralStats] = await Promise.all([
        referralService.generateReferralLink(userId),
        referralService.getReferralStats(userId)
      ]);
      setReferralLink(link);
      setStats(referralStats);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on ConstructionOps! Use my referral link to get started: ${referralLink}`,
        url: referralLink,
        title: 'Join ConstructionOps'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyToClipboard = () => {
    // In a real app, would use Clipboard API
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const renderReferralItem = ({ item }: { item: ReferralHistoryItem }) => (
    <View style={styles.referralItem}>
      <View style={styles.referralInfo}>
        <Text style={styles.referralName}>{item.referred_user_name}</Text>
        <Text style={styles.referralRole}>{item.referred_user_role.replace('_', ' ')}</Text>
        <Text style={styles.referralDate}>{new Date(item.signup_date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.referralStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.replace('_', ' ')}
        </Text>
        {item.reward_earned && (
          <Text style={styles.rewardText}>${item.reward_earned}</Text>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed_first_action': return '#4CAF50';
      case 'active': return '#2196F3';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading referral data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invite Friends & Earn Rewards</Text>
        <Text style={styles.subtitle}>Earn $25 when your invite completes their first job</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.total_referrals || 0}</Text>
          <Text style={styles.statLabel}>Total Invites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.successful_referrals || 0}</Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${stats?.total_credits_earned || 0}</Text>
          <Text style={styles.statLabel}>Credits Earned</Text>
        </View>
      </View>

      <View style={styles.linkContainer}>
        <Text style={styles.linkLabel}>Your Referral Link:</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Referral History</Text>
        <FlatList
          data={stats?.referral_history || []}
          renderItem={renderReferralItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  linkContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginRight: 12
  },
  copyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  historyContainer: {
    flex: 1
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  referralItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  referralInfo: {
    flex: 1
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  referralRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 2
  },
  referralDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  referralStatus: {
    alignItems: 'flex-end'
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4
  }
});