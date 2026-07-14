import { Server, Socket } from "socket.io";
import {
  getReservationInfo,
  saveMessage,
} from "./repository/messageRepository.js";
import { reservationIdSchema } from "./validator/socketValidator.js";

export const sendMessageHandler = (io: Server, socket: Socket) => {
  const currentUser = socket.data.user;
  socket.on("send_message", async (reservationId: string, message: string) => {
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

      const trimmedText = message.trim();
      if (trimmedText.length === 0 || trimmedText.length > 1000) {
        return socket.emit("error", {
          message:
            "Message cannot be empty and cannot be greater than 1000 characters",
        });
      }

      const savedMessage = await saveMessage({
        reservationId,
        senderId: currentUser.userId,
        receiverId:
          currentUser.userId === reservationInfo.guestId
            ? reservationInfo.ownerId
            : reservationInfo.guestId,
        message: trimmedText,
        createdAt: new Date(),
      });

      if (!savedMessage)
        return socket.emit("error", { message: "Message failed to save" });

      io.to(`reservation:${reservationId}`).emit("receive_message", {
        id: savedMessage.id,
        reservationId: savedMessage.reservationId,
        message: savedMessage.message,
        senderId: currentUser.userId,
        receiverId: savedMessage.receiverId,
        createdAt: savedMessage.createdAt,
      });

      console.log(
        `✅ ${currentUser.userId} message sent ${savedMessage.message} by ${currentUser.userId}`,
      );

      return socket.emit("new_message", {
        message: "A new message arrived for this room",
      });
    } catch (error) {
      socket.emit("error", { message: "Message could not be sent ." });
      console.error(error);
    }
  });
};
