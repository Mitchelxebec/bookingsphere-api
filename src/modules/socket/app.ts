import { Server, Socket } from "socket.io";
import { joinRoomHandlers } from "./joinRoomHanlder.js";
import { sendMessageHandler } from "./messageHandler.js";
import { leaveRoom } from "./leaveRoomHandler.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔒 Connected: ${socket.data.user.userId}`);

    joinRoomHandlers(socket);
    sendMessageHandler(io, socket);
    leaveRoom(socket);

    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.data.user.userId}`);
    });
  });
};
