import { Server as HttpServer } from "http";
import { Server } from "socket.io";
export declare const initSocketManager: (httpServer: HttpServer) => void;
export declare const getIo: () => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
//# sourceMappingURL=socket.manager.d.ts.map