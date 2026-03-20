// InteractionOverlay.jsx — modal dialogs for quest-specific interactions
import React from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
  fontFamily: "KenneyFutureNarrow, monospace",
};

const boxStyle = {
  background: "#1a1a2e",
  border: "2px solid #4a3f6b",
  borderRadius: 4,
  padding: "28px 32px",
  minWidth: 320,
  maxWidth: 420,
  color: "#e8e0ff",
  textAlign: "center",
};

const titleStyle = {
  fontSize: 14,
  letterSpacing: 3,
  color: "#b09fff",
  marginBottom: 12,
  textTransform: "uppercase",
};

const bodyStyle = {
  fontSize: 11,
  lineHeight: 1.7,
  color: "#ccc8e0",
  marginBottom: 20,
};

const btnRow = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
};

const btn = (accent = "#7c5cbf") => ({
  background: accent,
  border: "none",
  borderRadius: 3,
  color: "#fff",
  padding: "8px 20px",
  fontSize: 10,
  letterSpacing: 2,
  cursor: "pointer",
  fontFamily: "KenneyFutureNarrow, monospace",
  textTransform: "uppercase",
});

// ─────────────────────────────────────────────────────────────────────────────

function MessageDialog({ title, body, onClose }) {
  return (
    <div style={boxStyle}>
      <div style={titleStyle}>{title ?? "Message"}</div>
      <div style={bodyStyle}>{body ?? ""}</div>
      <div style={btnRow}>
        <button style={btn()} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

function AltarDialog({ quest, useAltar, onClose }) {
  if (quest.altarUsed) {
    return (
      <div style={boxStyle}>
        <div style={titleStyle}>⬡ Ancient Altar</div>
        <div style={bodyStyle}>
          The altar glows faintly. The sacrifice has already been made.
          <br />
          The passage to the next chamber is open.
        </div>
        <div style={btnRow}>
          <button style={btn()} onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <div style={titleStyle}>⬡ Ancient Altar</div>
      <div style={bodyStyle}>
        Dark runes pulse on the stone surface.
        <br />A voice whispers:{" "}
        <em>"Sacrifice your life force to open the way."</em>
        <br />
        <br />
        <strong style={{ color: "#ff6b6b" }}>Costs 10 HP</strong> to activate.
      </div>
      <div style={btnRow}>
        <button
          style={btn("#9b2335")}
          onClick={() => {
            const result = useAltar();
            if (result === "notenough") {
              alert("Not enough HP to sacrifice!");
            }
            onClose();
          }}
        >
          SACRIFICE
        </button>
        <button style={btn("#444")} onClick={onClose}>
          LEAVE
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function KnightSpiritDialog({ quest, setQuest, onClose }) {
  const talked = quest.knightSpiritTalked;

  return (
    <div style={boxStyle}>
      <div style={titleStyle}>👻 Knight Spirit</div>
      {!talked ? (
        <>
          <div style={bodyStyle}>
            A translucent knight blocks your path.
            <br />
            <br />
            <em>
              "Adventurer... I have waited long. This dungeon holds three
              ancient{" "}
              <strong style={{ color: "#ffd700" }}>Symbol Pieces</strong>.
              Gather them all and the way forward shall open."
            </em>
            <br />
            <br />
            <strong style={{ color: "#ffd700" }}>
              Quest: Collect 3 Symbol Pieces
            </strong>
            <br />
            <span style={{ fontSize: 10, color: "#999" }}>
              — Symbol 1: Hidden chest in Room 3 (pull the lever first)
              <br />
              — Symbol 2: Dropped by the guardians of Room 4<br />— Symbol 3:
              Behind the secret wall in Room 5
            </span>
          </div>
          <div style={btnRow}>
            <button
              style={btn("#4a7c59")}
              onClick={() => {
                setQuest({ knightSpiritTalked: true });
                onClose();
              }}
            >
              ACCEPT QUEST
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={bodyStyle}>
            The knight spirit nods at you.
            <br />
            <br />
            <em>
              "You have collected{" "}
              <strong style={{ color: "#ffd700" }}>
                {quest.symbolPieces}/3 Symbol Pieces
              </strong>
              .
              {quest.symbolPieces < 3
                ? " Keep searching."
                : " You may now pass — the way is open!"}
            </em>
          </div>
          <div style={btnRow}>
            <button style={btn()} onClick={onClose}>
              CLOSE
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function LeverDialog({ quest, pullLever, onClose }) {
  if (quest.leverPulled) {
    return (
      <div style={boxStyle}>
        <div style={titleStyle}>⚙ Wall Lever</div>
        <div style={bodyStyle}>
          The lever is already pulled. Somewhere in the room, spikes have
          revealed a hidden mechanism.
        </div>
        <div style={btnRow}>
          <button style={btn()} onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <div style={titleStyle}>⚙ Wall Lever</div>
      <div style={bodyStyle}>
        A rusty lever protrudes from the wall.
        <br />
        You hear a faint grinding sound from the floor nearby.
        <br />
        <br />
        <strong style={{ color: "#ffaa44" }}>Pull the lever?</strong>
      </div>
      <div style={btnRow}>
        <button
          style={btn("#b07030")}
          onClick={() => {
            pullLever();
            onClose();
          }}
        >
          PULL
        </button>
        <button style={btn("#444")} onClick={onClose}>
          LEAVE
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ChestDialog({ quest, collectSymbol, symbol, onClose }) {
  const alreadyCollected = quest.symbolPieces >= symbol;

  return (
    <div style={boxStyle}>
      <div style={titleStyle}>📦 Ancient Chest</div>
      {alreadyCollected ? (
        <div style={bodyStyle}>The chest is empty.</div>
      ) : !quest.leverPulled ? (
        <div style={bodyStyle}>
          The chest is sealed. A faint inscription reads:
          <br />
          <em>"The lever reveals the way."</em>
        </div>
      ) : (
        <div style={bodyStyle}>
          You open the chest and find a glowing shard!
          <br />
          <strong style={{ color: "#ffd700" }}>
            Symbol Piece {symbol} obtained!
          </strong>
        </div>
      )}
      <div style={btnRow}>
        {!alreadyCollected && quest.leverPulled && (
          <button
            style={btn("#4a7c59")}
            onClick={() => {
              collectSymbol(symbol);
              onClose();
            }}
          >
            TAKE
          </button>
        )}
        <button style={btn("#444")} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SecretWallDialog({ quest, setQuest, revealSecretExitDoor, onClose }) {
  return (
    <div style={boxStyle}>
      <div style={titleStyle}>🔍 Secret Passage</div>
      {quest.secretWallFound ? (
        <div style={bodyStyle}>The hidden passage is open.</div>
      ) : (
        <div style={bodyStyle}>
          You notice the brickwork here is different from the rest of the wall —
          the mortar is crumbling and there are scuff marks on the floor.
          <br />
          <br />
          <strong style={{ color: "#80e0ff" }}>
            Secret passage discovered!
          </strong>
        </div>
      )}
      <div style={btnRow}>
        {!quest.secretWallFound && (
          <button
            style={btn("#1a6080")}
            onClick={() => {
              setQuest({ secretWallFound: true });
              revealSecretExitDoor?.();
              onClose();
            }}
          >
            ENTER
          </button>
        )}
        <button style={btn("#444")} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function HintNpcDialog({ quest, onClose }) {
  return (
    <div style={boxStyle}>
      <div style={titleStyle}>🗣 Mysterious Wanderer</div>
      <div style={bodyStyle}>
        {!quest.knightSpiritTalked ? (
          <>
            An old wanderer looks up at you.
            <br />
            <br />
            <em>
              "I sense great power in these halls. Speak with the spirit further
              ahead — he guards the ancient knowledge."
            </em>
          </>
        ) : quest.symbolPieces >= 3 ? (
          <>
            <em>
              "You have gathered all the symbols! The stairs await you,
              adventurer."
            </em>
          </>
        ) : (
          <>
            The wanderer lowers his voice.
            <br />
            <br />
            <em>
              "Listen carefully... in the{" "}
              <strong style={{ color: "#80e0ff" }}>last chamber</strong>, beyond
              the two guardian rooms, there is a{" "}
              <strong style={{ color: "#80e0ff" }}>hidden passage</strong>. Look
              for crumbling brickwork in the western wall. A great treasure lies
              beyond."
            </em>
          </>
        )}
      </div>
      <div style={btnRow}>
        <button style={btn()} onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function InteractionOverlay({
  interaction,
  quest,
  useAltar,
  pullLever,
  collectSymbol,
  collectInvisPotion,
  setQuest,
  revealSecretExitDoor,
  onClose,
}) {
  if (!interaction) return null;

  const content = (() => {
    switch (interaction.type) {
      case "message":
        return (
          <MessageDialog
            title={interaction.title}
            body={interaction.body}
            onClose={onClose}
          />
        );
      case "altar":
        return (
          <AltarDialog quest={quest} useAltar={useAltar} onClose={onClose} />
        );
      case "knight_spirit":
        return (
          <KnightSpiritDialog
            quest={quest}
            setQuest={setQuest}
            onClose={onClose}
          />
        );
      case "lever":
        return (
          <LeverDialog quest={quest} pullLever={pullLever} onClose={onClose} />
        );
      case "chest":
        return (
          <ChestDialog
            quest={quest}
            collectSymbol={collectSymbol}
            symbol={interaction.symbol ?? 1}
            onClose={onClose}
          />
        );
      case "secret_wall":
        return (
          <SecretWallDialog
            quest={quest}
            setQuest={setQuest}
            revealSecretExitDoor={revealSecretExitDoor}
            onClose={onClose}
          />
        );
      case "hint_npc":
        return <HintNpcDialog quest={quest} onClose={onClose} />;
      default:
        return null;
    }
  })();

  if (!content) return null;

  return (
    <div
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {content}
    </div>
  );
}
