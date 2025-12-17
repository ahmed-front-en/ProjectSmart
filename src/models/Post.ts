export class Post {
    id: number;
    title: string;
    UserId: number;
    content: string;
    type: 'text' | 'video';

    constructor(id: number, title: string, UserId: number, content: string, type: 'text' | 'video') {
        this.id = id;
        this.title = title;
        this.UserId = UserId;
        this.content = content;
        this.type = type;
    }
}
