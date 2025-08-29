import { getPolls } from "@/lib/actions/polls";
import PollCard from "./PollCard";
import { PollWithOptions } from "@/lib/types";

export default async function PollList() {
  const polls: PollWithOptions[] = await getPolls();

  if (polls.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>No polls found.</p>
        <p>Create a new poll to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
