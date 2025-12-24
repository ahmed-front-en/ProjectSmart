export class UserAction {
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

     
    }
}
