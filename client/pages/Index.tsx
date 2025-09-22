import React, { useEffect, useMemo, useState } from "react";
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

function bandColors(v: number) {
  if (v <= 40) return { from: "#10b981", to: "#22d3ee" }; // green
  if (v <= 70) return { from: "#f59e0b", to: "#f97316" }; // yellow
  return { from: "#ef4444", to: "#f43f5e" }; // red
}

const PROTOCOLS = [
  { id: "aegis", name: "Aegis Finance" },
  { id: "novalend", name: "NovaLend" },
  { id: "orbitx", name: "OrbitX" },
  { id: "synthia", name: "Synthia" },
];

export default function Index() {
  const [protocol, setProtocol] = useState(PROTOCOLS[0].id);
  const [risk, setRisk] = useState<any>(null);
  const [sent, setSent] = useState<any>(null);
  const [fusion, setFusion] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getRisk(protocol),
      getSentiment(protocol),
      getFusion(protocol),
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
  }, [protocol]);

  const trend = useMemo(() => fusion?.trend ?? [], [fusion]);

  const riskColors = bandColors(risk?.score ?? 0);
  const sentColors = bandColors(sent?.score ?? 0);
  const fusionColors = bandColors(fusion?.score ?? 0);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-2">
        <div />
        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="protocol">Protocol</Label>
          <select
            id="protocol"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financial Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge
              value={risk?.score ?? 0}
              label="0 - 100"
              colorFrom={riskColors.from}
              colorTo={riskColors.to}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div>TVL</div>
              <div className="text-right text-foreground">
                ${risk?.metrics?.tvl?.toLocaleString?.() ?? "—"}
              </div>
              <div>Collateral Ratio</div>
              <div className="text-right text-foreground">
                {risk?.metrics?.collateral_ratio ?? "—"}%
              </div>
              <div>Liquidations (24h)</div>
              <div className="text-right text-foreground">
                {risk?.metrics?.liquidations ?? "—"}
              </div>
              <div>Oracle Spread</div>
              <div className="text-right text-foreground">
                {risk?.metrics?.oracle_spread ?? "—"}%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sentiment Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge
              value={sent?.score ?? 0}
              label="0 - 100"
              colorFrom={sentColors.from}
              colorTo={sentColors.to}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div>Twitter</div>
              <div className="text-right text-foreground">
                {sent?.metrics?.twitter ?? "—"}
              </div>
              <div>Reddit</div>
              <div className="text-right text-foreground">
                {sent?.metrics?.reddit ?? "—"}
              </div>
              <div>Telegram</div>
              <div className="text-right text-foreground">
                {sent?.metrics?.telegram ?? "—"}
              </div>
              <div>News</div>
              <div className="text-right text-foreground">
                {sent?.metrics?.news ?? "—"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fusion Risk Index</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge
              value={fusion?.score ?? 0}
              label="0 - 100"
              colorFrom={fusionColors.from}
              colorTo={fusionColors.to}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div>Weights</div>
              <div className="text-right text-foreground">
                F {fusion?.weights?.financial_pct ?? "—"}% / S{" "}
                {fusion?.weights?.sentiment_pct ?? "—"}%
              </div>
              <div>Confidence</div>
              <div className="text-right text-foreground">
                {fusion?.confidence ?? "—"}%
              </div>
              <div className="col-span-2 text-xs">{fusion?.notes ?? ""}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Fusion Risk Index Trend</CardTitle>
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
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>BlockDAG Oracle Updates</CardTitle>
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
