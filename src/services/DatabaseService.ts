import { Pool, PoolClient, QueryResult } from 'pg';

export class DatabaseService {
  private pool: Pool;

  public constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'mydb',
      port: parseInt(process.env.DB_PORT || '5432'),
    });

    // Initialize tables
    this.initializeTables().catch(error => {
      console.error('Failed to initialize database tables:', error);
    });
  }

  /**
   * Initialize database tables if they don't exist
   */
  private async initializeTables(): Promise<void> {
    const client = await this.getConnection();
    try {
      await client.query('BEGIN');

      // Create Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Users" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          age INT,
          description TEXT,
          image VARCHAR(255)
        );
      `);

      // Add indexes to Users table
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_users_name" ON "Users"(name);`);

      // Create Posts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Posts" (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          type VARCHAR(10) CHECK (type IN ('text', 'video'))
        );
      `);

      // Add indexes to Posts table
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_posts_userId" ON "Posts"("userId");`);
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_posts_title" ON "Posts"(title);`);

      // Create Comments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Comments" (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
          "postId" INT NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE
        );
      `);

      // Add indexes to Comments table
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_comments_postId" ON "Comments"("postId");`);
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_comments_userId" ON "Comments"("userId");`);

      // Create Actions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Actions" (
          id SERIAL PRIMARY KEY,
          type VARCHAR(10) CHECK (type IN ('like', 'dislike', 'save')),
          "postId" INT REFERENCES "Posts"(id) ON DELETE CASCADE,
          "commentId" INT REFERENCES "Comments"(id) ON DELETE CASCADE,
          "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
          CHECK (("postId" IS NULL AND "commentId" IS NOT NULL) OR
                ("postId" IS NOT NULL AND "commentId" IS NULL))
        );
      `);

      // Add indexes to Actions table
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_actions_postId" ON "Actions"("postId") WHERE "postId" IS NOT NULL;`);
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_actions_commentId" ON "Actions"("commentId") WHERE "commentId" IS NOT NULL;`);
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_actions_userId" ON "Actions"("userId");`);
      await client.query(`CREATE INDEX IF NOT EXISTS "idx_actions_type" ON "Actions"(type);`);

      await client.query('COMMIT');
      console.log('Database tables initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error initializing tables:', error);
      throw new Error('Failed to initialize database tables');
    } finally {
      client.release();
    }
  }

  /**
   * Get a client connection from the pool
   */
  public async getConnection(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw new Error('Failed to connect to database');
    }
  }

  /**
   * Execute a database query
   * @param text - SQL query text
   * @param params - Query parameters
   */
  public async query<T>(text: string, params: any[] = []): Promise<QueryResult> {
    const client = await this.getConnection();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close all database connections
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default DatabaseService;
