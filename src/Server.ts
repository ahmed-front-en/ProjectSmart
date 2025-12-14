import express, { Express, Request, Response } from "express";
import PostController from "./controllers/PostController";
import UserController from "./controllers/UserController";
import DatabaseService from "./services/DatabaseService";

export class Server {
  private app: Express;
  public static dbService: DatabaseService;
  private userController: UserController;
  private postController: PostController;

  constructor(dbService: DatabaseService) {
    this.app = express();
    this.app.use(express.json());
    Server.dbService = dbService;
    this.userController = new UserController();
    this.postController = new PostController();
    this.setupRoutes();
  }

  /**
   * Set up all API routes
   */
  private setupRoutes(): void {

    // User routes - Define all five routes directly

    // 1. GET all users
    this.app.get('/users', (req: Request, res: Response) =>
      this.userController.getAllUsers(req, res));

    // 2. GET user by id
    this.app.get('/users/:id', (req: Request, res: Response) =>
      this.userController.getUserById(req, res));

    // 3. POST user (create)
    this.app.post('/users', (req: Request, res: Response) =>
      this.userController.createUser(req, res));

    // 4. PATCH user (update)
    this.app.patch('/users/:id', (req: Request, res: Response) =>
      this.userController.updateUser(req, res));

    // 5. DELETE user
    this.app.delete('/users/:id', (req: Request, res: Response) =>
      this.userController.deleteUser(req, res));

    // Post routes

    // 1. GET all posts
    this.app.get('/posts', (req: Request, res: Response) =>
      this.postController.getAllPosts(req, res));

    // 2. GET post by id
    this.app.get('/posts/:id', (req: Request, res: Response) =>
      this.postController.getPostById(req, res));

    // 3. GET posts by user id
    this.app.get('/posts/user/:userId', (req: Request, res: Response) =>
      this.postController.getPostsByUserId(req, res));

    // 4. POST post (create)
    this.app.post('/posts', (req: Request, res: Response) =>
      this.postController.createPost(req, res));

    // 5. PATCH post (update)
    this.app.patch('/posts/:id', (req: Request, res: Response) =>
      this.postController.updatePost(req, res));

    // 6. DELETE post
    this.app.delete('/posts/:id', (req: Request, res: Response) =>
      this.postController.deletePost(req, res));
  }

  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

export default Server;
