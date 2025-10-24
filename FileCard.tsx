import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { fileShareService } from '../services/FileShareService';
import { SharedFile, Comment } from '../types';

interface FileCardProps {
  file: SharedFile;
  currentUserId: string;
  onFileDeleted?: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  currentUserId,
  onFileDeleted
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [file.id]);

  const loadComments = async () => {
    try {
      const fileComments = await fileShareService.getCommentsByFile(file.id);
      setComments(fileComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await fileShareService.addComment({
        file_id: file.id,
        user_id: currentUserId,
        text: newComment.trim()
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fileShareService.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleDeleteFile = async () => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fileShareService.deleteFile(file.id);
              onFileDeleted?.(file.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.fileName}>{file.name}</Text>
        <TouchableOpacity onPress={handleDeleteFile} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.uploadDate}>
        Uploaded: {new Date(file.upload_date).toLocaleDateString()}
      </Text>
      
      {file.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {file.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
        
        <ScrollView style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentText}>{comment.text}</Text>
              <View style={styles.commentFooter}>
                <Text style={styles.commentTime}>
                  {new Date(comment.timestamp).toLocaleString()}
                </Text>
                {comment.user_id === currentUserId && (
                  <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                    <Text style={styles.deleteCommentText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.addCommentSection}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.addCommentButton, loading && styles.addCommentButtonDisabled]}
            onPress={handleAddComment}
            disabled={loading || !newComment.trim()}
          >
            <Text style={styles.addCommentButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#495057',
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  comment: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  deleteCommentText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    maxHeight: 80,
  },
  addCommentButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addCommentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addCommentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});