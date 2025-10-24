import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  position: { line: number; column: number };
  is_resolved: boolean;
  created_at: string;
  thread_id?: string;
}

interface DocumentCommentsProps {
  documentId: string;
  selectedPosition?: { line: number; column: number };
}

export default function DocumentComments({ 
  documentId, 
  selectedPosition 
}: DocumentCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  useEffect(() => {
    loadComments();
    
    // Subscribe to real-time comment updates
    const channel = supabase
      .channel(`comments:${documentId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'document_comments' },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data || []);
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPosition) return;

    const { error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        content: newComment.trim(),
        position: selectedPosition,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    setNewComment('');
    setShowCommentBox(false);
  };

  const resolveComment = async (commentId: string) => {
    const { error } = await supabase
      .from('document_comments')
      .update({ is_resolved: true })
      .eq('id', commentId);

    if (error) {
      console.error('Error resolving comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments</Text>
        {selectedPosition && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCommentBox(true)}
          >
            <Text style={styles.addButtonText}>+ Add Comment</Text>
          </TouchableOpacity>
        )}
      </View>

      {showCommentBox && (
        <View style={styles.commentBox}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add your comment..."
            multiline
          />
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowCommentBox(false);
                setNewComment('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={addComment}
            >
              <Text style={styles.submitButtonText}>Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.commentsList}>
        {comments.map((comment) => (
          <View 
            key={comment.id} 
            style={[
              styles.commentItem,
              comment.is_resolved && styles.resolvedComment
            ]}
          >
            <View style={styles.commentHeader}>
              <Text style={styles.commentPosition}>
                Line {comment.position.line}, Col {comment.position.column}
              </Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.commentContent}>{comment.content}</Text>
            
            {!comment.is_resolved && (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => resolveComment(comment.id)}
              >
                <Text style={styles.resolveButtonText}>Resolve</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  commentBox: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  resolvedComment: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentPosition: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 12,
  },
  resolveButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});