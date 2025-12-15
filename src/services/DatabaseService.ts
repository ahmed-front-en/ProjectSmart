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
