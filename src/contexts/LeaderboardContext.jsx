import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  fetchLeaderboard as apiFetchLeaderboard,
  postScore as apiPostScore,
} from "../services/leaderboardApi.js";

const LeaderboardContext = createContext(null);

const initialState = {
  rows: null,
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
  lastSubmitOk: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, rows: action.rows ?? [], error: null };
    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        rows: null,
        error: action.error || true,
      };

    case "SUBMIT_START":
      return {
        ...state,
        submitting: true,
        submitError: null,
        lastSubmitOk: false,
      };
    case "SUBMIT_DONE":
      return {
        ...state,
        submitting: false,
        submitError: action.ok ? null : action.error || true,
        lastSubmitOk: !!action.ok,
      };

    default:
      return state;
  }
}

export function LeaderboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadTop = useCallback(async (limit = 10) => {
    dispatch({ type: "FETCH_START" });
    const data = await apiFetchLeaderboard(limit);
    if (!data) {
      dispatch({ type: "FETCH_ERROR", error: "unavailable" });
      return null;
    }
    // Expected shape: array of { name, score, ... }
    dispatch({ type: "FETCH_SUCCESS", rows: Array.isArray(data) ? data : [] });
    return data;
  }, []);

  const submit = useCallback(
    async (payload, { refreshLimit = 10 } = {}) => {
      dispatch({ type: "SUBMIT_START" });
      const ok = await apiPostScore(payload);
      dispatch({ type: "SUBMIT_DONE", ok, error: ok ? null : "submit_failed" });
      if (ok) await loadTop(refreshLimit);
      return ok;
    },
    [loadTop],
  );

  const value = {
    state,
    loadTop,
    submit,
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const ctx = useContext(LeaderboardContext);
  if (!ctx) {
    throw new Error("useLeaderboard must be used within a LeaderboardProvider");
  }
  return ctx;
}
