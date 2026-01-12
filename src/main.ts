import { Server } from "./Server";

import {DatabaseService} from "./services/DatabaseService";





const dbService = DatabaseService.getInstance();
const server = new Server(dbService);

server.start(3004);
