import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  time: string;
  category: 'announcement' | 'job_posting' | 'industry_news' | 'company_update';
  likes: number;
  comments: number;
  imageUrl?: string;
}

export default function NewsFeedTab() {
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'New Safety Protocols Announced',
      summary: 'Updated safety guidelines for construction sites effective immediately...',
      author: 'Safety Department',
      time: '1 hour ago',
      category: 'announcement',
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      title: 'Large Commercial Project - Seeking Contractors',
      summary: 'Downtown office complex project looking for experienced contractors...',
      author: 'Metro Construction',
      time: '3 hours ago',
      category: 'job_posting',
      likes: 45,
      comments: 12
    },
    {
      id: '3',
      title: 'Construction Industry Growth Report',
      summary: 'Q4 2023 shows 15% growth in construction sector with positive outlook...',
      author: 'Industry Insights',
      time: '6 hours ago',
      category: 'industry_news',
      likes: 18,
      comments: 5
    },
    {
      id: '4',
      title: 'BuildCorp Expands Operations',
      summary: 'Local construction company announces expansion into three new markets...',
      author: 'BuildCorp News',
      time: '1 day ago',
      category: 'company_update',
      likes: 32,
      comments: 15
    },
    {
      id: '5',
      title: 'Green Building Initiative Launch',
      summary: 'City announces new incentives for sustainable construction practices...',
      author: 'City Planning',
      time: '2 days ago',
      category: 'announcement',
      likes: 67,
      comments: 23
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return '#FF3B30';
      case 'job_posting': return '#34C759';
      case 'industry_news': return '#007AFF';
      case 'company_update': return '#FF9500';
      default: return '#666';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'announcement': return 'Announcement';
      case 'job_posting': return 'Job Posting';
      case 'industry_news': return 'Industry News';
      case 'company_update': return 'Company Update';
      default: return 'News';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {newsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.newsCard}>
            <View style={styles.newsHeader}>
              <Text style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) + '20', color: getCategoryColor(item.category) }]}>
                {getCategoryLabel(item.category)}
              </Text>
              <Text style={styles.newsTime}>{item.time}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsSummary}>{item.summary}</Text>
            <Text style={styles.newsAuthor}>by {item.author}</Text>
            <View style={styles.newsFooter}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>👍 {item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>💬 {item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>📤 Share</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  newsCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryTag: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  newsTime: { fontSize: 12, color: '#666' },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  newsSummary: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  newsAuthor: { fontSize: 12, color: '#999', marginBottom: 12 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  actionButton: { flex: 1, alignItems: 'center' },
  actionText: { fontSize: 12, color: '#666' }
});