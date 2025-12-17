export class User {
    id: number;
    name: string;
    email: string;
    age?: number;
    description?: string;
    image?: string;

    constructor(id: number, name: string, email: string, age?: number, description?: string, image?: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.description = description;
        this.image = image;
    }
}
