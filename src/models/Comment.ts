export class Comment {
    id: number;
    content: string;
    UserId: number;
    PostId: number;

    constructor(id: number, content: string, UserId: number, PostId: number) {
        this.id = id;
        this.content = content;
        this.UserId = UserId;
        this.PostId = PostId;
    }
}
