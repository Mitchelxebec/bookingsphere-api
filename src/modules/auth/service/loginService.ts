import { ApiError } from "../../../infrastructure/utils/ApiError.js";
import { findUserFromEmail } from "../repository/repoLogin.js";
import { TokenRotationRepository } from "../repository/repoTokenRotation.js";
import { PasswordService } from "../utils/hash.js";
import { TokenService } from "../utils/tokenService.js";

interface LoginUserData {
  email: string;
  password: string;
}

export const login = async (data: LoginUserData) => {
  const user = await findUserFromEmail(data.email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Compare user password with the hash
  const passwordHash = await PasswordService.compare(
    data.password,
    user.password_hash,
  );

  if (!passwordHash) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = TokenService.generateTokenPair({
    userId: user.id,
    roles: user.roles,
  });

  const { password_hash, ...sanitizedUser } = user;

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await TokenRotationRepository.saveToken(
    user.id,
    tokens.refreshToken,
    sevenDaysFromNow,
  );
  
  return {
    user: sanitizedUser,
    tokens,
  };
};
