import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { AdminUser } from "../models/AdminUser";
import { generateToken, getCookieOptions } from "../utils/jwt";
import { LoginInput } from "../validation/authSchema";
import { AuthenticatedRequest } from "../middleware/requireAuth";

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await AdminUser.findOne({ email: normalizedEmail }).select("+passwordHash");

    if (!user) {
      res.status(401).json({ error: { message: "Invalid credentials" } });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: { message: "Invalid credentials" } });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.cookie("token", token, getCookieOptions());
    res.status(200).json({ token, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie("token", getCookieOptions());
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: { message: "Unauthorized" } });
      return;
    }
    res.status(200).json({ email: req.user.email });
  } catch (error) {
    next(error);
  }
};
