import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Plus, Pencil, Trash2, Database, Send } from "lucide-react";
import { toast } from "../hooks/use-toast";
import {
  getAdminSettings,
  postUpdateSources,
  postUpdateWeights,
} from "../lib/api";

// Types
interface Protocol {
  id: string;
  name: string;
  symbol: string;
  tvl: number;
  collateralRatio: number;
}

export default function Admin() {
  // Mock: Protocols
  const [protocols, setProtocols] = useState<Protocol[]>([
    {
      id: "1",
      name: "Aegis Finance",
      symbol: "AEG",
      tvl: 124_500_000,
      collateralRatio: 165,
    },
    {
      id: "2",
      name: "NovaLend",
      symbol: "NOVA",
      tvl: 76_200_000,
      collateralRatio: 132,
    },
    {
      id: "3",
      name: "OrbitX",
      symbol: "ORBX",
      tvl: 210_000_000,
      collateralRatio: 185,
    },
  ]);
  const [editing, setEditing] = useState<Protocol | null>(null);
  const [open, setOpen] = useState(false);

  // Mock: Sentiment sources toggles and weights (0-1)
  const [sources, setSources] = useState({
    twitter: true,
    telegram: true,
    reddit: true,
    news: true,
  });
  const [weights, setWeights] = useState({
    twitter: 0.6,
    telegram: 0.5,
    reddit: 0.4,
    news: 0.7,
  });

  // Fusion Risk weights (percent)
  const [financialPct, setFinancialPct] = useState(70);
  const sentimentPct = 100 - financialPct;

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingWeights, setSavingWeights] = useState(false);
  const [savingSources, setSavingSources] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAdminSettings()
      .then((s) => {
        if (!mounted) return;
        setFinancialPct(s.weights.financial_pct);
        setSources(s.sources);
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Oracle publish state
  const [lastPublish, setLastPublish] = useState<{
    index: number;
    tx: string;
    at: string;
  } | null>(null);

  const totalTVL = useMemo(
    () => protocols.reduce((a, p) => a + p.tvl, 0),
    [protocols],
  );

  function handleSaveProtocol(p: Protocol) {
    setProtocols((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      const next = exists
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [{ ...p, id: cryptoId() }, ...prev];
      return next;
    });
    setOpen(false);
    setEditing(null);
    toast({ title: "Saved", description: `${p.name} saved successfully.` });
  }

  function handleDelete(id: string) {
    setProtocols((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "Deleted", description: `Protocol removed.` });
  }

  function handlePublish() {
    const fused = Math.round(
      financialPct * 0.01 * 75 + // mock financial risk score
        sentimentPct * 0.01 * 65, // mock sentiment score
    );
    const tx = randomTx();
    const at = new Date().toLocaleString();
    setLastPublish({ index: fused, tx, at });
    toast({ title: "Published", description: `Fusion Index ${fused} → ${tx}` });
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Protocol Management */}
        <Card className="col-span-3 rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Protocol Management</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() =>
                    setEditing({
                      id: "",
                      name: "",
                      symbol: "",
                      tvl: 0,
                      collateralRatio: 150,
                    })
                  }
                >
                  <Plus /> Add Protocol
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editing?.id ? "Edit Protocol" : "Add Protocol"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editing?.name ?? ""}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...(p as Protocol),
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        value={editing?.symbol ?? ""}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...(p as Protocol),
                            symbol: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tvl">TVL (USD)</Label>
                      <Input
                        id="tvl"
                        type="number"
                        value={editing?.tvl ?? 0}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...(p as Protocol),
                            tvl: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="cr">Collateral Ratio (%)</Label>
                      <Input
                        id="cr"
                        type="number"
                        value={editing?.collateralRatio ?? 0}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...(p as Protocol),
                            collateralRatio: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => editing && handleSaveProtocol(editing)}
                  >
                    <Database /> Save Protocol
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>TVL</TableHead>
                    <TableHead>Collateral Ratio</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protocols.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.symbol}</TableCell>
                      <TableCell>${formatNum(p.tvl)}</TableCell>
                      <TableCell>{p.collateralRatio}%</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                        >
                          <Pencil /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile stacked cards */}
            <div className="md:hidden grid gap-3">
              {protocols.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.symbol}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>TVL</div>
                    <div className="text-right">${formatNum(p.tvl)}</div>
                    <div>Collateral</div>
                    <div className="text-right">{p.collateralRatio}%</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Total TVL: ${formatNum(totalTVL)}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Settings */}
        <Card className="col-span-1 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Sentiment Settings</CardTitle>
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
                    checked={sources[key]}
                    onCheckedChange={(v) =>
                      setSources((s) => ({ ...s, [key]: Boolean(v) }))
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-10">0</span>
                  <Slider
                    value={[weights[key]]}
                    onValueChange={(v) =>
                      setWeights((w) => ({ ...w, [key]: clamp01(v[0]) }))
                    }
                    min={0}
                    max={1}
                    step={0.05}
                  />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    1
                  </span>
                  <span className="text-xs text-foreground w-8 text-right">
                    {weights[key].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              disabled={savingSources}
              onClick={async () => {
                setSavingSources(true);
                const ok = await postUpdateSources(sources as any);
                setSavingSources(false);
                toast({
                  title: ok ? "Saved" : "Failed",
                  description: ok
                    ? "Sentiment settings updated."
                    : "Could not save settings.",
                });
              }}
            >
              {savingSources ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Fusion Risk Index Settings */}
        <Card className="col-span-1 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Fusion Risk Index Weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Financial Risk %</span>
                <span className="font-semibold">{financialPct}%</span>
              </div>
              <Slider
                value={[financialPct]}
                onValueChange={(v) => setFinancialPct(Math.round(v[0]))}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Sentiment Risk %</span>
              <span className="font-semibold">{sentimentPct}%</span>
            </div>
            <Button
              disabled={savingWeights}
              onClick={async () => {
                setSavingWeights(true);
                const ok = await postUpdateWeights({
                  financial_pct: financialPct,
                  sentiment_pct: sentimentPct,
                });
                setSavingWeights(false);
                toast({
                  title: ok ? "Saved" : "Failed",
                  description: ok
                    ? "Fusion Index weights updated."
                    : "Could not save weights.",
                });
              }}
            >
              {savingWeights ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Oracle Controls */}
        <Card className="col-span-1 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Oracle Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={handlePublish}>
              <Send /> Publish to BlockDAG
            </Button>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-sm">
              <div className="text-muted-foreground">Last Published</div>
              {lastPublish ? (
                <div className="mt-2 space-y-1">
                  <div>
                    Fusion Index:{" "}
                    <span className="font-semibold">{lastPublish.index}</span>
                  </div>
                  <div>
                    Tx Hash:{" "}
                    <a
                      className="text-cyan-400 hover:text-cyan-300 underline"
                      href={`https://explorer.blockdag.network/tx/${lastPublish.tx}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {lastPublish.tx}
                    </a>
                  </div>
                  <div>Timestamp: {lastPublish.at}</div>
                </div>
              ) : (
                <div className="mt-2 text-muted-foreground">
                  No publication yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function formatNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function cryptoId() {
  return Math.random().toString(36).slice(2, 10);
}

function randomTx() {
  return `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}
