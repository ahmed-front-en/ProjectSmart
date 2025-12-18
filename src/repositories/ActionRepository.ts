import { Action } from "../models/Action";
import { DatabaseService } from "../services/DatabaseService";

export class ActionRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async create(
    type: "like" | "dislike" | "save",
    UserId: number,
    PostId?: number,
    CommentId?: number
  ): Promise<Action> {
    const result = await this.db.query(
      'INSERT INTO "Actions" (type, "UserId", "PostId", "CommentId") VALUES ($1, $2, $3, $4) RETURNING *',
      [type, UserId, PostId, CommentId]
    );

    const row = result.rows[0];
    return new Action(row.id, row.type, row.UserId, row.PostId, row.CommentId);
  }

  async findAll(): Promise<Action[]> {
    const result = await this.db.query('SELECT * FROM "Actions"');
    return result.rows.map(
      (row) =>
        new Action(row.id, row.type, row.UserId, row.PostId, row.CommentId)
    );
  }

  async findById(id: number): Promise<Action | null> {
    const result = await this.db.query(
      'SELECT * FROM "Actions" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Action(row.id, row.type, row.UserId, row.PostId, row.CommentId);
  }

  async findByUserId(UserId: number): Promise<Action[]> {
    const result = await this.db.query(
      'SELECT * FROM "Actions" WHERE "UserId" = $1',
      [UserId]
    );
    return result.rows.map(
      (row) =>
        new Action(row.id, row.type, row.UserId, row.PostId, row.CommentId)
    );
  }

  async findByPostId(PostId: number): Promise<Action[]> {
    const result = await this.db.query(
      'SELECT * FROM "Actions" WHERE "PostId" = $1',
      [PostId]
    );
    return result.rows.map(
      (row) =>
        new Action(row.id, row.type, row.UserId, row.PostId, row.CommentId)
    );
  }

  async findByCommentId(CommentId: number): Promise<Action[]> {
    const result = await this.db.query(
      'SELECT * FROM "Actions" WHERE "CommentId" = $1',
      [CommentId]
    );
    return result.rows.map(
      (row) =>
        new Action(row.id, row.type, row.UserId, row.PostId, row.CommentId)
    );
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM "Actions" WHERE id = $1', [
      id,
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
