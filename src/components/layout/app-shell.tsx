"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPos = pathname === "/pos";

  if (isPos) {
    return <main className="flex h-screen w-full flex-col">{children}</main>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <MobileNav />
        <main className="flex flex-1 flex-col p-4 lg:p-6 h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
