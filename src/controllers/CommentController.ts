import { Request, Response } from "express";
import { CommentRepository } from "../repositories/CommentRepository";

export class CommentController {
  private commentRepository: CommentRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
  }

  getAllComments = async (req: Request, res: Response) => {
    try {
      const comments = await this.commentRepository.findAll();
      res.status(200).json(comments);
    } catch {
      res.status(500).json({ message: "Error getting comments" });
    }
  };

  getCommentById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    try {
      const comment = await this.commentRepository.findById(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch {
      res.status(500).json({ message: "Error getting comment" });
    }
  };

  getCommentsByUserId = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    try {
      const comments = await this.commentRepository.findByUserId(userId);
      res.status(200).json(comments);
    } catch {
      res.status(500).json({ message: "Error getting comments by user" });
    }
  };

  getCommentsByPostId = async (req: Request, res: Response) => {
    const postId = Number(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    try {
      const comments = await this.commentRepository.findByPostId(postId);
      res.status(200).json(comments);
    } catch {
      res.status(500).json({ message: "Error getting comments by post" });
    }
  };

  createComment = async (req: Request, res: Response) => {
    const { content, UserId, PostId } = req.body;

    if (!content || !UserId || !PostId) {
      return res
        .status(400)
        .json({ message: "Content, UserId, and PostId are required" });
    }

    try {
      const newComment = await this.commentRepository.create(
        content,
        UserId,
        PostId
      );

      res.status(201).json(newComment);
    } catch {
      res.status(500).json({ message: "Error creating comment" });
    }
  };

  updateComment = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { content, UserId, PostId } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    if (!content || !UserId || !PostId) {
      return res
        .status(400)
        .json({ message: "Content, UserId, and PostId are required" });
    }

    try {
      const updatedComment = await this.commentRepository.update(
        id,
        content,
        UserId,
        PostId
      );

      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      res.json(updatedComment);
    } catch {
      res.status(500).json({ message: "Error updating comment" });
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    try {
      const success = await this.commentRepository.delete(id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }

      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting comment" });
    }
  };
}
