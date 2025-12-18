import express, { Express } from "express";
import { ActionController } from "./controllers/ActionController";
import { CommentController } from "./controllers/CommentController";
import { PostController } from "./controllers/PostController";
import { UserController } from "./controllers/UserController";
import { DatabaseService } from "./services/DatabaseService";

export class Server {
  private app: Express;
  public dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.app = express();
    this.app.use(express.json());
    this.dbService = dbService;

    this.setUpRoutes();
  }

  private setUpRoutes(): void {
    const postController = new PostController();
    const commentController = new CommentController();
    const userController = new UserController();
    const actionController = new ActionController();

    // User routes
    this.app.get("/users", userController.getAllUsers);
    this.app.get("/users/:id", userController.getUserById);
    this.app.post("/users", userController.createUser);
    this.app.patch("/users/:id", userController.updateUser);
    this.app.delete("/users/:id", userController.deleteUser);

    // Post routes
    this.app.get("/posts", postController.getAllPosts);
    this.app.get("/posts/search", postController.searchPostsByTitle);
    this.app.get("/posts/:id", postController.getPostById);
    this.app.get("/users/:userId/posts", postController.getPostsByUserId);
    this.app.post("/posts", postController.createPost);
    this.app.patch("/posts/:id", postController.updatePost);
    this.app.delete("/posts/:id", postController.deletePost);

    // Comment routes
    this.app.get("/comments", commentController.getAllComments);
    this.app.get("/comments/:id", commentController.getCommentById);
    this.app.post("/comments", commentController.createComment);
    this.app.patch("/comments/:id", commentController.updateComment);
    this.app.delete("/comments/:id", commentController.deleteComment);
    this.app.get(
      "/users/:userId/comments",
      commentController.getCommentsByUserId
    );
    this.app.get(
      "/posts/:postId/comments",
      commentController.getCommentsByPostId
    );

    // Action routes
    this.app.get("/actions", actionController.getAllActions);
    this.app.get("/actions/:id", actionController.getActionById);
    this.app.post("/actions", actionController.createAction);
    this.app.delete("/actions/:id", actionController.deleteAction);
    this.app.get("/users/:userId/actions", actionController.getActionsByUserId);
    this.app.get("/posts/:postId/actions", actionController.getActionsByPostId);
    this.app.get("/comments/:commentId/actions", actionController.getActionsByCommentId);
  }
  public start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
}

export default Server;

