import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "../models/User";
import { DatabaseService } from "../services/DatabaseService";


export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository.findAll();
      res.status(200).json(users);
    } catch {
      res.status(500).json({ message: "Error getting users" });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const showPosts = req.query.show_posts === 'true';

    try {
      const user = await this.userRepository.findById(id, showPosts);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch {
      res.status(500).json({ message: "Error getting user" });
    }
  };
  createUser = async (req: Request, res: Response) => {
    const { name, email, age, description, image } = req.body;

    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const newUser = await this.userRepository.create(
        name,
        email,
        age,
        description,
        image
      );

      res.status(201).json(newUser);
    } catch {
      res.status(500).json({ message: "Error creating user" });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, email, age, description, image } = req.body;

    try {
      const updatedUser = await this.userRepository.update(
        id,
        name,
        email,
        age,
        description,
        image
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch {
      res.status(500).json({ message: "Error updating user" });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      const success = await this.userRepository.delete(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting user" });
    }
  };
}
