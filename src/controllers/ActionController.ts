import { Request, Response } from "express";
import { ActionRepository } from "../repositories/ActionRepository";

export class ActionController {
  private actionRepository: ActionRepository;

  constructor() {
    this.actionRepository = new ActionRepository();
  }

  createAction = async (req: Request, res: Response) => {
    const { type, UserId, PostId, CommentId } = req.body;

    if (!type || !UserId) {
      return res.status(400).json({ message: "Type and UserId are required" });
    }

    if (!PostId && !CommentId) {
      return res
        .status(400)
        .json({ message: "PostId or CommentId is required" });
    }

    try {
      const newAction = await this.actionRepository.create(
        type,
        UserId,
        PostId,
        CommentId
      );

      res.status(201).json(newAction);
    } catch (e) {
      const err = e as Error;
      res
        .status(500)
        .json({ message: "Error creating action", error: err.message });
    }
  };

  getAllActions = async (req: Request, res: Response) => {
    try {
      const actions = await this.actionRepository.findAll();
      res.status(200).json(actions);
    } catch {
      res.status(500).json({ message: "Error fetching actions" });
    }
  };

  getActionById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action id" });
    }

    try {
      const action = await this.actionRepository.findById(id);
      if (!action) {
        return res.status(404).json({ message: "Action not found" });
      }

      res.status(200).json(action);
    } catch {
      res.status(500).json({ message: "Error fetching action" });
    }
  };

  getActionsByUserId = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    try {
      const actions = await this.actionRepository.findByUserId(userId);
      res.status(200).json(actions);
    } catch {
      res.status(500).json({ message: "Error fetching actions" });
    }
  };

  getActionsByPostId = async (req: Request, res: Response) => {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    try {
      const actions = await this.actionRepository.findByPostId(postId);
      res.status(200).json(actions);
    } catch {
      res.status(500).json({ message: "Error fetching actions" });
    }
  };

  getActionsByCommentId = async (req: Request, res: Response) => {
    const commentId = Number(req.params.commentId);

    if (isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    try {
      const actions = await this.actionRepository.findByCommentId(commentId);
      res.status(200).json(actions);
    } catch {
      res.status(500).json({ message: "Error fetching actions" });
    }
  };

  deleteAction = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action id" });
    }

    try {
      const success = await this.actionRepository.delete(id);
      if (!success) {
        return res.status(404).json({ message: "Action not found" });
      }

      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting action" });
    }
  };
}
