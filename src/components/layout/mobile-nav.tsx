"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu, MonitorPlay, LayoutDashboard, Package, Tags, ShoppingCart, ReceiptText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "TPV", href: "/pos", icon: MonitorPlay },
  { name: "Artículos", href: "/products", icon: Package },
  { name: "Familias", href: "/families", icon: Tags },
  { name: "Compras", href: "/purchases", icon: ShoppingCart },
  { name: "Ventas", href: "/sales", icon: ReceiptText },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Ocultar header en TPV
  if (pathname === "/pos") return null;

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* @ts-expect-error react 19 compatibility */}
        <SheetTrigger asChild>
          <div className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0 md:hidden cursor-pointer")}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium mt-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
              onClick={() => setOpen(false)}
            >
              <MonitorPlay className="h-6 w-6 text-primary" />
              <span>TPV Pro</span>
            </Link>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex justify-end">
        {/* Placeholder for future User Nav or Theme Toggle */}
      </div>
    </header>
  );
}
