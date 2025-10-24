import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ForumThreadCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  replies: number;
  likes: number;
  category: string;
  onPress: (id: string) => void;
  onLike: (id: string) => void;
}

export default function ForumThreadCard({
  id,
  title,
  content,
  author,
  time,
  replies,
  likes,
  category,
  onPress,
  onLike
}: ForumThreadCardProps) {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'machinery': return '#007AFF';
      case 'labor': return '#34C759';
      case 'safety': return '#FF3B30';
      case 'management': return '#FF9500';
      case 'materials': return '#AF52DE';
      default: return '#666';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(id)}>
      <View style={styles.header}>
        <Text style={[styles.category, { backgroundColor: getCategoryColor(category) + '20', color: getCategoryColor(category) }]}>
          {category}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content} numberOfLines={2}>{content}</Text>
      <Text style={styles.author}>by {author}</Text>
      
      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <Text style={styles.stats}>💬 {replies} replies</Text>
          <Text style={styles.stats}>👍 {likes} likes</Text>
        </View>
        
        <TouchableOpacity style={styles.likeButton} onPress={() => onLike(id)}>
          <Text style={styles.likeButtonText}>👍 Like</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  time: {
    fontSize: 12,
    color: '#666'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  author: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16
  },
  stats: {
    fontSize: 12,
    color: '#666'
  },
  likeButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  likeButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold'
  }
});