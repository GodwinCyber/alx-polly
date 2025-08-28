import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="hover:shadow-lg transition cursor-pointer h-full">
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{poll.description}</p>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{poll.options} options</span>
            <span>{poll.votes} total votes</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Created on {new Date(poll.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
