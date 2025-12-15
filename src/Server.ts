import express, { Express } from "express";
import { DatabaseService } from "./services/DatabaseService";
import { QueryResultRow } from "pg";

export class Server {
  private app: Express;
  private dbService: DatabaseService;


  constructor(dbService: DatabaseService) {
    this.app = express();
    this.app.use(express.json());
    this.dbService = dbService;
  }




  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

export default Server;
