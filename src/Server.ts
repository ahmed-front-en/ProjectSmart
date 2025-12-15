import express, { Express } from "express";
import { DatabaseService } from "./services/DatabaseService";
import { QueryResultRow } from "pg";

export class Server {
  private app: Express;
  private  dbService: DatabaseService;


  constructor(dbService: DatabaseService) {
    this.app = express();
    this.app.use(express.json());
    this.dbService = dbService;
    this.testDatabaseConnection();


  }

  /**
   * Runs a quick query to test the database connection.
   */
  public async testDatabaseConnection(): Promise<QueryResultRow|QueryResultRow[]|null> {
    try {
      const result = await this.dbService.query("SELECT NOW() as now");

      if (!result.rows) {
        return null;
      }
       console.log("✅ Database connection test successful. Current time from DB:", result.rows);
        return result.rows;
    } catch (error) {
      console.error("❌ Database connection test failed:", error);
      throw error;
    }
  }

  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

export default Server;
