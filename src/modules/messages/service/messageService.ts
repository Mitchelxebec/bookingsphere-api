import { ApiError } from "../../shared/utils/ApiError.js";
import {
  getReservationInfo,
  getMessagesByRoom,
  markMessagesAsRead,
} from "../../socket/repository/messageRepository.js";

export const fetchChatHistoryService = async (
  reservationId: string,
  currentUserId: string,
) => {
  // 1. Authorization Guard
  const reservation = await getReservationInfo(reservationId);
  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  const isGuest = reservation.guestId === currentUserId;
  const isOwner = reservation.ownerId === currentUserId;
  if (!isGuest && !isOwner) {
    throw new ApiError(403, "Unauthorized access to this chat history");
  }

  // 2. FETCH FIRST: Get the accurate snapshot with unread states intact
  const historicalMessages = await getMessagesByRoom(reservationId);

  // 3. MARK AFTER: Run this in the background or await it right before returning
  // It targets only incoming unread messages (where senderId !== currentUserId)
  await markMessagesAsRead(reservationId, currentUserId);

  // 4. Return the pristine snapshot to the controller/frontend
  return historicalMessages;
};
