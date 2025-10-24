export interface NewsPost {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  category: 'platform_update' | 'industry_article' | 'progress_photo' | 'announcement';
  likes: number;
  comments: number;
  imageUrl?: string;
}

class NewsFeedService {
  private posts: NewsPost[] = [
    {
      id: '1',
      title: 'New Safety Protocols Announced',
      content: 'Updated safety guidelines for construction sites effective immediately. All contractors must comply with new PPE requirements and site inspection procedures.',
      author: 'Safety Department',
      time: '1 hour ago',
      category: 'announcement',
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      title: 'Construction Industry Growth Report Q4 2023',
      content: 'The construction sector shows remarkable 15% growth with positive outlook for 2024. Key drivers include infrastructure investments and residential demand.',
      author: 'Industry Insights',
      time: '3 hours ago',
      category: 'industry_article',
      likes: 45,
      comments: 12
    },
    {
      id: '3',
      title: 'Downtown Office Complex - Progress Update',
      content: 'Foundation work completed ahead of schedule. Steel frame installation begins next week. Great teamwork by all crews involved!',
      author: 'Metro Construction',
      time: '6 hours ago',
      category: 'progress_photo',
      likes: 67,
      comments: 23,
      imageUrl: 'https://example.com/construction-progress.jpg'
    },
    {
      id: '4',
      title: 'Platform Update: New Messaging Features',
      content: 'Introducing real-time chat with contractors and enhanced file sharing capabilities. Update your app to access these new features.',
      author: 'BuildConnect Team',
      time: '1 day ago',
      category: 'platform_update',
      likes: 89,
      comments: 34
    },
    {
      id: '5',
      title: 'Green Building Initiative Launch',
      content: 'City announces new incentives for sustainable construction practices. Tax credits available for LEED certified projects.',
      author: 'City Planning Department',
      time: '2 days ago',
      category: 'announcement',
      likes: 156,
      comments: 45
    }
  ];

  async getPosts(): Promise<NewsPost[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.posts].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }

  async createPost(title: string, content: string, category: string): Promise<NewsPost> {
    const newPost: NewsPost = {
      id: Date.now().toString(),
      title,
      content,
      author: 'Current User',
      time: 'Just now',
      category: category as NewsPost['category'],
      likes: 0,
      comments: 0
    };
    
    this.posts.unshift(newPost);
    return newPost;
  }

  async likePost(postId: string): Promise<void> {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.likes += 1;
    }
  }

  async commentOnPost(postId: string, comment: string): Promise<void> {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.comments += 1;
    }
  }

  async sharePost(postId: string): Promise<void> {
    // Mock share functionality
    console.log(`Sharing post ${postId}`);
  }
}

export default new NewsFeedService();