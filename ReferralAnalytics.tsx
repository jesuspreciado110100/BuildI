import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { referralService } from '../services/ReferralService';

interface LeaderboardItem {
  id: string;
  user_name: string;
  user_role: string;
  total_referrals: number;
  successful_referrals: number;
  credits_earned: number;
  rank: number;
}

interface RoleBreakdown {
  role: string;
  count: number;
  percentage: number;
}

interface ReferralAnalyticsProps {
  userId: string;
}

export const ReferralAnalytics: React.FC<ReferralAnalyticsProps> = ({ userId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<RoleBreakdown[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'contractor' | 'labor_chief' | 'machinery_renter'>('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedFilter]);

  const loadAnalyticsData = async () => {
    // Mock leaderboard data
    const mockLeaderboard: LeaderboardItem[] = [
      {
        id: '1',
        user_name: 'John Smith',
        user_role: 'contractor',
        total_referrals: 12,
        successful_referrals: 8,
        credits_earned: 200,
        rank: 1
      },
      {
        id: '2',
        user_name: 'Maria Rodriguez',
        user_role: 'labor_chief',
        total_referrals: 10,
        successful_referrals: 7,
        credits_earned: 175,
        rank: 2
      },
      {
        id: '3',
        user_name: 'David Chen',
        user_role: 'machinery_renter',
        total_referrals: 8,
        successful_referrals: 6,
        credits_earned: 150,
        rank: 3
      },
      {
        id: '4',
        user_name: 'Sarah Johnson',
        user_role: 'contractor',
        total_referrals: 7,
        successful_referrals: 5,
        credits_earned: 125,
        rank: 4
      },
      {
        id: '5',
        user_name: 'Mike Wilson',
        user_role: 'labor_chief',
        total_referrals: 6,
        successful_referrals: 4,
        credits_earned: 100,
        rank: 5
      }
    ];

    // Mock role breakdown data
    const mockRoleBreakdown: RoleBreakdown[] = [
      { role: 'contractor', count: 25, percentage: 45 },
      { role: 'labor_chief', count: 18, percentage: 32 },
      { role: 'machinery_renter', count: 8, percentage: 14 },
      { role: 'material_supplier', count: 5, percentage: 9 }
    ];

    // Filter leaderboard based on selected filter
    const filteredLeaderboard = selectedFilter === 'all' 
      ? mockLeaderboard 
      : mockLeaderboard.filter(item => item.user_role === selectedFilter);

    setLeaderboard(filteredLeaderboard);
    setRoleBreakdown(mockRoleBreakdown);
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardItem }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.userRole}>{item.user_role.replace('_', ' ')}</Text>
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>{item.total_referrals} invites</Text>
        <Text style={styles.statText}>{item.successful_referrals} successful</Text>
        <Text style={styles.creditsText}>${item.credits_earned}</Text>
      </View>
    </View>
  );

  const renderRoleBreakdown = ({ item }: { item: RoleBreakdown }) => (
    <View style={styles.roleItem}>
      <View style={styles.roleInfo}>
        <Text style={styles.roleName}>{item.role.replace('_', ' ')}</Text>
        <Text style={styles.roleCount}>{item.count} referrals</Text>
      </View>
      <View style={styles.percentageContainer}>
        <Text style={styles.percentageText}>{item.percentage}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.percentage}%` }]} />
        </View>
      </View>
    </View>
  );

  const filterButtons = [
    { key: 'all', label: 'All Roles' },
    { key: 'contractor', label: 'Contractors' },
    { key: 'labor_chief', label: 'Labor Chiefs' },
    { key: 'machinery_renter', label: 'Machinery Renters' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Referral Analytics</Text>
        <Text style={styles.subtitle}>Top performers and role breakdown</Text>
      </View>

      <View style={styles.filterContainer}>
        {filterButtons.map(button => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.filterButton,
              selectedFilter === button.key && styles.activeFilterButton
            ]}
            onPress={() => setSelectedFilter(button.key as any)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === button.key && styles.activeFilterButtonText
            ]}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Inviters</Text>
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.leaderboardList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referrals by Role</Text>
        <FlatList
          data={roleBreakdown}
          renderItem={renderRoleBreakdown}
          keyExtractor={(item) => item.role}
          showsVerticalScrollIndicator={false}
          style={styles.roleList}
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap'
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3'
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666'
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  leaderboardList: {
    maxHeight: 300
  },
  leaderboardItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    marginTop: 2
  },
  statsContainer: {
    alignItems: 'flex-end'
  },
  statText: {
    fontSize: 12,
    color: '#666'
  },
  creditsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4
  },
  roleList: {
    maxHeight: 200
  },
  roleItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  roleInfo: {
    flex: 1
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize'
  },
  roleCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  percentageContainer: {
    alignItems: 'flex-end',
    minWidth: 80
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2
  }
});