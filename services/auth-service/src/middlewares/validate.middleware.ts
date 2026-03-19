import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: any) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = schema.parse(req.body);

    req.body = data;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.issues.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};