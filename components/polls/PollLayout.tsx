"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PollLayout({ children }: { children: ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <span>ALX Polly</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm lg:gap-6">
            <Link
              href="/polls"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              My Polls
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Create Poll
            </Link>
          </nav>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
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
              <Link
                href="/polls"
                className="text-muted-foreground hover:text-foreground"
              >
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

        <div className="hidden md:flex items-center gap-4">
          <Button asChild>
            <Link href="/create">Create Poll</Link>
          </Button>
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 bg-muted/40">{children}</main>
    </div>
  );
}
