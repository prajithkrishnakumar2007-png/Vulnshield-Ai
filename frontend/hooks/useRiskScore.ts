import { useState } from "react";
import { fetchApi } from "../lib/api";

export function useRiskScore() {
  const [recomputing, setRecomputing] = useState(false);

  const recomputeScores = async () => {
    setRecomputing(true);
    try {
      const res = await fetchApi<{ status: string; recomputed_count: number }>("/risk-scoring/recompute", {
        method: "POST"
      });
      return res;
    } finally {
      setRecomputing(false);
    }
  };

  return { recomputing, recomputeScores };
}
