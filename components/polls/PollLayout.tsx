"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function PollLayout({ children }: { children: ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-2xl font-semibold text-black">
            ALX Polly
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/polls"
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              My Polls
            </Link>
            <Link
              href="/create"
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              Create Poll
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/create">Create Poll</Link>
            </Button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-sm text-black">
              U
            </div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    ALX Polly
                  </Link>
                  <Link href="/polls" className="hover:text-foreground">
                    My Polls
                  </Link>
                  <Link
                    href="/create"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Create Poll
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
