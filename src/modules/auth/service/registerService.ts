import {
  createUser,
  findUserByEmail,
  type CreatedUserResult,
} from "../repository/repoSignup.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { PasswordService } from "../utils/hash.js";
import { TokenService } from "../utils/tokenService.js";
import { TokenRotationRepository } from "../repository/repoTokenRotation.js";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export const register = async (
  data: RegisterUserData,
): Promise<{
  user: CreatedUserResult;
  tokens: { accessToken: string; refreshToken: string };
}> => {
  const userExist = await findUserByEmail(data.email);
  if (userExist) {
    throw new ApiError(409, "User already exists");
  }

  const hash = await PasswordService.hash(data.password);
  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash: hash,
  });

  const tokens = TokenService.generateTokenPair({
    userId: user.id,
    roles: user.roles,
  });

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await TokenRotationRepository.saveToken(
    user.id,
    tokens.refreshToken,
    sevenDaysFromNow,
  );

  return { user, tokens };
};
