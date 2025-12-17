import express, { Express } from "express";
import { DatabaseService } from "./services/DatabaseService";
import { UserController } from "./controllers/UserController";




export class Server {
  private app: Express;
  public  dbService: DatabaseService;


  constructor(dbService: DatabaseService) {
    this.app = express();
    this.app.use(express.json());
    this.dbService = dbService;

    this.setUpRoutes();
  }

  private setUpRoutes(): void {
    const userController = new UserController();

    // User routes
    this.app.get('/users', userController.getAllUsers);
    this.app.get('/users/:id', userController.getUserById);
    this.app.post('/users', userController.createUser);
    this.app.patch('/users/:id', userController.updateUser);
    this.app.delete('/users/:id', userController.deleteUser);
  }




  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

export default Server;
