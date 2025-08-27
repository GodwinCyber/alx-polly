"use client";

import { ReactNode } from "react";

export default function PollLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen w-full bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <header className="mb-6 border-b pb-3">
          <h1 className="text-2xl font-semibold">Polls Dashboard</h1>
        </header>
        <main>{children}</main>
      </div>
    </section>
  );
}