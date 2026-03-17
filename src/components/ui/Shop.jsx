// Shop / NPC dialog overlay
import React from "react";
import { useGameStore } from "../../store/gameStore.js";
import { SHOP_ITEMS } from "../../constants/sprites.js";
import { play } from "../../systems/sound.js";

const NPC_DIALOG = {
  merchant: {
    title: "Merchant",
    greeting: "Welcome, traveller! Browse my wares.",
  },
  trainer: { title: "Trainer", greeting: "I can teach you new techniques." },
  healer: { title: "Healer", greeting: "You look wounded. Let me help." },
};

export default function Shop({ npc, onClose }) {
  const player = useGameStore((s) => s.player);
  const buyItem = useGameStore((s) => s.buyItem);
  const healPlayer = useGameStore((s) => s.healPlayer);
  const dialog = NPC_DIALOG[npc?.type] ?? NPC_DIALOG.merchant;

  const handleBuy = (item) => {
    const ok = buyItem(item);
    if (ok) {
      play("buy");
      if (npc?.type === "healer" && item.type === "potion") {
        healPlayer(item.heal);
      }
    } else {
      play("click");
    }
  };

  // Healer sells potions only; trainer sells weapons; merchant sells all
  const items =
    npc?.type === "healer"
      ? SHOP_ITEMS.filter((i) => i.type === "potion")
      : npc?.type === "trainer"
        ? SHOP_ITEMS.filter((i) => i.type === "weapon" || i.type === "unlock")
        : SHOP_ITEMS;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        zIndex: 200,
        fontFamily: "KenneyFutureNarrow, monospace",
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #0f0f1e, #1a1a2e)",
          border: "2px solid #3b3b6b",
          borderRadius: 8,
          padding: 20,
          width: 320,
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 0 40px rgba(100,50,200,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ color: "#fbbf24", fontSize: 14, letterSpacing: 2 }}>
            ✦ {dialog.title.toUpperCase()}
          </div>
          <button
            onClick={() => {
              onClose();
              play("click");
            }}
            style={{
              background: "none",
              border: "1px solid #555",
              color: "#999",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "KenneyFutureNarrow, monospace",
            }}
          >
            ✕
          </button>
        </div>

        {/* Greeting */}
        <div
          style={{
            color: "#aaa",
            fontSize: 10,
            marginBottom: 14,
            padding: "8px 10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 4,
            fontStyle: "italic",
          }}
        >
          "{dialog.greeting}"
        </div>

        {/* Gold */}
        <div
          style={{
            color: "#fbbf24",
            fontSize: 10,
            marginBottom: 10,
            textAlign: "right",
          }}
        >
          💰 Your Gold: {player.gold}
        </div>

        {/* Items */}
        {items.map((item) => {
          const canAfford = player.gold >= item.cost;
          const owned =
            item.type === "weapon" && player.weapon?.id === item.weaponId;
          const unlocked =
            item.type === "unlock" &&
            player.inventory.some((i) => i.charId === item.charId);

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 10px",
                marginBottom: 6,
                background:
                  owned || unlocked
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${owned || unlocked ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 4,
              }}
            >
              <div>
                <div style={{ color: "#ddd", fontSize: 10 }}>{item.label}</div>
                <div style={{ color: "#666", fontSize: 8 }}>
                  {item.type === "weapon" && `⚔ Weapon`}
                  {item.type === "potion" && `♥ Restores ${item.heal} HP`}
                  {item.type === "unlock" && `★ Unlock Character`}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#fbbf24", fontSize: 10 }}>
                  💰{item.cost}
                </span>
                {owned || unlocked ? (
                  <span style={{ color: "#22c55e", fontSize: 8 }}>✓ OWNED</span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    style={{
                      background: canAfford
                        ? "rgba(168,85,247,0.25)"
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${canAfford ? "#a855f7" : "#333"}`,
                      color: canAfford ? "#c084fc" : "#555",
                      borderRadius: 3,
                      padding: "3px 8px",
                      fontSize: 8,
                      cursor: canAfford ? "pointer" : "default",
                      fontFamily: "KenneyFutureNarrow, monospace",
                      letterSpacing: 1,
                    }}
                  >
                    BUY
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
