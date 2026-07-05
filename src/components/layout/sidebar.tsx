"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MonitorPlay,
  Package,
  Tags,
  ShoppingCart,
  ReceiptText,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "TPV", href: "/pos", icon: MonitorPlay },
  { name: "Artículos", href: "/products", icon: Package },
  { name: "Familias", href: "/families", icon: Tags },
  { name: "Compras", href: "/purchases", icon: ShoppingCart },
  { name: "Ventas", href: "/sales", icon: ReceiptText },
];

export function Sidebar() {
  const pathname = usePathname();

  // Ocultar sidebar en TPV para maximizar el espacio
  if (pathname === "/pos") return null;

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 h-screen sticky top-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <MonitorPlay className="h-6 w-6 text-primary" />
            <span className="">TPV Pro</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
