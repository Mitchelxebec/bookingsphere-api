import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoute from "./modules/auth/routes/authRoute.js";
import userRoute from "./modules/user/routes/userRoute.js";
import { errorHandler } from "./infrastructure/utils/errorMiddleware.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Global Middleware Configuration
app.use(express.json());
app.use(cookieParser());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 request per window
  message: "Too many requests from this IP, please try again later.",
});

// ROUTES
app.use("/api/", limiter);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "BookingSphere API Gateway is online",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 BookingSphere API running on port ${PORT}`);
});

export default app;
