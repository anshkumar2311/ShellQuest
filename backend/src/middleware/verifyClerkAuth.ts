import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * Verifies the Clerk session token sent as "Authorization: Bearer <token>".
 * On success, attaches req.userId so downstream routes know who's asking.
 */
export async function verifyClerkAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = header.replace("Bearer ", "");

    const claims = await clerkClient.verifyToken(token);
    if (!claims?.sub) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = claims.sub; // Clerk user id
    next();
  } catch (err) {
    return res.status(401).json({ error: "Auth verification failed" });
  }
}

/**
 * Same idea but for Socket.io handshake (used by the terminal socket).
 * Returns the userId or null.
 */
export async function verifyClerkSocketToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const claims = await clerkClient.verifyToken(token);
    return claims?.sub ?? null;
  } catch {
    return null;
  }
}
