import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token";

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;

export const refreshAuth = async (
  refreshToken: string,
  meta?: { device?: string; ip?: string; userAgent?: string },
) => {
  if (!refreshToken) throw new ApiError(401, "No refresh token");

  let payload: any;

  // 1️⃣ Verify JWT
  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const hashed = hashToken(refreshToken);

  // 2️⃣ Find token in DB
  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashed },
  });

  // 🚨 REUSE DETECTION (IMPORTANT)
  if (!stored) {
    // token not found → possible reuse attack
    await prisma.refreshToken.updateMany({
      where: { userId: payload.userId },
      data: { isRevoked: true },
    });

    throw new ApiError(
      401,
      "Refresh token reuse detected. All sessions revoked.",
    );
  }

  if (stored.isRevoked) {
    throw new ApiError(401, "Token already revoked");
  }

  if (stored.expiresAt < new Date()) {
    throw new ApiError(401, "Token expired");
  }

  // 3️⃣ Check user exists
  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
  });

  if (!user) throw new ApiError(401, "User no longer exists");

  // 4️⃣ Generate new tokens
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);
  const newHashed = hashToken(newRefreshToken);

  // 5️⃣ Transaction (CRITICAL 🔥)
  await prisma.$transaction(async (tx) => {
    // revoke old token
    await tx.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    // create new token
    await tx.refreshToken.create({
      data: {
        token: newHashed,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TTL),
      },
    });

    // cleanup expired tokens
    await tx.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
