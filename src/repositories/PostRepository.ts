import { Post } from '../models/Post';
import { Server } from '../Server';
import { DatabaseService } from '../services/DatabaseService';

export class PostRepository {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = Server.dbService;
  }

  /**
   * Create a new post in the database
   * @param post Post data to create
   * @returns Created post with ID
   */
  async create(post: Omit<Post, 'id'>): Promise<Post> {
    try {
      const query = `
        INSERT INTO "Posts" (title, "userId", content, type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, "userId", content, type;
      `;
      const values = [post.title, post.userId, post.content, post.type];
      const result = await this.dbService.query<Post>(query, values);

      if (result.rows.length === 0) {
        throw new Error('Failed to create post');
      }

      const postData = result.rows[0];
      return new Post(
        postData.id,
        postData.title,
        postData.userId,
        postData.content,
        postData.type
      );
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Find post by ID
   * @param id Post ID
   * @returns Post if found, null otherwise
   */
  async findById(id: number): Promise<Post | null> {
    try {
      const query = `
        SELECT id, title, "userId", content, type
        FROM "Posts"
        WHERE id = $1;
      `;
      const result = await this.dbService.query<Post>(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const postData = result.rows[0];
      return new Post(
        postData.id,
        postData.title,
        postData.userId,
        postData.content,
        postData.type
      );
    } catch (error) {
      console.error('Error finding post by ID:', error);
      throw error;
    }
  }

  /**
   * Find posts by user ID
   * @param userId User ID
   * @returns Array of posts
   */
  async findByUserId(userId: number): Promise<Post[]> {
    try {
      const query = `
        SELECT id, title, "userId", content, type
        FROM "Posts"
        WHERE "userId" = $1
        ORDER BY id DESC;
      `;
      const result = await this.dbService.query<Post>(query, [userId]);

      return result.rows.map(postData => new Post(
        postData.id,
        postData.title,
        postData.userId,
        postData.content,
        postData.type
      ));
    } catch (error) {
      console.error('Error finding posts by user ID:', error);
      throw error;
    }
  }

  /**
   * Find all posts with optional filtering
   * @param filters Optional filters for the query
   * @returns Array of posts
   */
  async findAll(filters?: { title?: string, type?: 'text' | 'video', limit?: number, offset?: number }): Promise<Post[]> {
    try {
      let query = `
        SELECT id, title, "userId", content, type
        FROM "Posts"
      `;

      const values: any[] = [];
      let paramCounter = 1;
      const conditions: string[] = [];

      if (filters?.title) {
        conditions.push(`title ILIKE $${paramCounter}`);
        values.push(`%${filters.title}%`);
        paramCounter++;
      }

      if (filters?.type) {
        conditions.push(`type = $${paramCounter}`);
        values.push(filters.type);
        paramCounter++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY id DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${paramCounter}`;
        values.push(filters.limit);
        paramCounter++;

        if (filters?.offset) {
          query += ` OFFSET $${paramCounter}`;
          values.push(filters.offset);
        }
      }

      const result = await this.dbService.query<Post>(query, values);

      return result.rows.map(postData => new Post(
        postData.id,
        postData.title,
        postData.userId,
        postData.content,
        postData.type
      ));
    } catch (error) {
      console.error('Error finding all posts:', error);
      throw error;
    }
  }

  /**
   * Update an existing post
   * @param id Post ID to update
   * @param postData Post data to update
   * @returns Updated post
   */
  async update(id: number, postData: Partial<Omit<Post, 'id'>>): Promise<Post | null> {
    try {
      // Build the SET part of the query dynamically based on the fields being updated
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (postData.title !== undefined) {
        updateFields.push(`title = $${paramCounter++}`);
        values.push(postData.title);
      }

      if (postData.userId !== undefined) {
        updateFields.push(`"userId" = $${paramCounter++}`);
        values.push(postData.userId);
      }

      if (postData.content !== undefined) {
        updateFields.push(`content = $${paramCounter++}`);
        values.push(postData.content);
      }

      if (postData.type !== undefined) {
        updateFields.push(`type = $${paramCounter++}`);
        values.push(postData.type);
      }

      if (updateFields.length === 0) {
        return this.findById(id); // Nothing to update
      }

      // Add the ID to the parameters
      values.push(id);

      const query = `
        UPDATE "Posts"
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING id, title, "userId", content, type;
      `;

      const result = await this.dbService.query<Post>(query, values);

      if (result.rows.length === 0) {
        return null; // Post not found
      }

      const updatedPostData = result.rows[0];
      return new Post(
        updatedPostData.id,
        updatedPostData.title,
        updatedPostData.userId,
        updatedPostData.content,
        updatedPostData.type
      );
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * Delete a post by ID
   * @param id Post ID
   * @returns true if deleted successfully, false if post not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        DELETE FROM "Posts"
        WHERE id = $1
        RETURNING id;
      `;

      const result = await this.dbService.query(query, [id]);
      if (!result.rowCount) {
        return false;
      }
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
}

export default PostRepository;
