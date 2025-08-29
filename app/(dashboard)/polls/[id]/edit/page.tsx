"use client";

import { useEffect, useState } from "react";
import { getPoll, updatePoll } from "@/lib/actions/polls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Poll, PollOption } from "@/lib/types/polls";

type PollWithWithOptions = Poll & {
  poll_options: PollOption[];
};

export default function EditPollPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<PollWithWithOptions | null>(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOption[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPoll = async () => {
      const pollData = await getPoll(params.id);
      if (pollData) {
        setPoll(pollData);
        setQuestion(pollData.question);
        setOptions(pollData.poll_options);
        console.log("Fetched poll options:", pollData.poll_options);
      } else {
        toast.error("Poll not found.");
        router.push("/polls");
      }
    };
    fetchPoll();
  }, [params.id, router]);

  const handleAddOption = () => {
    setOptions([...options, { id: `_new_${Date.now()}`, text: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.slice();
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Manually construct the data object to match the updatePoll signature
    const dataToSend = {
      question,
      options: options.map((option) => ({
        id: option.id,
        text: option.text,
      })),
    };

    const result = await updatePoll(params.id, dataToSend);

    if (result.success) {
      toast.success("Poll edited successfully!");
      router.push("/polls");
    } else {
      toast.error(result.error || "Failed to edit poll.");
    }
  };

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Edit Poll</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                name="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Options</Label>
              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 mb-2"
                >
                  <Input
                    name={`option-id-${index}`}
                    type="hidden"
                    value={option.id}
                  />
                  <Input
                    name="option"
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
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
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
