export class Comment {
  id: number;
  content: string;
  userId: number;
  postId: number;

  constructor(
    id: number,
    content: string,
    userId: number,
    postId: number
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.postId = postId;
  }
}
