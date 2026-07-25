import jwt from "jsonwebtoken";
import { CookieOptions } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_12345";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET || "fallback_super_secret_jwt_key_12345";
  return jwt.verify(token, secret) as JwtPayload;
};

export const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};
