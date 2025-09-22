type RiskResponse = {
  score: number;
  metrics: {
    tvl: number;
    collateral_ratio: number;
    liquidations: number;
    oracle_spread: number;
  };
};
type SentimentResponse = {
  score: number;
  metrics: { twitter: number; reddit: number; telegram: number; news: number };
};
type FusionResponse = {
  score: number;
  weights: { financial_pct: number; sentiment_pct: number };
  confidence: number;
  notes: string;
  trend: { t: string; v: number }[];
};

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init).catch(() => null as any);
  if (!res || !res.ok) throw new Error("network");
  return res.json();
}

export async function getRisk(protocol: string): Promise<RiskResponse> {
  try {
    return await fetchJSON(`/api/risk/${protocol}`);
  } catch {
    return {
      score: 78,
      metrics: {
        tvl: 124_500_000,
        collateral_ratio: 165,
        liquidations: 12,
        oracle_spread: 0.8,
      },
    };
  }
}

export async function getSentiment(
  protocol: string,
): Promise<SentimentResponse> {
  try {
    return await fetchJSON(`/api/sentiment/${protocol}`);
  } catch {
    return {
      score: 64,
      metrics: { twitter: 0.62, reddit: 0.54, telegram: 0.58, news: 0.68 },
    };
  }
}

export async function getFusion(protocol: string): Promise<FusionResponse> {
  try {
    return await fetchJSON(`/api/fusion/${protocol}`);
  } catch {
    return {
      score: 72,
      weights: { financial_pct: 70, sentiment_pct: 30 },
      confidence: 88,
      notes: "Model v1.4-beta with BlockDAG oracle consensus.",
      trend: Array.from({ length: 30 }).map((_, i) => ({
        t: `${i}`,
        v: Math.round(50 + 20 * Math.sin(i / 4) + (Math.random() * 6 - 3)),
      })),
    };
  }
}

export async function getFeed(): Promise<any[]> {
  try {
    return await fetchJSON(`/api/oracle/feed`);
  } catch {
    const now = Date.now();
    return Array.from({ length: 8 }).map((_, i) => ({
      protocol: "aegis",
      fusion_risk_index: Math.round(55 + Math.random() * 30),
      tx_hash: `0x${(Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).slice(0, 64)}`,
      timestamp: new Date(now - i * 1000 * 60 * 7).toISOString(),
    }));
  }
}

export async function getAdminSettings(): Promise<{
  weights: { financial_pct: number; sentiment_pct: number };
  sources: {
    twitter: boolean;
    reddit: boolean;
    telegram: boolean;
    news: boolean;
  };
}> {
  try {
    return await fetchJSON(`/api/admin/settings`);
  } catch {
    return {
      weights: { financial_pct: 70, sentiment_pct: 30 },
      sources: { twitter: true, reddit: true, telegram: true, news: true },
    };
  }
}

export async function postUpdateWeights(body: {
  financial_pct: number;
  sentiment_pct: number;
}) {
  try {
    await fetchJSON(`/api/admin/updateWeights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return true;
  } catch {
    return false;
  }
}

export async function postUpdateSources(body: {
  twitter: boolean;
  reddit: boolean;
  telegram: boolean;
  news: boolean;
}) {
  try {
    await fetchJSON(`/api/admin/updateSources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return true;
  } catch {
    return false;
  }
}
