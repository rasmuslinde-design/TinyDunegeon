// Victory Screen
import React, { useEffect, useMemo, useState } from "react";
import { useGameStore } from "../../store/gameStore.js";
import { play } from "../../systems/sound.js";
import { useLeaderboard } from "../../contexts/LeaderboardContext.jsx";

export default function WinScreen() {
  const player = useGameStore((s) => s.player);
  const resetGame = useGameStore((s) => s.resetGame);

  const endRun = useGameStore((s) => s.endRun);
  const getFinalScore = useGameStore((s) => s.getFinalScore);
  const { state: lb, submit } = useLeaderboard();

  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => getFinalScore(), [getFinalScore]);

  useEffect(() => {
    endRun();
  }, [endRun]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, #1a2a0a 0%, #0a0a0f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "KenneyFuture, monospace",
      }}
    >
      {/* Star burst */}
      <div
        style={{
          fontSize: 32,
          marginBottom: 8,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        ★ ★ ★
      </div>
      <div
        style={{
          fontSize: 44,
          color: "#fbbf24",
          textShadow: "0 0 30px rgba(251,191,36,0.8)",
          letterSpacing: 4,
          marginBottom: 8,
          animation: "titleDrop 0.7s ease-out",
        }}
      >
        VICTORY!
      </div>
      <div
        style={{
          color: "#666",
          fontSize: 10,
          letterSpacing: 3,
          marginBottom: 36,
        }}
      >
        THE DUNGEON IS CLEARED
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(251,191,36,0.15)",
          borderRadius: 8,
          padding: "16px 28px",
          marginBottom: 36,
          textAlign: "center",
          fontFamily: "KenneyFutureNarrow, monospace",
        }}
      >
        <div
          style={{
            color: "#fbbf24",
            fontSize: 9,
            marginBottom: 10,
            letterSpacing: 2,
          }}
        >
          ★ CHAMPION STATS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 20px",
          }}
        >
          {[
            ["Hero Level", player.level],
            ["Character", player.charId],
            ["Total XP", player.xp],
            ["Gold Earned", player.gold],
            ["Attack Power", player.atk + (player.weapon?.damage ?? 0)],
            ["Weapon", player.weapon?.label ?? "Sword"],
            ["Score", score],
          ].map(([label, value]) => (
            <React.Fragment key={label}>
              <div style={{ color: "#666", fontSize: 9, textAlign: "right" }}>
                {label}
              </div>
              <div
                style={{
                  color: "#ddd",
                  fontSize: 9,
                  textTransform: "capitalize",
                }}
              >
                {value}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div
        style={{
          width: 420,
          maxWidth: "92vw",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(251,191,36,0.15)",
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 24,
          fontFamily: "KenneyFutureNarrow, monospace",
        }}
      >
        <div style={{ color: "#fbbf24", fontSize: 9, letterSpacing: 2 }}>
          SUBMIT YOUR SCORE
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              flex: 1,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#ddd",
              padding: "10px 10px",
              borderRadius: 6,
              fontFamily: "KenneyFutureNarrow, monospace",
              fontSize: 10,
              letterSpacing: 1,
              outline: "none",
            }}
            maxLength={18}
          />
          <button
            disabled={lb.submitting || submitted}
            onClick={async () => {
              const ok = await submit({
                name: (name.trim() || "Anonymous").slice(0, 18),
                score,
                result: "win",
                kills: useGameStore.getState().killCount,
                seconds: Math.round(
                  ((useGameStore.getState().runEndMs || Date.now()) -
                    (useGameStore.getState().runStartMs || Date.now())) /
                    1000,
                ),
                levelReached: useGameStore.getState().currentLevelIndex + 1,
                charId: useGameStore.getState().player.charId,
                ts: Date.now(),
              });
              if (ok) {
                setSubmitted(true);
                play("select");
              } else {
                play("click");
              }
            }}
            style={{
              background: "rgba(251,191,36,0.15)",
              border: "1px solid rgba(251,191,36,0.7)",
              color: "#fef08a",
              fontSize: 10,
              padding: "10px 14px",
              borderRadius: 6,
              cursor: lb.submitting || submitted ? "not-allowed" : "pointer",
              fontFamily: "KenneyFuture, monospace",
              letterSpacing: 2,
              opacity: lb.submitting || submitted ? 0.6 : 1,
            }}
          >
            {submitted ? "POSTED" : lb.submitting ? "SENDING..." : "POST"}
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          resetGame();
          play("select");
        }}
        style={{
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(180,130,20,0.35))",
          border: "2px solid #fbbf24",
          color: "#fef08a",
          fontSize: 12,
          padding: "12px 36px",
          borderRadius: 5,
          cursor: "pointer",
          fontFamily: "KenneyFuture, monospace",
          letterSpacing: 3,
          boxShadow: "0 0 20px rgba(251,191,36,0.35)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.04)";
          play("click");
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
        }}
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
