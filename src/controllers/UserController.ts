import { Request, Response } from 'express';
import { User } from '../models/User';
import UserRepository from '../repositories/UserRepository';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users with optional filtering
   * @route GET /api/users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        name: req.query.name as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const users = await this.userRepository.findAll(filters);
      res.status(200).json(users);
    } catch (error) {
      console.error('Failed to get users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get user by ID
   * @route GET /users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      console.log(id);
      const showPosts = req.query.show_posts === 'true';
      console.log(showPosts);

      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid user ID' });
        return;
      }

      const user = await this.userRepository.findById(id, showPosts);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Create a new user
   * @route POST /api/users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, age, description, image } = req.body;

      // Basic validation
      if (!name || !email) {
        res.status(400).json({ message: 'Name and email are required' });
        return;
      }

      // Check if user with same email already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ message: 'User with this email already exists' });
        return;
      }

      const userData: Omit<User, 'id'> = {
        name,
        email,
        age: age || null,
        description: description || null,
        image: image || null
      };

      const newUser = await this.userRepository.create(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Failed to create user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update an existing user
   * @route PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid user ID' });
        return;
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const { name, email, age, description, image } = req.body;

      // If email is being changed, check if it's already in use
      if (email && email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(email);
        if (userWithEmail && userWithEmail.id !== id) {
          res.status(409).json({ message: 'Email already in use by another user' });
          return;
        }
      }

      const userData: Partial<Omit<User, 'id'>> = {};

      if (name !== undefined) userData.name = name;
      if (email !== undefined) userData.email = email;
      if (age !== undefined) userData.age = age;
      if (description !== undefined) userData.description = description;
      if (image !== undefined) userData.image = image;

      const updatedUser = await this.userRepository.update(id, userData);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete a user
   * @route DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid user ID' });
        return;
      }

      const deleted = await this.userRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(204).end();
    } catch (error) {
      console.error('Failed to delete user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default UserController;
