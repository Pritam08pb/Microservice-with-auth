import { loginUser } from "../services/login.service";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { refreshAuth } from "../services/token.service";
import { signupUser } from "../services/signup.service";
import { logoutUser } from "../services/logout.service";
import { getMe } from "../services/profile.service";

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await refreshAuth(refreshToken);

  res.status(200).json(tokens);
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await signupUser(email, password);

  res.status(201).json({
    message: "User created",
    user,
  });
});

export const logout = asyncHandler(async (req:Request, res:Response) => {
  const { refreshToken } = req.body;

  await logoutUser(refreshToken);

  res.status(200).json({
    message: "Logged out successfully",
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tokens = await loginUser(email, password, {
    device: req.headers["x-device"] as string,
    ...(req.ip && { ip: req.ip }),
    ...(req.headers["user-agent"] && { userAgent: req.headers["user-agent"] }),
  });
  logger.info(
    `User ${email} logged in from IP ${req.ip} using device ${req.headers["x-device"]}`,
  );
  res.status(200).json(tokens);
});



export const me = asyncHandler(async (req: any, res:Response) => {
  const userId = req.user.userId;

  const user = await getMe(userId);

  res.status(200).json({
    success: true,
    user,
  });
});