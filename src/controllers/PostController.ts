
import { Request, Response } from "express";
import { PostRepository } from "../repositories/PostRepository";
import { Post } from "../models/Post";

export class PostController {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  getAllPosts = async (req: Request, res: Response) => {
    try {
      const posts = await this.postRepository.findAll();
      res.status(200).json(posts);
    } catch {
      res.status(500).json({ message: "Error getting posts" });
    }
  };

  getPostById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch {
      res.status(500).json({ message: "Error getting post" });
    }
  };

  getPostsByUserId = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    try {
      const posts = await this.postRepository.findByUserId(userId);
      res.status(200).json(posts);
    } catch {
      res.status(500).json({ message: "Error getting posts by user" });
    }
  };

  searchPostsByTitle = async (req: Request, res: Response) => {
    const { title } = req.query;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Title query parameter is required" });
    }

    try {
      const posts = await this.postRepository.findByTitle(title);
      res.status(200).json(posts);
    } catch {
      res.status(500).json({ message: "Error searching posts" });
    }
  };

  createPost = async (req: Request, res: Response) => {
    const { title, UserId, content, type } = req.body;

    if (!title || !UserId || !content || !type) {
      return res
        .status(400)
        .json({ message: "Title, UserId, content, and type are required" });
    }

    if (type !== 'text' && type !== 'video') {
      return res
        .status(400)
        .json({ message: "Type must be either 'text' or 'video'" });
    }

    try {
      const newPost = await this.postRepository.create(
        title,
        UserId,
        content,
        type
      );

      res.status(201).json(newPost);
    } catch {
      res.status(500).json({ message: "Error creating post" });
    }
  };

  updatePost = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { title, UserId, content, type } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    if (!title || !UserId || !content || !type) {
      return res
        .status(400)
        .json({ message: "Title, UserId, content, and type are required" });
    }

    if (type !== 'text' && type !== 'video') {
      return res
        .status(400)
        .json({ message: "Type must be either 'text' or 'video'" });
    }

    try {
      const updatedPost = await this.postRepository.update(
        id,
        title,
        UserId,
        content,
        type
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(updatedPost);
    } catch {
      res.status(500).json({ message: "Error updating post" });
    }
  };

  deletePost = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    try {
      const success = await this.postRepository.delete(id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting post" });
    }
  };
}
