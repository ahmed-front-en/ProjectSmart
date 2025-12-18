import { Comment } from "../models/Comment";
import { DatabaseService } from "../services/DatabaseService";

export class CommentRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async create(
    content: string,
    UserId: number,
    PostId: number
  ): Promise<Comment> {
    const result = await this.db.query(
      'INSERT INTO "Comments" (content, "UserId", "PostId") VALUES ($1, $2, $3) RETURNING *',
      [content, UserId, PostId]
    );

    const row = result.rows[0];
    return new Comment(row.id, row.content, row.UserId, row.PostId);
  }

  async findAll(): Promise<Comment[]> {
    const result = await this.db.query('SELECT * FROM "Comments"');
    return result.rows.map(
      (row) => new Comment(row.id, row.content, row.UserId, row.PostId)
    );
  }

  async getAllComments(): Promise<Comment[]> {
    return this.findAll();
  }

  async findById(id: number): Promise<Comment | null> {
    const result = await this.db.query(
      'SELECT * FROM "Comments" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Comment(row.id, row.content, row.UserId, row.PostId);
  }

  async findByUserId(UserId: number): Promise<Comment[]> {
    const result = await this.db.query(
      'SELECT * FROM "Comments" WHERE "UserId" = $1',
      [UserId]
    );
    return result.rows.map(
      (row) => new Comment(row.id, row.content, row.UserId, row.PostId)
    );
  }

  async findByPostId(PostId: number): Promise<Comment[]> {
    const result = await this.db.query(
      'SELECT * FROM "Comments" WHERE "PostId" = $1',
      [PostId]
    );
    return result.rows.map(
      (row) => new Comment(row.id, row.content, row.UserId, row.PostId)
    );
  }

  async update(
    id: number,
    content: string,
    UserId: number,
    PostId: number
  ): Promise<Comment | null> {
    const result = await this.db.query(
      'UPDATE "Comments" SET content = $1, "UserId" = $2, "PostId" = $3 WHERE id = $4 RETURNING *',
      [content, UserId, PostId, id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Comment(row.id, row.content, row.UserId, row.PostId);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM "Comments" WHERE id = $1', [
      id,
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
