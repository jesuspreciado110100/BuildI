import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { DocumentComment } from '../services/CollaborationService';

interface CommentThreadProps {
  comments: DocumentComment[];
  onReply: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, onReply }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const topLevelComments = comments.filter(comment => !comment.parent_id);

  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parent_id === parentId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    try {
      // Implementation would call CollaborationService.addComment with parent_id
      setReplyText('');
      setReplyingTo(null);
      onReply();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const renderComment = (comment: DocumentComment, isReply = false) => (
    <View key={comment.id} style={[styles.comment, isReply && styles.reply]}>
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          {comment.user_avatar ? (
            <Image source={{ uri: comment.user_avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {comment.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{comment.user_name}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(comment.created_at)}</Text>
          </View>
        </View>
        
        {comment.resolved && (
          <View style={styles.resolvedBadge}>
            <Text style={styles.resolvedText}>✓ Resolved</Text>
          </View>
        )}
      </View>

      <Text style={styles.commentContent}>{comment.content}</Text>

      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setReplyingTo(comment.id)}
        >
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
        
        {!comment.resolved && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Resolve</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <View style={styles.replyInput}>
          <TextInput
            style={styles.replyTextInput}
            placeholder="Write a reply..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <View style={styles.replyActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Replies */}
      {getReplies(comment.id).map(reply => renderComment(reply, true))}
    </View>
  );

  return (
    <View style={styles.container}>
      {topLevelComments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No comments yet</Text>
          <Text style={styles.emptySubtext}>
            Click on the document to add the first comment
          </Text>
        </View>
      ) : (
        topLevelComments.map(comment => renderComment(comment))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  comment: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  reply: {
    marginLeft: 20,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderLeftColor: '#9ca3af',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  resolvedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  resolvedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  commentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  replyInput: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  replyTextInput: {
    fontSize: 14,
    color: '#374151',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 14,
    color: '#6b7280',
  },
  replyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  replyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});