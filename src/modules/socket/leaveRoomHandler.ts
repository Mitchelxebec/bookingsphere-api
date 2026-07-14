import { Socket } from "socket.io";

export const leaveRoom = (socket: Socket) => {
  socket.on("leave_room", async (reservationId: string) => {
    try {
      socket.leave(`reservation:${reservationId}`);
    } catch (error) {
      socket.emit("error", { message: "Could not leave room." });
    }
  });
};
