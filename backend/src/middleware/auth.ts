import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import { verifyToken } from "../utils/jwt";

// Passport already augments Express.Request with a `user?: Express.User`
// property. Rather than re-declaring `user` on Request (which conflicts
// with Passport's declaration), we extend Passport's Express.User
// interface itself so it carries all of IUser's fields.
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUser {}
  }
}

// Alias kept so existing `import { AuthRequest }` usages elsewhere
// (adminController.ts, adminRoutes.ts) don't need to change.
export type AuthRequest = Request;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization token missing.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
    return;
  }

  next();
};