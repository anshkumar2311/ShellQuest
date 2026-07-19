import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Award, Lock } from "lucide-react";
import { createApiClient } from "../lib/api.js";

export default function BadgesTab() {
  const { getToken } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const api = createApiClient(getToken);
      const { data } = await api.get("/api/badges");
      setBadges(data.badges);
      setLoading(false);
    })();
  }, [getToken]);

  if (loading) return <p className="font-mono text-sm text-coffee-soft">loading badges…</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((b) => (
        <div
          key={b.name}
          className={
            "rounded-lg border p-5 " +
            (b.unlocked ? "border-hairline bg-card" : "border-hairline bg-sand-deep opacity-60")
          }
        >
          <div className="flex items-center justify-between mb-3">
            {b.unlocked ? <Award className="text-rust" size={22} /> : <Lock className="text-coffee-soft" size={20} />}
            {b.unlocked && b.unlockedDate && (
              <span className="text-xs font-mono text-coffee-soft">{b.unlockedDate}</span>
            )}
          </div>
          <h3 className="font-semibold text-[15px]">{b.name}</h3>
          <p className="text-sm text-coffee-soft mt-1">{b.description}</p>
        </div>
      ))}
    </div>
  );
}
