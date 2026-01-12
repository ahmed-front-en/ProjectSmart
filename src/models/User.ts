import { Post } from "./Post";

export class User {
    id: number;
    name: string;
    email: string;
    age?: number;
    description?: string;
    image?: string;
    posts?: Post[];


    constructor(id: number, name: string, email: string, age?: number, description?: string, image?: string,
        posts?: Post[]
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.description = description;
        this.image = image;
        this.posts = posts;
    }
}
