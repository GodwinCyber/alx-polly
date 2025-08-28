import { Button } from "@/components/ui/button";
import PollList from "@/components/polls/PollList";
import Link from "next/link";

export default function PollsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-black">My Polls</h1>
        <Button>Create New Poll</Button>
      </div>
      <PollList />
    </div>
  );
}
