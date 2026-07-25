import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  fields?: Record<string, string[]>;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled Error Logged:", err);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(err.fields ? { fields: err.fields } : {}),
    },
  });
};
