// Simple leaderboard API wrapper (fetch)
// Uses Vite env var when available: VITE_LEADERBOARD_API
// Fallback is empty string; calls will fail gracefully and return null/false.

const BASE_URL = (import.meta.env.VITE_LEADERBOARD_API || "").replace(
  /\/$/,
  "",
);

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(limit = 10) {
  if (!BASE_URL) return null;
  try {
    const res = await fetch(`${BASE_URL}/scores?limit=${limit}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await safeJson(res);
  } catch {
    return null;
  }
}

export async function postScore(payload) {
  if (!BASE_URL) return false;
  try {
    const res = await fetch(`${BASE_URL}/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
