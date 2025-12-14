export class Post {
  id: number;
  title: string;
  userId: number;
  content: string;
  type: 'text' | 'video';

  constructor(
    id: number,
    title: string,
    userId: number,
    content: string,
    type: 'text' | 'video'
  ) {
    this.id = id;
    this.title = title;
    this.userId = userId;
    this.content = content;
    this.type = type;
  }
}
