import { User } from '../models/User';
import { DatabaseService } from '../services/DatabaseService';

export class UserRepository {
    private db: DatabaseService;

    constructor() {
        this.db = DatabaseService.getInstance();
    }

    async create(name: string, email: string, age?: number, description?: string, image?: string): Promise<User> {
        const result = await this.db.query(
            'INSERT INTO "Users" (name, email, age, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, age, description, image]
        );

        const row = result.rows[0];
        return new User(row.id, row.name, row.email, row.age, row.description, row.image);
    }

    async findAll(): Promise<User[]> {
        const result = await this.db.query('SELECT * FROM "Users"');
        return result.rows.map(row => new User(row.id, row.name, row.email, row.age, row.description, row.image));
    }

    async getAllUsers(): Promise<User[]> {
        return this.findAll();
    }

    async findById(id: number, showPosts : boolean = false): Promise<User | null> {
        if (showPosts) {
            const query = `
                SELECT u.*, (
                    SELECT COALESCE(JSON_AGG(p.*), '[]'::json)
                    FROM "Posts" p
                    WHERE p."UserId" = u.id
                ) as posts
                FROM "Users" u
                WHERE u.id = $1
            `;
            const result = await this.db.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new User(row.id, row.name, row.email, row.age, row.description, row.image, row.posts);

        } else {
            const result = await this.db.query('SELECT * FROM "Users" WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new User(row.id, row.name, row.email, row.age, row.description, row.image);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.name, row.email, row.age, row.description, row.image);
    }

    async update(id: number, name: string, email: string, age?: number, description?: string, image?: string): Promise<User | null> {
        const result = await this.db.query(
            'UPDATE "Users" SET name = $1, email = $2, age = $3, description = $4, image = $5 WHERE id = $6 RETURNING *',
            [name, email, age, description, image, id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new User(row.id, row.name, row.email, row.age, row.description, row.image);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.db.query('DELETE FROM "Users" WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

}
