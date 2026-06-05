import { db } from "../connection.js";
import { users } from "../schema/users.js";
import bcrypt from "bcrypt";
import "dotenv/config";

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash("yourAdminPassword123!", 12);

  await db.insert(users).values({
    name: "Mitchel Admin",
    email: "mitchelokoh96@gmail.com",
    password_hash: hashedPassword,
    roles: ["ADMIN"],
  });

  console.log("✅ Admin user created successfully");
  process.exit(0);
};

seedAdmin();
