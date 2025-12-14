import { Server } from "./Server";
import DatabaseService from "./services/DatabaseService";

//TODO: transform to singelton pattern
const dbService = new DatabaseService();

const server = new Server(dbService);
server.start(3004);
