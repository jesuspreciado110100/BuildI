import { Message, ChatRoom } from '../types';

class ChatServiceClass {
  private messages: Message[] = [];
  private chatRooms: ChatRoom[] = [];
  private listeners: ((messages: Message[]) => void)[] = [];

  constructor() {
    // Mock data for demonstration
    this.chatRooms = [
      {
        id: 'room1',
        request_id: 'req1',
        participants: ['contractor1', 'labor_chief1']
      }
    ];

    this.messages = [
      {
        id: 'msg1',
        sender_id: 'contractor1',
        receiver_id: 'labor_chief1',
        request_id: 'req1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        content: 'Hi, can we discuss the timeline for the foundation work?',
        message_type: 'text'
      },
      {
        id: 'msg2',
        sender_id: 'labor_chief1',
        receiver_id: 'contractor1',
        request_id: 'req1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        content: 'Sure! We can start Monday and should finish by Wednesday.',
        message_type: 'text'
      }
    ];
  }

  getMessagesByRequest(requestId: string): Message[] {
    return this.messages
      .filter(m => m.request_id === requestId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(newMessage);
    this.notifyListeners();
    
    return newMessage;
  }

  getChatRoom(requestId: string): ChatRoom | undefined {
    return this.chatRooms.find(room => room.request_id === requestId);
  }

  createChatRoom(requestId: string, contractorId: string, laborChiefId: string): ChatRoom {
    const existingRoom = this.getChatRoom(requestId);
    if (existingRoom) {
      return existingRoom;
    }

    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      request_id: requestId,
      participants: [contractorId, laborChiefId]
    };

    this.chatRooms.push(newRoom);
    return newRoom;
  }

  // Real-time updates simulation
  subscribe(callback: (messages: Message[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.messages));
  }

  // Get recent messages for a user across all chats
  getRecentMessages(userId: string, limit: number = 10): Message[] {
    return this.messages
      .filter(m => m.sender_id === userId || m.receiver_id === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Get unread message count for a user
  getUnreadCount(userId: string, requestId: string): number {
    return this.messages.filter(m => 
      m.request_id === requestId && 
      m.receiver_id === userId
    ).length;
  }
}

export const chatService = new ChatServiceClass();