import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface User {
  id: string;
  name: string;
  color: string;
  cursor: number;
  selection: { start: number; end: number };
}

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
}

export default function CollaborativeEditor({ 
  documentId, 
  initialContent, 
  onContentChange 
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`document:${documentId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as User[];
        setActiveUsers(users);
      })
      .on('broadcast', { event: 'content_change' }, ({ payload }) => {
        setContent(payload.content);
        onContentChange(payload.content);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const handleContentChange = (text: string) => {
    setContent(text);
    onContentChange(text);
    
    // Broadcast changes to other users
    supabase
      .channel(`document:${documentId}`)
      .send({
        type: 'broadcast',
        event: 'content_change',
        payload: { content: text }
      });
  };

  const updatePresence = (cursor: number) => {
    setCursorPosition(cursor);
    
    supabase
      .channel(`document:${documentId}`)
      .track({
        cursor,
        selection: { start: cursor, end: cursor },
        color: '#3B82F6'
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.presenceBar}>
        {activeUsers.map((user) => (
          <View key={user.id} style={[styles.userIndicator, { backgroundColor: user.color }]}>
            <Text style={styles.userName}>{user.name.charAt(0)}</Text>
          </View>
        ))}
      </View>
      
      <TextInput
        ref={textInputRef}
        style={styles.textInput}
        value={content}
        onChangeText={handleContentChange}
        onSelectionChange={(event) => {
          const { start } = event.nativeEvent.selection;
          updatePresence(start);
        }}
        multiline
        placeholder="Start typing..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  presenceBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});