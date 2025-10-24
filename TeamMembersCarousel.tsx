import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  siteId: string;
  siteName: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

interface TeamMembersCarouselProps {
  onMemberPress: (siteId: string, siteName: string, memberId: string) => void;
}


const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Site Manager',
    siteId: 'site1',
    siteName: 'Downtown Plaza'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Foreman',
    siteId: 'site2',
    siteName: 'Harbor Bridge'
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'Safety Officer',
    siteId: 'site1',
    siteName: 'Downtown Plaza'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    role: 'Project Engineer',
    siteId: 'site3',
    siteName: 'Metro Station'
  }
];

export default function TeamMembersCarousel({ onMemberPress }: TeamMembersCarouselProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Members</Text>
      <ScrollView
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockTeamMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            onPress={() => onMemberPress(member.siteId, member.siteName, member.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.memberName} numberOfLines={1}>
              {member.name}
            </Text>
            <Text style={styles.memberRole} numberOfLines={1}>
              {member.role}
            </Text>
            <Text style={styles.siteName} numberOfLines={1}>
              {member.siteName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#1F2937',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  memberCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  siteName: {
    fontSize: 11,
    color: '#3B82F6',
    textAlign: 'center',
    fontWeight: '500',
  },
});