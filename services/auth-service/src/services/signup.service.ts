import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

const SALT_ROUNDS = 10;

export const signupUser = async (email: string, password: string) => {
  // 1️⃣ normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // 2️⃣ check existing user
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new ApiError(400, "User already exists");
  }

  // 3️⃣ hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 4️⃣ create user (transaction safe for future expansion)
  const user = await prisma.$transaction(async (tx) => {
    return tx.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false, // future email verification
      },
    });
  });

  return user;
};