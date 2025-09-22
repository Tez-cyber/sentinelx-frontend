import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Gauge } from "../components/charts/Gauge";
import FusionLineChart from "../components/charts/FusionLineChart";
import { toast } from "../hooks/use-toast";

export default function Sentiment() {
  const [enabled, setEnabled] = useState(() => ({
    twitter: true,
    telegram: true,
    reddit: true,
    news: true,
  }));
  const [w, setW] = useState(() => ({
    twitter: 0.6,
    telegram: 0.5,
    reddit: 0.4,
    news: 0.7,
  }));

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("sx.sent.sources") || "null");
      const ww = JSON.parse(localStorage.getItem("sx.sent.weights") || "null");
      if (s) setEnabled(s);
      if (ww) setW(ww);
    } catch {}
  }, []);

  const score = useMemo(() => {
    const base = { twitter: 62, telegram: 58, reddit: 54, news: 68 };
    const entries = Object.entries(base).filter(([k]) => (enabled as any)[k]);
    if (!entries.length) return 0;
    const weighted = entries.reduce(
      (acc, [k, v]) => acc + v * (w as any)[k],
      0,
    );
    const totalW = entries.reduce((acc, [k]) => acc + (w as any)[k], 0) || 1;
    return Math.round(weighted / totalW);
  }, [enabled, w]);

  const trend = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        t: `${i}`,
        v: Math.round(50 + 10 * Math.sin(i / 4) + (Math.random() * 6 - 3)),
      })),
    [],
  );

  function save() {
    localStorage.setItem("sx.sent.sources", JSON.stringify(enabled));
    localStorage.setItem("sx.sent.weights", JSON.stringify(w));
    toast({ title: "Saved", description: "Sentiment preferences updated." });
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="col-span-1 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Aggregate Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge value={score} label="User-Weighted" />
          </CardContent>
        </Card>
        <Card className="col-span-2 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <FusionLineChart data={trend} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {(
              [
                { key: "twitter", label: "Twitter" },
                { key: "telegram", label: "Telegram" },
                { key: "reddit", label: "Reddit" },
                { key: "news", label: "News" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <Switch
                    checked={(enabled as any)[key]}
                    onCheckedChange={(v) =>
                      setEnabled((s) => ({ ...s, [key]: Boolean(v) }))
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-10">0</span>
                  <Slider
                    value={[(w as any)[key]]}
                    onValueChange={(v) =>
                      setW((prev) => ({ ...prev, [key]: clamp01(v[0]) }))
                    }
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    1
                  </span>
                  <span className="text-xs text-foreground w-8 text-right">
                    {(w as any)[key].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={save}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Customize how SentinelX weights different sentiment sources. Your
            settings personalize the dashboard and alerts; they do not affect
            global model weights.
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
