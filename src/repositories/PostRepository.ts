
import { Post } from '../models/Post';
import { DatabaseService } from '../services/DatabaseService';

export class PostRepository {
    private db: DatabaseService;

    constructor() {
        this.db = DatabaseService.getInstance();
    }

    async create(title: string, UserId: number, content: string, type: 'text' | 'video'): Promise<Post> {
        const result = await this.db.query(
            'INSERT INTO "Posts" (title, "UserId", content, type) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, UserId, content, type]
        );

        const row = result.rows[0];
        return new Post(row.id, row.title, row.UserId, row.content, row.type);
    }

    async findAll(): Promise<Post[]> {
        const result = await this.db.query('SELECT * FROM "Posts"');
        return result.rows.map(row => new Post(row.id, row.title, row.UserId, row.content, row.type));
    }

    async getAllPosts(): Promise<Post[]> {
        return this.findAll();
    }

    async findById(id: number): Promise<Post | null> {
        const result = await this.db.query('SELECT * FROM "Posts" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new Post(row.id, row.title, row.UserId, row.content, row.type);
    }

    async findByUserId(UserId: number): Promise<Post[]> {
        const result = await this.db.query('SELECT * FROM "Posts" WHERE "UserId" = $1', [UserId]);
        return result.rows.map(row => new Post(row.id, row.title, row.UserId, row.content, row.type));
    }

    async findByTitle(title: string): Promise<Post[]> {
        const result = await this.db.query('SELECT * FROM "Posts" WHERE title ILIKE $1', [`%${title}%`]);
        return result.rows.map(row => new Post(row.id, row.title, row.UserId, row.content, row.type));
    }

    async update(id: number, title: string, UserId: number, content: string, type: 'text' | 'video'): Promise<Post | null> {
        const result = await this.db.query(
            'UPDATE "Posts" SET title = $1, "UserId" = $2, content = $3, type = $4 WHERE id = $5 RETURNING *',
            [title, UserId, content, type, id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new Post(row.id, row.title, row.UserId, row.content, row.type);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.db.query('DELETE FROM "Posts" WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
