import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  category: 'platform_update' | 'industry_article' | 'progress_photo' | 'announcement';
  likes: number;
  comments: number;
  imageUrl?: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
}

export default function PostCard({
  id,
  title,
  content,
  author,
  time,
  category,
  likes,
  comments,
  imageUrl,
  onLike,
  onComment,
  onShare
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'platform_update': return '#007AFF';
      case 'industry_article': return '#34C759';
      case 'progress_photo': return '#FF9500';
      case 'announcement': return '#FF3B30';
      default: return '#666';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'platform_update': return 'Platform Update';
      case 'industry_article': return 'Industry Article';
      case 'progress_photo': return 'Progress Photo';
      case 'announcement': return 'Announcement';
      default: return 'Post';
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.category, { backgroundColor: getCategoryColor(category) + '20', color: getCategoryColor(category) }]}>
          {getCategoryLabel(category)}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
      
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
      
      <Text style={styles.author}>by {author}</Text>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {isLiked ? '❤️' : '👍'} {likes + (isLiked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => onComment(id)}>
          <Text style={styles.actionText}>💬 {comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => onShare(id)}>
          <Text style={styles.actionText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8
  },
  author: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12
  },
  actionButton: {
    flex: 1,
    alignItems: 'center'
  },
  actionText: {
    fontSize: 12,
    color: '#666'
  },
  likedText: {
    color: '#FF3B30'
  }
});