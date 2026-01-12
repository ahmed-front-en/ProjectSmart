import { Pool, PoolClient, QueryResult } from "pg";

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "user",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "mydb",
      port: parseInt(process.env.DB_PORT || "5432", 10),
    });

    this.pool.on("connect", () => {
      console.log("✅ Connected to the PostgreSQL database");
    });

    this.pool.on("error", (err) => {
      console.error("❌ Unexpected DB error", err);
      process.exit(1);
    });

    // initialize tables once
    this.initializeTables().catch((err) => {
      console.error("❌ Failed to initialize tables:", err);
    });



  }

  /* =========================
     Singleton accessor
  ========================== */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }



      /**
   * Public method used ONLY by scripts (seed/reset)
   */
  public async sync(): Promise<void> {
    await this.initializeTables();
  }

  /* =========================
     Database initialization
  ========================== */
  private async initializeTables(): Promise<void> {
    const client = await this.getClient();

    try {
      await client.query("BEGIN");

      // Users
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Users" (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          age INTEGER,
          description TEXT,
          image VARCHAR(255)
        )
      `);

      // Posts
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Posts" (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          type VARCHAR(10) CHECK (type IN ('text', 'video')),
          "UserId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE
        )
      `);

      // Comments
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Comments" (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          "UserId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
          "PostId" INTEGER NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE
        )
      `);

      // Actions (UserAction)
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Actions" (
          id SERIAL PRIMARY KEY,
          type VARCHAR(10) CHECK (type IN ('like', 'dislike', 'save')),
          "UserId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
          "PostId" INTEGER REFERENCES "Posts"(id) ON DELETE CASCADE,
          "CommentId" INTEGER REFERENCES "Comments"(id) ON DELETE CASCADE,
          CHECK (
            ("PostId" IS NULL AND "CommentId" IS NOT NULL)
            OR
            ("PostId" IS NOT NULL AND "CommentId" IS NULL)
          )
        )
      `);

      // Indexes
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_users_name ON "Users"(name)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_posts_userid ON "Posts"("UserId")`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_posts_title ON "Posts"(title)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_comments_postid ON "Comments"("PostId")`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_comments_userid ON "Comments"("UserId")`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_actions_userid ON "Actions"("UserId")`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_actions_type ON "Actions"(type)`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_actions_postid ON "Actions"("PostId") WHERE "PostId" IS NOT NULL`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS idx_actions_commentid ON "Actions"("CommentId") WHERE "CommentId" IS NOT NULL`
      );

      await client.query("COMMIT");
      console.log("✅ Database tables initialized");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error initializing database", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /* =========================
     Query helpers
  ========================== */
  public async query(text: string, params: any[] = []): Promise<QueryResult> {
    const client = await this.getClient();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
}
