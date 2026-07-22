import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { prisma } from "../db/prisma";

const router = Router();

// GET /api/badges
router.get("/", verifyClerkAuth, async (req, res) => {
  const all = await prisma.badge.findMany({
    select: {
      name: true,
      description: true,
      difficulty: true,
      xp: true,
      target: true,
      type: true,
      userBadges: {
        where: {
          userId: req.userId!
        },
        select: {
          unlockedAt: true,
          progress: true
        }
      }
    }
  })

  const badges = all.map((b) => ({
    name: b.name,
    description: b.description,
    difficulty: b.difficulty,
    xp: b.xp,
    target: b.target,
    type: b.type,
    unlocked: b.userBadges.length > 0 && b.userBadges[0].progress >= b.target,
    progress: b.userBadges.length > 0 ? b.userBadges[0].progress : 0,
    unlockedDate: (b.userBadges.length > 0 && b.userBadges[0].progress >= b.target) ? b.userBadges[0].unlockedAt : null,
  }))

  res.json({ badges });
});

export default router;
