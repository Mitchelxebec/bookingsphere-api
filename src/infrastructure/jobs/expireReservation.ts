import { expireStaleReservationsService } from "../../modules/reservation/service/reservationService.js";

export const startExpiryJob = () => {
  // Run every 2 minutes
  setInterval(async () => {
    try {
      const result = await expireStaleReservationsService();
      if (result.expired > 0) {
        console.log(`⏰ Expired ${result.expired} stale reservation(s).`);
      }
    } catch (error) {
      console.error("Expiry job failed:", error);
    }
  }, 2 * 60 * 1000);

  console.log("⏰ Reservation expiry job started (runs every 2 minutes).");
};