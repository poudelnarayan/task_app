import { Request, Response, NextFunction } from "express";
import { UUID } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: UUID;
  token?: string;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      res
        .status(401)
        .json({ msg: "No authentication token, authorization denied" });
      return;
    }

    const verified = jwt.verify(token, "passwordKey");
    if (!verified) {
      res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied" });
      return;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, (verified as any).id));
    if (!user) {
      res.status(401).json({ msg: "User not found, authorization denied" });
      return;
    }

    req.user = (verified as any).id;
    req.token = token;

    next();
  } catch (err: any) {
    res.status(500).json(false);
  }
};
