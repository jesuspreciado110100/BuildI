import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { chatService } from '../services/ChatService';
import { notificationService } from '../services/NotificationService';
import { Message } from '../types';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  onClose,
  requestId,
  currentUserId,
  otherUserId,
  otherUserName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadMessages();
    }
  }, [visible, requestId]);

  const loadMessages = () => {
    const chatMessages = chatService.getMessagesByRequest(requestId);
    setMessages(chatMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const message = chatService.sendMessage({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        request_id: requestId,
        content: newMessage.trim(),
        message_type: 'text'
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Send notification to other user
      notificationService.triggerChatNotification(
        otherUserId,
        'You',
        requestId
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === currentUserId;
    
    return (
      <View
        key={message.id}
        style={{
          alignSelf: isOwn ? 'flex-end' : 'flex-start',
          backgroundColor: isOwn ? '#007AFF' : '#E5E5EA',
          padding: 12,
          borderRadius: 18,
          marginVertical: 2,
          maxWidth: '80%'
        }}
      >
        <Text style={{ color: isOwn ? 'white' : 'black' }}>
          {message.content}
        </Text>
        <Text style={{ 
          color: isOwn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', 
          fontSize: 12, 
          marginTop: 4 
        }}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <View style={{
        backgroundColor: 'white',
        width: '90%',
        height: '70%',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#007AFF',
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            Chat with {otherUserName}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: 'white', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input */}
        <View style={{
          flexDirection: 'row',
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA'
        }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#E5E5EA',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8
            }}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={isLoading || !newMessage.trim()}
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};