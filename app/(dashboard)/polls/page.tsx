import { Button } from "@/components/ui/button";
import PollList from "@/components/polls/PollList";
import Link from "next/link";

export default function PollsPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Polls</h1>
        <Button asChild>
          <Link href="/create">Create New Poll</Link>
        </Button>
      </div>
      <PollList />
    </main>
  );
}
