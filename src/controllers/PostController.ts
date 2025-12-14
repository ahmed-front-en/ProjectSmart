import { Request, Response } from 'express';
import { Post } from '../models/Post';
import PostRepository from '../repositories/PostRepository';
import UserRepository from '../repositories/UserRepository';

export class PostController {
  private postRepository: PostRepository;
  private userRepository: UserRepository;

  constructor() {
    this.postRepository = new PostRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Get all posts with optional filtering
   * @route GET /api/posts
   */
  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        title: req.query.title as string | undefined,
        type: req.query.type as 'text' | 'video' | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const posts = await this.postRepository.findAll(filters);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Failed to get posts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get post by ID
   * @route GET /api/posts/:id
   */
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid post ID' });
        return;
      }

      const post = await this.postRepository.findById(id);

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      res.status(200).json(post);
    } catch (error) {
      console.error('Failed to get post by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get posts by user ID
   * @route GET /api/users/:userId/posts
   */
  async getPostsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({ message: 'Invalid user ID' });
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const posts = await this.postRepository.findByUserId(userId);
      res.status(200).json(posts);
    } catch (error) {
      console.error('Failed to get posts by user ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Create a new post
   * @route POST /api/posts
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { title, userId, content, type } = req.body;

      // Basic validation
      if (!title || !userId || !content || !type) {
        res.status(400).json({ message: 'Title, userId, content, and type are required' });
        return;
      }

      // Check if type is valid
      if (type !== 'text' && type !== 'video') {
        res.status(400).json({ message: 'Type must be either "text" or "video"' });
        return;
      }

      // Check if user exists
      const user = await this.userRepository.findById(parseInt(userId));
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const postData: Omit<Post, 'id'> = {
        title,
        userId: parseInt(userId),
        content,
        type: type as 'text' | 'video'
      };

      const newPost = await this.postRepository.create(postData);
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Failed to create post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update an existing post
   * @route PUT /api/posts/:id
   */
  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid post ID' });
        return;
      }

      // Check if post exists
      const existingPost = await this.postRepository.findById(id);
      if (!existingPost) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      const { title, userId, content, type } = req.body;

      // If userId is being updated, check if the user exists
      if (userId !== undefined && userId !== existingPost.userId) {
        const user = await this.userRepository.findById(parseInt(userId));
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }
      }

      // Check if type is valid when updating
      if (type !== undefined && type !== 'text' && type !== 'video') {
        res.status(400).json({ message: 'Type must be either "text" or "video"' });
        return;
      }

      const postData: Partial<Omit<Post, 'id'>> = {};

      if (title !== undefined) postData.title = title;
      if (userId !== undefined) postData.userId = parseInt(userId);
      if (content !== undefined) postData.content = content;
      if (type !== undefined) postData.type = type as 'text' | 'video';

      const updatedPost = await this.postRepository.update(id, postData);
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Failed to update post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete a post
   * @route DELETE /api/posts/:id
   */
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid post ID' });
        return;
      }

      const deleted = await this.postRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      res.status(204).end();
    } catch (error) {
      console.error('Failed to delete post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default PostController;
