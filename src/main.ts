import { Server } from "./Server";

import dbService from "./services/DatabaseService";






const server = new Server(dbService);

server.start(3004);
