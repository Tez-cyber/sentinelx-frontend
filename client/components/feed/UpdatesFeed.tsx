type Item = {
  id: string;
  timestamp: string;
  tx: string;
  score: number;
};

export default function UpdatesFeed({ items }: { items: Item[] }) {
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="flex items-center justify-between rounded-md border border-border/60 bg-card/60 px-3 py-2">
          <div>
            <div className="text-sm text-muted-foreground">{i.timestamp}</div>
            <a
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              href={`https://explorer.blockdag.network/tx/${i.tx}`}
              target="_blank"
              rel="noreferrer"
            >
              {i.tx}
            </a>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">Score</div>
            <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              {i.score}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
