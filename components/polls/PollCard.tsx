import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface PollProps {
  poll: {
    id: string;
    title: string;
    description: string;
    options: number;
    votes: number;
    createdAt: string;
  };
}

export default function PollCard({ poll }: PollProps) {
  return (
    <Link href={`/polls/${poll.id}`}>
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-5 space-y-1">
          <h2 className="font-semibold text-base text-black">{poll.title}</h2>
          <p className="text-sm text-muted-foreground">{poll.description}</p>
          <p className="text-sm text-slate-600 mt-2">{poll.options} options</p>
          <p className="text-sm text-slate-600">{poll.votes} total votes</p>
          <p className="text-xs text-slate-400 pt-2">
            Created on {new Date(poll.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
