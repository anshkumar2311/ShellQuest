import { Router } from "express";
import { verifyClerkAuth } from "../middleware/verifyClerkAuth";
import { getUnlockedBadges } from "../services/dbService";

const router = Router();

// Master list of all badges the app can award, with descriptions.
const ALL_BADGES = [
  { name: "First Task", description: "Complete your first daily task." },
  { name: "5 Tasks Done", description: "Complete 5 daily tasks." },
  { name: "Perfect Quiz", description: "Score 5/5 on any quiz." },
];

// GET /api/badges
router.get("/", verifyClerkAuth, async (req, res) => {
  const unlocked = await getUnlockedBadges(req.userId!);
  const unlockedMap = new Map(unlocked.map((b) => [b.badge_name, b.unlocked_date]));

  const badges = ALL_BADGES.map((b) => ({
    ...b,
    unlocked: unlockedMap.has(b.name),
    unlockedDate: unlockedMap.get(b.name)
      ? new Date(unlockedMap.get(b.name)).toISOString().slice(0, 10)
      : null,
  }));

  res.json({ badges });
});

export default router;
