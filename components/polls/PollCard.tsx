import { PollWithOptions } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

export default function PollCard({ poll }: { poll: PollWithOptions }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{poll.question}</CardTitle>
        {poll.isOwner && (
          <div className="flex items-center space-x-2">
            <Link href={`/polls/${poll.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <DeleteButton pollId={poll.id} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {poll.poll_options.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <p>{option.text}</p>
              {/* Add voting logic here in the future */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
