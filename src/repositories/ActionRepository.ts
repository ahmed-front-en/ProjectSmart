import { UserAction } from "../models/UserAction";
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
  ): Promise<UserAction> {
    const result = await this.db.query(
      `
      INSERT INTO "Actions" (type, "UserId", "PostId", "CommentId")
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [type, UserId, PostId ?? null, CommentId ?? null]
    );

    const row = result.rows[0];
    return new UserAction(
      row.id,
      row.type,
      row.UserId,
      row.PostId,
      row.CommentId
    );
  }

  async findAll(): Promise<UserAction[]> {
    const result = await this.db.query(`SELECT * FROM "Actions"`);

    return result.rows.map(
      row =>
        new UserAction(
          row.id,
          row.type,
          row.UserId,
          row.PostId,
          row.CommentId
        )
    );
  }

  async findById(id: number): Promise<UserAction | null> {
    const result = await this.db.query(
      `SELECT * FROM "Actions" WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new UserAction(
      row.id,
      row.type,
      row.UserId,
      row.PostId,
      row.CommentId
    );
  }

  async findByUserId(UserId: number): Promise<UserAction[]> {
    const result = await this.db.query(
      `SELECT * FROM "Actions" WHERE "UserId" = $1`,
      [UserId]
    );

    return result.rows.map(
      row =>
        new UserAction(
          row.id,
          row.type,
          row.UserId,
          row.PostId,
          row.CommentId
        )
    );
  }

  async findByPostId(PostId: number): Promise<UserAction[]> {
    const result = await this.db.query(
      `SELECT * FROM "Actions" WHERE "PostId" = $1`,
      [PostId]
    );

    return result.rows.map(
      row =>
        new UserAction(
          row.id,
          row.type,
          row.UserId,
          row.PostId,
          row.CommentId
        )
    );
  }

  async findByCommentId(CommentId: number): Promise<UserAction[]> {
    const result = await this.db.query(
      `SELECT * FROM "Actions" WHERE "CommentId" = $1`,
      [CommentId]
    );

    return result.rows.map(
      row =>
        new UserAction(
          row.id,
          row.type,
          row.UserId,
          row.PostId,
          row.CommentId
        )
    );
  }

  async update(
    id: number,
    type: "like" | "dislike" | "save",
    UserId: number,
    PostId?: number,
    CommentId?: number
  ): Promise<UserAction | null> {
    const result = await this.db.query(
      `
      UPDATE "Actions"
      SET type = $1, "UserId" = $2, "PostId" = $3, "CommentId" = $4
      WHERE id = $5
      RETURNING *
      `,
      [type, UserId, PostId ?? null, CommentId ?? null, id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new UserAction(
      row.id,
      row.type,
      row.UserId,
      row.PostId,
      row.CommentId
    );
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM "Actions" WHERE id = $1`,
      [id]
    );

    return (result.rowCount ?? 0) > 0;
  }
}
