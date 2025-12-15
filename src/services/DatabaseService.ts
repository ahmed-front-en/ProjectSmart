import { Pool, PoolClient, QueryResult } from "pg";

export class DatabaseService { // This is now a named export
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
      console.log("Connected to the PostgreSQL database!");
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });


    this.initializeTables().catch((err) => {
      console.error("Failed to initialize tables:", err);

    })
  }






  public async initializeTables(): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      //Create Users table
      await client.query(`CREATE TABLE IF NOT EXISTS "Users" (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, age INTEGER, description TEXT, image VARCHAR(255))`);

      //Create Posts table
      await client.query(`CREATE TABLE IF NOT EXISTS "Posts" (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, "UserId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE, content TEXT NOT NULL, type VARCHAR(10)  CHECK (type IN ('text', 'video')))`);

       //Create Comments table
      await client.query(`CREATE TABLE IF NOT EXISTS "Comments" (id SERIAL PRIMARY KEY, content TEXT NOT NULL, "UserId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE, "PostId" INTEGER NOT NULL REFERENCES "Posts"(id) ON DELETE CASCADE)`);

      //create Actions table
      await client.query(`
  CREATE TABLE IF NOT EXISTS "Actions" (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) CHECK (type IN ('like', 'dislike', 'save')),
    "PostId" INTEGER REFERENCES "Posts"(id) ON DELETE CASCADE,
    "CommentId" INTEGER REFERENCES "Comments"(id) ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    CHECK (
      ("PostId" IS NULL AND "CommentId" IS NOT NULL)
      OR
      ("PostId" IS NOT NULL AND "CommentId" IS NULL)
    )
  )
`);


      //Create indexes for Users table
      // await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email)`);

      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_name ON "Users"(name)`);

      //Create indexes for Posts table
      await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_userid ON "Posts"("UserId")`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_title ON "Posts"(title)`);

      //Create indexes for Comments table
      await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_postid ON "Comments"("PostId")`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_userid ON "Comments"("UserId")`);

      //Create indexes for Actions table
      await client.query(`CREATE INDEX IF NOT EXISTS idx_actions_postid ON "Actions"("PostId") WHERE "PostId" IS NOT NULL`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_actions_commentid ON "Actions"("CommentId") WHERE "CommentId" IS NOT NULL`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_actions_userid ON "Actions"("UserId")`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_actions_type ON "Actions"(type)`);

      await client.query("COMMIT");


      console.log("Database Tables initialized successfully!");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error initializing tables", error);
      throw new Error("faiiled to initialize Database tables");
    } finally {
      client.release();
    }
  }



  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Executes a query against the database.
   * @param text The SQL query string.
   * @param params The parameters for the query.
   * @returns A promise that resolves with the query result.
   */
  public async query(text: string, params: any[] = []): Promise<QueryResult>{
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;

    } catch (error) {
      console.error("Error executing query", error);
      throw error;

    } finally {
      client.release();
    }


  }
  /**
   * Gets a client from the pool. This is useful for transactions.
   * Remember to release the client when you are done with it.
   * @returns A promise that resolves with a database client.
   */
  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
}

export default DatabaseService.getInstance();
