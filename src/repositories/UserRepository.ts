import { User } from '../models/User';
import { Server } from '../Server';
import { DatabaseService } from '../services/DatabaseService';

export class UserRepository {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = Server.dbService;
  }

  /**
   * Create a new user in the database
   * @param user User data to create
   * @returns Created user with ID
   */
  async create(user: Omit<User, 'id'>): Promise<User> {
    try {
      const query = `
        INSERT INTO "Users" (name, email, age, description, image)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, age, description, image;
      `;
      const values = [user.name, user.email, user.age, user.description, user.image];
      const result = await this.dbService.query<User>(query, values);

      if (result.rows.length === 0) {
        throw new Error('Failed to create user');
      }

      const userData = result.rows[0];
      return new User(
        userData.id,
        userData.name,
        userData.email,
        userData.age,
        userData.description,
        userData.image
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param id User ID
   * @param showPosts Whether to include user's posts
   * @returns User if found, null otherwise
   */
  async findById(id: number, showPosts: boolean = false): Promise<User | null> {
    try {
      if (!showPosts) {
        // Standard query without posts
        const query = `
          SELECT id, name, email, age, description, image
          FROM "Users"
          WHERE id = $1;
        `;
        const result = await this.dbService.query<User>(query, [id]);

        if (result.rows.length === 0) {
          return null;
        }

        const userData = result.rows[0];
        return new User(
          userData.id,
          userData.name,
          userData.email,
          userData.age,
          userData.description,
          userData.image
        );
      } else {
        // Query with posts included
        const query = `
          SELECT
            u.id, u.name, u.email, u.age, u.description, u.image,
            p.id as post_id, p.title as post_title, p.content as post_content,
            p.type as post_type
          FROM "Users" u
          LEFT JOIN "Posts" p ON u.id = p."userId"
          WHERE u.id = $1
          ORDER BY p.id;
        `;

        const result = await this.dbService.query(query, [id]);

        if (result.rows.length === 0) {
          return null;
        }

        // Create the user object
        const userData = result.rows[0];
        const user = new User(
          userData.id,
          userData.name,
          userData.email,
          userData.age,
          userData.description,
          userData.image
        );

        console.log(userData)

        // Add posts to the user object if they exist
        if (userData.post_id) {
          const posts: any[] = [];
          result.rows.forEach(row => {
            if (row.post_id) {
              posts.push({
                id: row.post_id,
                title: row.post_title,
                content: row.post_content,
                type: row.post_type,
                userId: userData.id
              });
            }
          });

          // Add posts to the user object
          (user as User).posts = posts;
        } else {
          // User has no posts
          (user as User).posts = [];
        }

        return user;
      }
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param email User email
   * @returns User if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, name, email, age, description, image
        FROM "Users"
        WHERE email = $1;
      `;
      const result = await this.dbService.query<User>(query, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      const userData = result.rows[0];
      return new User(
        userData.id,
        userData.name,
        userData.email,
        userData.age,
        userData.description,
        userData.image
      );
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find all users with optional filtering
   * @param filters Optional filters for the query
   * @returns Array of users
   */
  async findAll(filters?: { name?: string, limit?: number, offset?: number }): Promise<User[]> {
    try {
      let query = `
        SELECT id, name, email, age, description, image
        FROM "Users"
      `;

      const values: any[] = [];
      let paramCounter = 1;

      if (filters?.name) {
        query += ` WHERE name ILIKE $${paramCounter}`;
        values.push(`%${filters.name}%`);
        paramCounter++;
      }

      query += ` ORDER BY id ASC`;

      if (filters?.limit) {
        query += ` LIMIT $${paramCounter}`;
        values.push(filters.limit);
        paramCounter++;

        if (filters?.offset) {
          query += ` OFFSET $${paramCounter}`;
          values.push(filters.offset);
        }
      }

      const result = await this.dbService.query<User>(query, values);

      return result.rows.map(userData => new User(
        userData.id,
        userData.name,
        userData.email,
        userData.age,
        userData.description,
        userData.image
      ));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param id User ID to update
   * @param userData User data to update
   * @returns Updated user
   */
  async update(id: number, userData: Partial<Omit<User, 'id'>>): Promise<User | null> {
    try {
      // Build the SET part of the query dynamically based on the fields being updated
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (userData.name !== undefined) {
        updateFields.push(`name = $${paramCounter++}`);
        values.push(userData.name);
      }

      if (userData.email !== undefined) {
        updateFields.push(`email = $${paramCounter++}`);
        values.push(userData.email);
      }

      if (userData.age !== undefined) {
        updateFields.push(`age = $${paramCounter++}`);
        values.push(userData.age);
      }

      if (userData.description !== undefined) {
        updateFields.push(`description = $${paramCounter++}`);
        values.push(userData.description);
      }

      if (userData.image !== undefined) {
        updateFields.push(`image = $${paramCounter++}`);
        values.push(userData.image);
      }

      if (updateFields.length === 0) {
        return this.findById(id); // Nothing to update
      }

      // Add the ID to the parameters
      values.push(id);

      const query = `
        UPDATE "Users"
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING id, name, email, age, description, image;
      `;

      const result = await this.dbService.query<User>(query, values);

      if (result.rows.length === 0) {
        return null; // User not found
      }

      const updatedUserData = result.rows[0];
      return new User(
        updatedUserData.id,
        updatedUserData.name,
        updatedUserData.email,
        updatedUserData.age,
        updatedUserData.description,
        updatedUserData.image
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user by ID
   * @param id User ID
   * @returns true if deleted successfully, false if user not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        DELETE FROM "Users"
        WHERE id = $1
        RETURNING id;
      `;

      const result = await this.dbService.query(query, [id]);
      if (!result.rowCount) {
        return false;
      }
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default UserRepository;
