export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  replies: number;
  likes: number;
  category: string;
}

class ForumService {
  private threads: ForumThread[] = [
    {
      id: '1',
      title: 'Best concrete suppliers in downtown area?',
      content: 'Looking for reliable concrete suppliers with good pricing and delivery options...',
      author: 'Alex Builder',
      time: '2 hours ago',
      replies: 5,
      likes: 12,
      category: 'Materials'
    },
    {
      id: '2',
      title: 'New safety regulations - need advice',
      content: 'Has anyone dealt with the new OSHA requirements for fall protection?',
      author: 'Maria Contractor',
      time: '5 hours ago',
      replies: 8,
      likes: 15,
      category: 'Safety'
    },
    {
      id: '3',
      title: 'Excavator rental recommendations',
      content: 'Need a reliable excavator for a 2-week project. Any suggestions?',
      author: 'Tom Engineer',
      time: '1 day ago',
      replies: 12,
      likes: 25,
      category: 'Machinery'
    }
  ];

  async getThreads(): Promise<ForumThread[]> {
    return [...this.threads];
  }

  async createThread(title: string, content: string, category: string): Promise<ForumThread> {
    const newThread: ForumThread = {
      id: Date.now().toString(),
      title,
      content,
      author: 'Current User',
      time: 'Just now',
      replies: 0,
      likes: 0,
      category
    };
    this.threads.unshift(newThread);
    return newThread;
  }

  async likeThread(threadId: string): Promise<void> {
    const thread = this.threads.find(t => t.id === threadId);
    if (thread) thread.likes += 1;
  }
}

export default new ForumService();