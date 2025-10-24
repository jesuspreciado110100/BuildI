import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

interface ForumPost {
  id: string;
  author: string;
  title: string;
  content: string;
  time: string;
  replies: number;
  likes: number;
  category: string;
}

export default function ForumTab() {
  const [posts] = useState<ForumPost[]>([
    {
      id: '1',
      author: 'Alex Builder',
      title: 'Best concrete suppliers in downtown area?',
      content: 'Looking for reliable concrete suppliers with good pricing...',
      time: '2 hours ago',
      replies: 5,
      likes: 12,
      category: 'Materials'
    },
    {
      id: '2',
      author: 'Maria Contractor',
      title: 'New safety regulations - need advice',
      content: 'Has anyone dealt with the new OSHA requirements?',
      time: '5 hours ago',
      replies: 8,
      likes: 15,
      category: 'Safety'
    },
    {
      id: '3',
      author: 'Tom Engineer',
      title: 'Project management tips for large builds',
      content: 'Sharing some strategies that helped me...',
      time: '1 day ago',
      replies: 12,
      likes: 25,
      category: 'Management'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search forums..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content}>
        {filteredPosts.map((post) => (
          <TouchableOpacity key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postCategory}>{post.category}</Text>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            <Text style={styles.postAuthor}>by {post.author}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.postStats}>💬 {post.replies} replies</Text>
              <Text style={styles.postStats}>👍 {post.likes} likes</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, backgroundColor: 'white' },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14 },
  content: { flex: 1, padding: 16 },
  postCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  postCategory: { fontSize: 12, color: '#007AFF', fontWeight: 'bold', backgroundColor: '#f0f8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  postTime: { fontSize: 12, color: '#666' },
  postTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  postContent: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  postAuthor: { fontSize: 12, color: '#999', marginBottom: 8 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  postStats: { fontSize: 12, color: '#666' }
});