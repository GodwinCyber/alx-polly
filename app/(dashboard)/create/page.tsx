"use client";

import { createPoll } from "@/lib/actions/polls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreatePollPage() {
  const [options, setOptions] = useState(["", ""]);
  const [question, setQuestion] = useState("");
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.slice();
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = options.slice();
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await createPoll(formData);

    if (result.success && result.pollId) {
      toast.success("Poll created successfully!");
      setCreatedPollId(result.pollId);
      // Reset form for the next poll
      setQuestion("");
      setOptions(["", ""]);
    } else {
      toast.error(result.error || "An unknown error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a New Poll</CardTitle>
        </CardHeader>
        <CardContent>
          {createdPollId && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center space-y-3">
              <p className="font-semibold text-green-800">
                Your poll has been created!
              </p>
              <div className="flex justify-center items-center space-x-4">
                <Link
                  href="/polls"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <span className="mr-1" aria-hidden="true">
                    ←
                  </span>
                  Back to My Polls
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  href={`/polls/${createdPollId}/edit`}
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  Update Poll
                  <span className="ml-1" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
              <hr className="my-2" />
              <p className="text-sm text-gray-500">
                You can now create another poll below.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                name="question"
                placeholder="What's your favorite color?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    name="option"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={handleAddOption} variant="outline">
                Add Option
              </Button>
            </div>
            <Button type="submit" className="w-full">
              Create Poll
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
