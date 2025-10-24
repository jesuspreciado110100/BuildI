import { SharedFile, Comment } from '../types';

class FileShareService {
  private files: SharedFile[] = [];
  private comments: Comment[] = [];

  // Mock file upload
  async uploadFile(file: {
    site_id: string;
    uploader_id: string;
    name: string;
    tags: string[];
  }): Promise<SharedFile> {
    const newFile: SharedFile = {
      id: Date.now().toString(),
      site_id: file.site_id,
      uploader_id: file.uploader_id,
      name: file.name,
      file_url: `https://mock-storage.com/files/${Date.now()}-${file.name}`,
      upload_date: new Date().toISOString(),
      tags: file.tags
    };
    
    this.files.push(newFile);
    return newFile;
  }

  // Get files for a site
  async getFilesBySite(siteId: string): Promise<SharedFile[]> {
    return this.files.filter(file => file.site_id === siteId);
  }

  // Get all files
  async getAllFiles(): Promise<SharedFile[]> {
    return [...this.files];
  }

  // Add comment to file
  async addComment(comment: {
    file_id: string;
    user_id: string;
    text: string;
  }): Promise<Comment> {
    const newComment: Comment = {
      id: Date.now().toString(),
      file_id: comment.file_id,
      user_id: comment.user_id,
      text: comment.text,
      timestamp: new Date().toISOString()
    };
    
    this.comments.push(newComment);
    return newComment;
  }

  // Get comments for a file
  async getCommentsByFile(fileId: string): Promise<Comment[]> {
    return this.comments.filter(comment => comment.file_id === fileId);
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<boolean> {
    const index = this.comments.findIndex(comment => comment.id === commentId);
    if (index > -1) {
      this.comments.splice(index, 1);
      return true;
    }
    return false;
  }

  // Delete file
  async deleteFile(fileId: string): Promise<boolean> {
    const index = this.files.findIndex(file => file.id === fileId);
    if (index > -1) {
      this.files.splice(index, 1);
      // Also delete associated comments
      this.comments = this.comments.filter(comment => comment.file_id !== fileId);
      return true;
    }
    return false;
  }
}

export const fileShareService = new FileShareService();