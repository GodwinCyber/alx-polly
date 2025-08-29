"use client";

import { Button } from "@/components/ui/button";
import { deletePoll } from "@/lib/actions/polls";
import { toast } from "sonner";
import { useTransition } from "react";

export default function DeleteButton({ pollId }: { pollId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const result = await deletePoll(pollId);
    if (result.success) {
      toast.success("Poll deleted successfully!");
    } else {
      toast.error(result.error ?? "Failed to delete poll.");
    }
  };

  return (
    <form
      action={() => {
        startTransition(() => handleDelete());
      }}
    >
      <Button variant="destructive" size="sm" disabled={isPending}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  );
}
