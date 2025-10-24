import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ResponsiveScrollView } from './ResponsiveScrollView';
import PostCard from './PostCard';
import SharePostModal from './SharePostModal';
import ForumThreadCard from './ForumThreadCard';
import ForumPostComposer from './ForumPostComposer';
import EventCard from './EventCard';
import EventFilterBar from './EventFilterBar';
import NewsFeedService from '../services/NewsFeedService';
import ForumService from '../services/ForumService';
import EventService from '../services/EventService';

type TabType = 'news' | 'forum' | 'events';

export default function CommunityPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showForumComposer, setShowForumComposer] = useState(false);
  const [posts, setPosts] = useState([]);
  const [threads, setThreads] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventFilters, setEventFilters] = useState({});

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newsPosts, forumThreads, eventsList] = await Promise.all([
        NewsFeedService.getPosts(),
        ForumService.getThreads(),
        EventService.getEvents()
      ]);
      setPosts(newsPosts);
      setThreads(forumThreads);
      setEvents(eventsList);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSharePost = async (content: string, category: string) => {
    try {
      await NewsFeedService.createPost('User Post', content, category);
      loadData();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleCreateThread = async (title: string, content: string, category: string) => {
    try {
      await ForumService.createThread(title, content, category);
      setShowForumComposer(false);
      loadData();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleEventRegister = async (eventId: string) => {
    try {
      await EventService.registerForEvent(eventId);
      loadData();
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const renderNewsTab = () => (
    <ResponsiveScrollView style={styles.tabContent}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          {...post}
          onLike={(id) => NewsFeedService.likePost(id)}
          onComment={(id) => console.log('Comment on', id)}
          onShare={(id) => NewsFeedService.sharePost(id)}
        />
      ))}
    </ResponsiveScrollView>
  );

  const renderForumTab = () => {
    if (showForumComposer) {
      return (
        <ForumPostComposer
          onSubmit={handleCreateThread}
          onCancel={() => setShowForumComposer(false)}
        />
      );
    }
    return (
      <ResponsiveScrollView style={styles.tabContent}>
        {threads.map((thread) => (
          <ForumThreadCard
            key={thread.id}
            {...thread}
            onPress={(id) => console.log('Open thread', id)}
            onLike={(id) => ForumService.likeThread(id)}
          />
        ))}
      </ResponsiveScrollView>
    );
  };

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <EventFilterBar onFilterChange={setEventFilters} />
      <ResponsiveScrollView>
        {events.map((event) => (
          <EventCard
            key={event.id}
            {...event}
            onRegister={handleEventRegister}
            onPress={(id) => console.log('Open event', id)}
          />
        ))}
      </ResponsiveScrollView>
    </View>
  );

  const renderFAB = () => {
    if (activeTab === 'events') return null;
    return (
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'news') setShowShareModal(true);
          if (activeTab === 'forum') setShowForumComposer(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
            📰 News Feed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forum' && styles.activeTab]}
          onPress={() => setActiveTab('forum')}
        >
          <Text style={[styles.tabText, activeTab === 'forum' && styles.activeTabText]}>
            💬 Forum
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            📅 Events
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'news' && renderNewsTab()}
        {activeTab === 'forum' && renderForumTab()}
        {activeTab === 'events' && renderEventsTab()}
      </View>
      
      {renderFAB()}
      
      <SharePostModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleSharePost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  content: { flex: 1 },
  tabContent: { flex: 1, padding: 16 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  fabText: { color: 'white', fontSize: 24, fontWeight: 'bold' }
});