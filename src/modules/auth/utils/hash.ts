import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const PasswordService = {
  // Hashes a plain text password before database insertion (Used in Sign Up)
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  // Compares a typed login password against the saved database hash (Used in Login)
  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  },
};
