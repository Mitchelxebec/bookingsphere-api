import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./modules/shared/docs/swagger.js";
import authRoute from "./modules/auth/routes/authRoute.js";
import userRoute from "./modules/user/routes/userRoute.js";
import kycRoute from "./modules/kyc/routes/kycRoutes.js";
import propertyRoute from "./modules/property/properties/router/publicRoute.js";
import roomTypeRoute from "./modules/property/roomType/routes/roomTypeRoutes.js";
import reservationRoute from "./modules/reservation/routes/reservationRoutes.js";
import wishlistRoute from "./modules/wishlist/routes/wishlistRoutes.js";
import paymentRoute from "./modules/payment/routes/paymentRoute.js";
import paystackWebhookRoute from "./modules/payment/routes/webhookRoutes.js";
import reviewRoute from "./modules/review/routes/reviewRoutes.js";
import messageRoute from "./modules/messages/routes/messageRoute.js";

// PROPRIETOR
import proprietorPropertyRoute from "./modules/property/properties/router/proprietor/proprietorRouter.js";

//  ADMIN
import adminPropertyRoute from "./modules/property/properties/router/admin/adminRoute.js";
import adminUserRoute from "./modules/user/routes/admin/adminRoute.js";
import adminKycRoute from "./modules/kyc/routes/admin/adminKycRoute.js";
import { errorHandler } from "./modules/shared/utils/errorMiddleware.js";
import { TokenRotationRepository } from "./modules/auth/repository/repoTokenRotation.js";
import { startExpiryJob } from "./infrastructure/jobs/expireReservation.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { socketAuth } from "./modules/socket/middleware/authSocket.js";
import { registerSocketHandlers } from "./modules/socket/app.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use("/api/v1/webhooks", paystackWebhookRoute);

// Global Middleware Configuration
app.use(express.json());
app.use(cookieParser());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 request per window
  message: "Too many requests from this IP, please try again later.",
});

// ROUTES
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/", limiter);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/users/admin", adminUserRoute);
app.use("/api/v1/kyc", kycRoute);
app.use("/api/v1/kyc/admin", adminKycRoute);
app.use("/api/v1/properties", propertyRoute);
app.use("/api/v1/properties/proprietor", proprietorPropertyRoute);
app.use("/api/v1/properties/admin", adminPropertyRoute);
app.use("/api/v1/properties/:propertyId/room-types", roomTypeRoute);
app.use("/api/v1/reservations", reservationRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/payments", paymentRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/reservations/:reservationId", messageRoute);


app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    message: "BookingSphere API Gateway is online",
  });
});

app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.use(socketAuth)
registerSocketHandlers(io)

const PORT = process.env.PORT || 5005;
httpServer.listen(PORT, () => {
  console.log(`🚀 BookingSphere API running on port ${PORT}`);

  // Purge expired/used refresh tokens on startup, then every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  TokenRotationRepository.purgeInvalidTokens()
    .then(() => console.log("🧹 Expired refresh tokens purged on startup"))
    .catch((err) => console.error("Failed to purge refresh tokens:", err));

  setInterval(() => {
    TokenRotationRepository.purgeInvalidTokens()
      .then(() => console.log("🧹 Scheduled refresh token purge complete"))
      .catch((err) => console.error("Scheduled purge failed:", err));
  }, TWENTY_FOUR_HOURS);

  // Start reservation expiry job
  startExpiryJob();
});

export default app;
