import { getPoll } from "@/lib/actions/polls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { Poll, PollOption } from "@/lib/types/polls"; // Assuming Poll and PollOption are defined here

type PollWithWithOptions = Poll & {
  poll_options: PollOption[];
};

export default async function PollDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const poll = await getPoll(params.id);

  if (!poll) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Poll Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The poll you are looking for does not exist or has been deleted.
            </p>
            <Link
              href="/polls"
              className="text-primary hover:underline mt-4 block"
            >
              Back to Polls
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/polls"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Polls
        </Link>
        <div className="flex gap-2">
          {/* Edit button should link to the edit page */}
          <Link href={`/polls/${poll.id}/edit`}>
            <Button variant="outline">Edit Poll</Button>
          </Link>
          {/* Delete button will need a Server Action in a Client Component */}
          <Button variant="destructive">Delete</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          {/* Assuming there's no description field in your poll table */}
          {/* <p className="text-sm text-muted-foreground pt-2">{poll.description}</p> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue={poll.poll_options[0]?.id}>
            {" "}
            {/* Use option.id for defaultValue */}
            {poll.poll_options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 p-4 border rounded-md"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 text-lg">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button className="w-full">Submit Vote</Button>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        {/* Assuming user_id is linked to user data if needed for "Created by" */}
        {/* <span>Created by {poll.user_id}</span> */}
        <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
      </div>
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold">Share this poll</h3>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline">Copy Link</Button>
          <Button variant="outline">Share on Twitter</Button>
        </div>
      </div>
    </div>
  );
}
