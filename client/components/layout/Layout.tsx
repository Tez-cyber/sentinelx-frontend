import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_-10%_-10%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(1000px_500px_at_110%_10%,rgba(139,92,246,0.08),transparent_60%),linear-gradient(to_bottom,var(--tw-bg-opacity,1)_0%,var(--tw-bg-opacity,1)_100%)]">
      <Header />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:gap-6">
          <Sidebar />
          <main className="flex-1 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
