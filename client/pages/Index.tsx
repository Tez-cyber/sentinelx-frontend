import { useEffect } from "react";
import Layout from "../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import FusionLineChart from "../components/charts/FusionLineChart";
import { Gauge } from "../components/charts/Gauge";
import UpdatesFeed from "../components/feed/UpdatesFeed";

const trend = Array.from({ length: 24 }).map((_, i) => ({ t: `${i}:00`, v: Math.round(40 + 30 * Math.sin(i / 3) + (Math.random() * 8 - 4)) }));
const feed = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i),
  timestamp: new Date(Date.now() - i * 1000 * 60 * 7).toLocaleString(),
  tx: `0x${(Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)).slice(0, 64)}`,
  score: Math.round(50 + Math.random() * 50),
}));

export default function Index() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financial Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge value={78} label="0 - 100" />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sentiment Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge value={64} label="0 - 100" colorFrom="#34d399" colorTo="#22d3ee" />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fusion Risk Index</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge value={72} label="0 - 100" colorFrom="#a78bfa" colorTo="#22d3ee" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Fusion Risk Index Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <FusionLineChart data={trend} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>BlockDAG Oracle Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdatesFeed items={feed} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
