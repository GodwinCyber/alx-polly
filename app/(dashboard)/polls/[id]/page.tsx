"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const poll = {
  id: "1",
  title: "Favorite Programming Language",
  description: "What programming language do you prefer to use?",
  options: ["JavaScript", "Python", "Java", "C#", "Go"],
  createdBy: "John Doe",
  createdAt: "2023-10-15",
};

export default function PollDetailsPage() {
  const router = useRouter();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: poll.title,
          text: poll.description,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    }
  };

  const handleEdit = () => {
    router.push(`/polls/${poll.id}/edit`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
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
          <Button variant="outline" onClick={handleEdit}>
            Edit Poll
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  this poll.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{poll.title}</CardTitle>
            <p className="text-muted-foreground pt-2">{poll.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup defaultValue={poll.options[0]}>
              {poll.options.map((option) => (
                <Label
                  key={option}
                  htmlFor={option}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer text-lg"
                >
                  <RadioGroupItem value={option} id={option} />
                  <span>{option}</span>
                </Label>
              ))}
            </RadioGroup>
            <div className="pt-4">
              <Button size="lg" className="w-full">
                Submit Vote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground flex-wrap gap-2">
        <span>Created by {poll.createdBy}</span>
        <span>Created on {new Date(poll.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold">Share this poll</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Button variant="outline" onClick={handleCopyLink}>
            Copy Link
          </Button>
          <Button variant="outline" onClick={handleShare}>
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}
