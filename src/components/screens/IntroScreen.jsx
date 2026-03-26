import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "../../store/gameStore.js";

const INTRO_DONE_MESSAGE = "TINYDUNGEON_INTRO_DONE";

function isSafeIntroOrigin(origin) {
  // Same-origin when hosted on the same domain. In dev it's also same-origin.
  try {
    return origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function IntroScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [ready, setReady] = useState(false);
  const iframeRef = useRef(null);

  const introUrl = useMemo(() => {
    // Loaded from /public/intro/index.html
    return "/intro/index.html";
  }, []);

  useEffect(() => {
    function onMsg(event) {
      if (!isSafeIntroOrigin(event.origin)) return;
      if (event?.data?.type === INTRO_DONE_MESSAGE) {
        setScreen("title");
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [setScreen]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
      }}
    >
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontFamily: "KenneyFutureNarrow, monospace",
            letterSpacing: "2px",
            zIndex: 2,
          }}
        >
          Laen intro...
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Intro"
        src={introUrl}
        onLoad={() => setReady(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          background: "#000",
        }}
        allow="autoplay; fullscreen; xr-spatial-tracking; gamepad"
      />

      {/* Emergency skip (doesn't break intro; useful for testing) */}
      <button
        type="button"
        onClick={() => setScreen("title")}
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          zIndex: 3,
          padding: "10px 14px",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "KenneyFutureNarrow, monospace",
        }}
      >
        Skip
      </button>
    </div>
  );
}
