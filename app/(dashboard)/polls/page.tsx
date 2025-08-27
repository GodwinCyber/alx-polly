import { Button } from '@/components/ui/button';
import PollList from '@/app/components/polls/PollList';

export default function PollsPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Polls</h1>
        <Button>Create New Poll</Button>
      </div>
      <PollList />
    </main>
  );
}