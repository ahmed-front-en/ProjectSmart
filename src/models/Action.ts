export class Action {
    id: number;
    type: 'like' | 'dislike' | 'save';
    PostId?: number;
    CommentId?: number;
    UserId: number;

    constructor(id: number, type: 'like' | 'dislike' | 'save', UserId: number, PostId?: number, CommentId?: number) {
      this.id = id;
      this.type = type;
      this.UserId = UserId;
      this.PostId = PostId;
      this.CommentId = CommentId;

      //validate that iather postid or commentid is provided, but not both
      if (
        (PostId === undefined && CommentId === undefined) ||
        (PostId !== undefined && CommentId !== undefined)
      ) {
        throw new Error("iather postid or commentid is provided, but not both");
      }
    }
}
