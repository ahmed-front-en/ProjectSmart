export class Action {
  id: number;
  type: 'like' | 'dislike' | 'save';
  postId?: number;
  commentId?: number;
  userId: number;

  constructor(
    id: number,
    type: 'like' | 'dislike' | 'save',
    userId: number,
    postId?: number,
    commentId?: number
  ) {
    this.id = id;
    this.type = type;
    this.userId = userId;
    this.postId = postId;
    this.commentId = commentId;

    // Validate that either postId or commentId is provided, but not both
    if ((postId === undefined && commentId === undefined) ||
        (postId !== undefined && commentId !== undefined)) {
      throw new Error("Either postId or commentId must be provided, but not both");
    }
  }
}
