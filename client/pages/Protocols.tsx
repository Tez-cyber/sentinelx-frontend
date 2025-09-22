import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Star, StarOff, TrendingUp, Search } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface Protocol {
  id: string;
  name: string;
  symbol: string;
  tvl: number;
  collateralRatio: number;
}

const MOCK: Protocol[] = [
  {
    id: "aeg",
    name: "Aegis Finance",
    symbol: "AEG",
    tvl: 124_500_000,
    collateralRatio: 165,
  },
  {
    id: "nva",
    name: "NovaLend",
    symbol: "NOVA",
    tvl: 76_200_000,
    collateralRatio: 132,
  },
  {
    id: "obx",
    name: "OrbitX",
    symbol: "ORBX",
    tvl: 210_000_000,
    collateralRatio: 185,
  },
  {
    id: "syn",
    name: "Synthia",
    symbol: "SYN",
    tvl: 58_400_000,
    collateralRatio: 148,
  },
];

export default function Protocols() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"tvl" | "collateral">("tvl");
  const [watch, setWatch] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sx.watchlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sx.watchlist", JSON.stringify(watch));
  }, [watch]);

  const data = useMemo(() => {
    const f = MOCK.filter((p) =>
      `${p.name} ${p.symbol}`.toLowerCase().includes(query.toLowerCase()),
    );
    const s = [...f].sort((a, b) =>
      sort === "tvl" ? b.tvl - a.tvl : b.collateralRatio - a.collateralRatio,
    );
    return s;
  }, [query, sort]);

  function toggleWatch(id: string) {
    setWatch((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      toast({
        title: next.includes(id)
          ? "Added to Watchlist"
          : "Removed from Watchlist",
      });
      return next;
    });
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>DeFi Protocols</span>
              <div className="flex items-center gap-3 text-sm">
                <Label className="sr-only" htmlFor="search">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search protocols"
                    className="pl-8 w-64 hidden md:block"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Sort:</Label>
                  <Button
                    variant={sort === "tvl" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSort("tvl")}
                  >
                    TVL
                  </Button>
                  <Button
                    variant={sort === "collateral" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSort("collateral")}
                  >
                    Collateral
                  </Button>
                </div>
              </div>
            </CardTitle>
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
                  {data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-cyan-400" />{" "}
                        {p.name}
                      </TableCell>
                      <TableCell>{p.symbol}</TableCell>
                      <TableCell>${formatNum(p.tvl)}</TableCell>
                      <TableCell>{p.collateralRatio}%</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={
                            watch.includes(p.id) ? "secondary" : "outline"
                          }
                          onClick={() => toggleWatch(p.id)}
                        >
                          {watch.includes(p.id) ? <Star /> : <StarOff />}{" "}
                          {watch.includes(p.id) ? "Watching" : "Watch"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile stacked cards */}
            <div className="md:hidden grid gap-3">
              <Input
                placeholder="Search protocols"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {data.map((p) => (
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
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant={watch.includes(p.id) ? "secondary" : "outline"}
                      className="w-full"
                      onClick={() => toggleWatch(p.id)}
                    >
                      {watch.includes(p.id) ? <Star /> : <StarOff />}{" "}
                      {watch.includes(p.id) ? "Watching" : "Watch"}
                    </Button>
                  </div>
                </div>
              ))}
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
