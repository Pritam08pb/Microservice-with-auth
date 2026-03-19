import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashToken } from "../utils/token";

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  const hashed = hashToken(refreshToken);

  const token = await prisma.refreshToken.findUnique({
    where: { token: hashed },
  });

  if (!token) {
    // don't reveal too much info (security)
    return;
  }
  await prisma.refreshToken.delete({
    where: { id: token.id },
  });
};
