import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "../db/prisma";

async function ensureUserSync(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    
    let name = clerkUser.firstName 
      ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() 
      : clerkUser.username;
      
    if (!name) {
      if (email) {
        name = email.split('@')[0];
      } else {
        throw new Error("Clerk user must have a name, username, or email");
      }
    }
      
    await prisma.user.create({
      data: {
        id: userId,
        email,
        name
      }
    });
  }
}

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

    await ensureUserSync(claims.sub);
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
    if (claims?.sub) {
      await ensureUserSync(claims.sub);
      return claims.sub;
    }
    return null;
  } catch {
    return null;
  }
}
