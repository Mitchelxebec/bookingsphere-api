import { Socket } from "socket.io";
import { getReservationInfo } from "./repository/messageRepository.js";
import { reservationIdSchema } from "./validator/socketValidator.js";

export const joinRoomHandlers = (socket: Socket) => {
  const currentUser = socket.data.user;

  socket.on("join_room", async (reservationId: string) => {
    try {
      const result = reservationIdSchema.safeParse(reservationId);
      if (!result.success)
        return socket.emit("error", { message: "Invalid reservation ID" });

      const reservationInfo = await getReservationInfo(reservationId);
      if (!reservationInfo)
        return socket.emit("error", { message: "Reservation does not exist" });

      if (
        currentUser.userId !== reservationInfo.guestId &&
        currentUser.userId !== reservationInfo.ownerId
      )
        return socket.emit("error", {
          message: "You don't have access to this conversation",
        });

      socket.join(`reservation:${reservationId}`);

      return socket.emit("room_joined", {
        message: "Room Joined Successfully",
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to join room." });
      console.error(error);
    }
  });
};
