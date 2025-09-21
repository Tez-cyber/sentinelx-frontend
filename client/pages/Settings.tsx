import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useWallet } from "../hooks/useWallet";
import { toast } from "../hooks/use-toast";

export default function Settings() {
  const { address, connect, disconnect, isConnecting } = useWallet();

  const [notif, setNotif] = useState(() => ({ price: true, riskDelta: true, onchain: false }));
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [refresh, setRefresh] = useState(30);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const n = JSON.parse(localStorage.getItem("sx.settings.notif") || "null");
      const r = JSON.parse(localStorage.getItem("sx.settings.risk") || "null");
      const rf = JSON.parse(localStorage.getItem("sx.settings.refresh") || "null");
      const t = localStorage.getItem("sx.settings.theme");
      if (n) setNotif(n);
      if (r) setRiskThreshold(r);
      if (rf) setRefresh(rf);
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function save() {
    localStorage.setItem("sx.settings.notif", JSON.stringify(notif));
    localStorage.setItem("sx.settings.risk", JSON.stringify(riskThreshold));
    localStorage.setItem("sx.settings.refresh", JSON.stringify(refresh));
    localStorage.setItem("sx.settings.theme", theme);
    toast({ title: "Saved", description: "Account settings updated." });
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Wallet</div>
              <div className="text-right">
                <div className="font-mono text-xs">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                </div>
                <div className="mt-2">
                  {address ? (
                    <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
                  ) : (
                    <Button size="sm" onClick={connect} disabled={isConnecting}>{isConnecting ? "Connecting..." : "Connect Wallet"}</Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button size="sm" variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>Dark</Button>
                <Button size="sm" variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>Light</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <Label>Price movements</Label>
              <Switch checked={notif.price} onCheckedChange={(v) => setNotif((s) => ({ ...s, price: Boolean(v) }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Risk Delta Alerts</Label>
              <Switch checked={notif.riskDelta} onCheckedChange={(v) => setNotif((s) => ({ ...s, riskDelta: Boolean(v) }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>On-chain Events</Label>
              <Switch checked={notif.onchain} onCheckedChange={(v) => setNotif((s) => ({ ...s, onchain: Boolean(v) }))} />
            </div>
          </CardContent>
        </Card>

        {/* Thresholds */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Risk Threshold</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Alert when Fusion Risk Index exceeds</span>
              <span className="font-semibold">{riskThreshold}</span>
            </div>
            <Slider value={[riskThreshold]} onValueChange={(v) => setRiskThreshold(Math.round(v[0]))} min={0} max={100} step={1} />
          </CardContent>
        </Card>

        {/* Data */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Data Refresh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Refresh interval (seconds)</span>
              <span className="font-semibold">{refresh}</span>
            </div>
            <Slider value={[refresh]} onValueChange={(v) => setRefresh(Math.round(v[0]))} min={5} max={120} step={5} />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Button onClick={save}>Save Settings</Button>
        </div>
      </div>
    </Layout>
  );
}
