import express, { Express } from "express";

import { UserController } from "./controllers/UserController";
import { PostController } from "./controllers/PostController";
import { CommentController } from "./controllers/CommentController";
import { ActionController } from "./controllers/ActionController";
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
    const userController = new UserController();
    const postController = new PostController();
    const commentController = new CommentController();
    const actionController = new ActionController();

    /* =========================
       USER RELATED ROUTES
    ========================== */

    // User → Posts / Comments / Actions (specific first)
    this.app.get(
      "/users/:userId/posts",
      postController.getPostsByUserId
    );
    this.app.get(
      "/users/:userId/comments",
      commentController.getCommentsByUserId
    );
    this.app.get(
      "/users/:userId/actions",
      actionController.getActionsByUserId
    );

    // User CRUD
    this.app.get("/users", userController.getAllUsers);
    this.app.get("/users/:id", userController.getUserById);
    this.app.post("/users", userController.createUser);
    this.app.patch("/users/:id", userController.updateUser);
    this.app.delete("/users/:id", userController.deleteUser);

    /* =========================
       POST RELATED ROUTES
    ========================== */

    // Search & relations first
    this.app.get(
      "/posts/search",
      postController.searchPostsByTitle
    );
    this.app.get(
      "/posts/:postId/comments",
      commentController.getCommentsByPostId
    );
    this.app.get(
      "/posts/:postId/actions",
      actionController.getActionsByPostId
    );

    // Post CRUD
    this.app.get("/posts", postController.getAllPosts);
    this.app.get("/posts/:id", postController.getPostById);
    this.app.post("/posts", postController.createPost);
    this.app.patch("/posts/:id", postController.updatePost);
    this.app.delete("/posts/:id", postController.deletePost);

    /* =========================
       COMMENT RELATED ROUTES
    ========================== */

    this.app.get("/comments", commentController.getAllComments);
    this.app.get("/comments/:id", commentController.getCommentById);
    this.app.post("/comments", commentController.createComment);
    this.app.patch("/comments/:id", commentController.updateComment);
    this.app.delete("/comments/:id", commentController.deleteComment);

    // Comment → Actions
    this.app.get(
      "/comments/:commentId/actions",
      actionController.getActionsByCommentId
    );

    /* =========================
       ACTION CRUD ROUTES
    ========================== */

    this.app.get("/actions", actionController.getAllActions);
    this.app.get("/actions/:id", actionController.getActionById);
    this.app.post("/actions", actionController.createAction);
    this.app.patch("/actions/:id", actionController.updateAction);
    this.app.delete("/actions/:id", actionController.deleteAction);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  }
}

export default Server;
