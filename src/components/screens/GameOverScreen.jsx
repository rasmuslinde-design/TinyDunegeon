// Game Over Screen
import React, { useEffect, useMemo, useState } from "react";
import { useGameStore } from "../../store/gameStore.js";
import { play } from "../../systems/sound.js";

export default function GameOverScreen() {
  const player = useGameStore((s) => s.player);
  const resetGame = useGameStore((s) => s.resetGame);
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex);

  const endRun = useGameStore((s) => s.endRun);
  const getFinalScore = useGameStore((s) => s.getFinalScore);
  const submitScore = useGameStore((s) => s.submitScore);
  const fetchLeaderboard = useGameStore((s) => s.fetchLeaderboard);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const submittingScore = useGameStore((s) => s.submittingScore);

  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => getFinalScore(), [getFinalScore]);

  useEffect(() => {
    endRun();
    fetchLeaderboard(10);
  }, [endRun, fetchLeaderboard]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, #2a0a0a 0%, #0a0a0f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "KenneyFuture, monospace",
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: "#ef4444",
          textShadow: "0 0 30px rgba(239,68,68,0.8)",
          letterSpacing: 4,
          marginBottom: 8,
          animation: "titleDrop 0.6s ease-out",
        }}
      >
        YOU DIED
      </div>

      <div
        style={{
          color: "#555",
          fontSize: 10,
          letterSpacing: 3,
          marginBottom: 40,
        }}
      >
        YOUR ADVENTURE ENDS HERE
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "16px 28px",
          marginBottom: 36,
          textAlign: "center",
          fontFamily: "KenneyFutureNarrow, monospace",
        }}
      >
        <div
          style={{
            color: "#aaa",
            fontSize: 9,
            marginBottom: 10,
            letterSpacing: 2,
          }}
        >
          FINAL STATS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 20px",
          }}
        >
          {[
            ["Level Reached", player.level],
            ["Dungeon Floor", currentLevelIndex + 1],
            ["XP Earned", player.xp],
            ["Gold Collected", player.gold],
            ["Score", score],
          ].map(([label, value]) => (
            <React.Fragment key={label}>
              <div style={{ color: "#555", fontSize: 9, textAlign: "right" }}>
                {label}
              </div>
              <div style={{ color: "#ddd", fontSize: 9 }}>{value}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Score submit */}
      <div
        style={{
          width: 420,
          maxWidth: "92vw",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 18,
          fontFamily: "KenneyFutureNarrow, monospace",
        }}
      >
        <div style={{ color: "#aaa", fontSize: 9, letterSpacing: 2 }}>
          SUBMIT TO LEADERBOARD
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
            disabled={submittingScore || submitted}
            onClick={async () => {
              const ok = await submitScore({
                name: name.trim() || "Anonymous",
                result: "gameover",
              });
              if (ok) {
                setSubmitted(true);
                play("select");
              } else {
                play("click");
              }
            }}
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.55)",
              color: "#fca5a5",
              fontSize: 10,
              padding: "10px 14px",
              borderRadius: 6,
              cursor: submittingScore || submitted ? "not-allowed" : "pointer",
              fontFamily: "KenneyFuture, monospace",
              letterSpacing: 2,
              opacity: submittingScore || submitted ? 0.6 : 1,
            }}
          >
            {submitted ? "POSTED" : submittingScore ? "SENDING..." : "POST"}
          </button>
        </div>
        <div style={{ color: "#555", fontSize: 9, marginTop: 10 }}>
          If the API is offline, the game still works — the post just won’t
          save.
        </div>
      </div>

      {/* Leaderboard */}
      <div
        style={{
          width: 420,
          maxWidth: "92vw",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 28,
          fontFamily: "KenneyFutureNarrow, monospace",
        }}
      >
        <div style={{ color: "#aaa", fontSize: 9, letterSpacing: 2 }}>
          TOP 10
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: "#ddd" }}>
          {Array.isArray(leaderboard) ? (
            leaderboard.length ? (
              <div style={{ display: "grid", gap: 6 }}>
                {leaderboard.slice(0, 10).map((row, idx) => (
                  <div
                    key={row.id ?? `${row.name}_${idx}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28px 1fr auto",
                      gap: 10,
                      alignItems: "center",
                      padding: "6px 8px",
                      background: "rgba(0,0,0,0.25)",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ color: "#555" }}>{idx + 1}.</div>
                    <div style={{ textTransform: "none" }}>
                      {row.name ?? "Anonymous"}
                    </div>
                    <div style={{ color: "#fca5a5" }}>{row.score ?? 0}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#666" }}>No scores yet. Be the first.</div>
            )
          ) : (
            <div style={{ color: "#666" }}>Leaderboard unavailable.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => {
            resetGame();
            play("select");
          }}
          style={{
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(180,30,30,0.35))",
            border: "2px solid #ef4444",
            color: "#fca5a5",
            fontSize: 11,
            padding: "10px 28px",
            borderRadius: 5,
            cursor: "pointer",
            fontFamily: "KenneyFuture, monospace",
            letterSpacing: 2,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.04)";
            play("click");
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
