import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import FusionLineChart from "../components/charts/FusionLineChart";
import { Gauge } from "../components/charts/Gauge";
import UpdatesFeed from "../components/feed/UpdatesFeed";
import { getFeed, getFusion, getRisk, getSentiment } from "../lib/api";
import { Label } from "../components/ui/label";

// Band colors (emphasize danger with strong reds)
function bandColors(v: number) {
  if (v <= 40) return { from: "#10b981", to: "#22d3ee" }; // green → cyan
  if (v <= 70) return { from: "#f59e0b", to: "#f97316" }; // yellow → orange
  return { from: "#b91c1c", to: "#ef4444" }; // deep red
}

// Example protocols
const PROTOCOLS = [
  { id: "aegis", name: "Aegis Finance" },
  { id: "novalend", name: "NovaLend" },
  { id: "orbitx", name: "OrbitX" },
  { id: "synthia", name: "Synthia" },
];

// Example tokens (mapped to protocols)
const TOKENS = [
  { id: "eth", name: "Ethereum", protocol: "aegis" },
  { id: "usdc", name: "USD Coin", protocol: "novalend" },
  { id: "btc", name: "Bitcoin", protocol: "orbitx" },
  { id: "synth", name: "Synthia", protocol: "synthia" },
];

export default function Index() {
  // Active selections
  const [activeToken, setActiveToken] = useState(TOKENS[0]);
  const [activeProtocol, setActiveProtocol] = useState(PROTOCOLS[0].id);

  const [risk, setRisk] = useState<any>(null);
  const [sent, setSent] = useState<any>(null);
  const [fusion, setFusion] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch API data whenever token or protocol changes
  useEffect(() => {
    if (!activeToken || !activeProtocol) return;
    let mounted = true;
    setLoading(true);

    Promise.all([
      getRisk(activeProtocol),
      getSentiment(activeProtocol),
      getFusion(activeProtocol),
      getFeed(),
    ])
      .then(([r, s, f, fd]) => {
        if (!mounted) return;
        setRisk(r);
        setSent(s);
        setFusion(f);
        setFeed(fd);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [activeToken, activeProtocol]);

  const trend = useMemo(() => fusion?.trend ?? [], [fusion]);
  const riskColors = bandColors(risk?.score ?? 0);
  const sentColors = bandColors(sent?.score ?? 0);
  const fusionColors = bandColors(fusion?.score ?? 0);

  return (
    <Layout>
      {/* Token buttons + Protocol select */}
      <div className="flex items-center justify-between mb-4">
        {/* Token Selector */}
        <div className="flex gap-3">
          {TOKENS.map((token) => (
            <button
              key={token.id}
              onClick={() => setActiveToken(token)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                activeToken.id === token.id
                  ? "bg-primary text-white"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              {token.name}
            </button>
          ))}
        </div>

        {/* Protocol Selector */}
        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="protocol">Protocol</Label>
          <select
            id="protocol"
            value={activeProtocol}
            onChange={(e) => setActiveProtocol(e.target.value)}
            className="bg-background border border-border rounded-md px-2 py-1"
          >
            {PROTOCOLS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fusion Risk Index + Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">
              {activeToken.name} Fusion Risk Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge
              value={fusion?.score ?? 0}
              label={activeToken.name}
              colorFrom={fusionColors.from}
              colorTo={fusionColors.to}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div>Confidence</div>
              <div className="text-right text-foreground">
                {fusion?.confidence ?? "—"}%
              </div>
              <div className="col-span-2">{fusion?.notes ?? ""}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{activeToken.name} Fusion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !trend.length ? (
              <div className="text-sm text-muted-foreground">
                Loading chart...
              </div>
            ) : (
              <FusionLineChart data={trend} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk + Sentiment + Oracle */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{activeToken.name} DeFi Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge
              value={risk?.score ?? 0}
              label={activeToken.name}
              colorFrom={riskColors.from}
              colorTo={riskColors.to}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{activeToken.name} Sentiment Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge
              value={sent?.score ?? 0}
              label={activeToken.name}
              colorFrom={sentColors.from}
              colorTo={sentColors.to}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{activeToken.name} Oracle Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdatesFeed
              items={(feed ?? []).map((f: any, i: number) => ({
                id: String(i),
                timestamp: new Date(f.timestamp).toLocaleString(),
                tx: f.tx_hash,
                score: f.fusion_risk_index,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
