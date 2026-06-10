import { db } from "../connection.js";
import { users } from "../schema/users.js";
import bcrypt from "bcrypt";
import "dotenv/config";

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash("yourAdminPassword123!", 12);

  await db.insert(users).values({
    name: "Mitchel Super Admin",
    email: "super@bookingsphere.com",
    password_hash: hashedPassword,
    roles: ["SUPERADMIN"],
    is_banned: false,
    ban_reason: "",
  });

  console.log("✅ Super Admin user created successfully");
  process.exit(0);
};

seedAdmin();
