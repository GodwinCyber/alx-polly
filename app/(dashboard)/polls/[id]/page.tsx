"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const poll = {
  id: "1",
  title: "Favorite Programming Language",
  description: "What programming language do you prefer to use?",
  options: ["JavaScript", "Python", "Java", "C#", "Go"],
  createdBy: "John Doe",
  createdAt: "2023-10-15",
};

export default function PollDetailsPage() {
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
          <Button variant="outline">Edit Poll</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <p className="text-sm text-muted-foreground pt-2">
            {poll.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue={poll.options[0]}>
            {poll.options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 p-4 border rounded-md"
              >
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 text-lg">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Button className="w-full">Submit Vote</Button>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <span>Created by {poll.createdBy}</span>
        <span>Created on {new Date(poll.createdAt).toLocaleDateString()}</span>
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
