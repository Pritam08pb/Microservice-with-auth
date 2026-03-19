import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_SESSIONS = 5; // limit per user

export const loginUser = async (
  email: string,
  password: string,
  meta?: { device?: string; ip?: string; userAgent?: string }
) => {
  // 1️⃣ Find user
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new ApiError(404, "User not found");

  // 2️⃣ Validate password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  // 3️⃣ Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const hashedToken = hashToken(refreshToken);

  // 4️⃣ Use transaction (IMPORTANT 🔥)
  await prisma.$transaction(async (tx) => {
    // 🧹 delete expired tokens
    await tx.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });

    // 📊 limit active sessions
    const activeTokens = await tx.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    if (activeTokens.length >= MAX_SESSIONS) {
      // delete oldest session
      await tx.refreshToken.delete({
        where: { id: activeTokens[0]!.id },
      });
    }

    // 5️⃣ store new refresh token
    await tx.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),

        // 🔥 metadata
    
      },
    });
  });

  return { accessToken, refreshToken };
};