import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="hover:shadow-lg transition cursor-pointer">
      <CardHeader>
        <CardTitle>{poll.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{poll.description}</p>
        <p className="text-sm">{poll.options} options</p>
        <p className="text-sm">{poll.votes} total votes</p>
        <p className="text-xs text-muted-foreground">
          Created on {new Date(poll.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}