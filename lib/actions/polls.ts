"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPoll(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const question = formData.get("question") as string;
  const options = formData.getAll("option") as string[];

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({ question, user_id: user.id })
    .select()
    .single();

  if (pollError) {
    console.error("Error creating poll:", pollError);
    return { success: false, error: "Failed to create poll." };
  }

  const pollOptions = options
    .filter((option) => option.trim() !== "")
    .map((option) => ({
      poll_id: poll.id,
      text: option,
    }));

  if (pollOptions.length > 0) {
    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(pollOptions);

    if (optionsError) {
      console.error("Error creating poll options:", optionsError);
      await supabase.from("polls").delete().eq("id", poll.id);
      return { success: false, error: "Failed to create poll options." };
    }
  }

  revalidatePath("/polls");
  return { success: true, pollId: poll.id };
}

export async function getPolls() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: polls, error } = await supabase
    .from("polls")
    .select(`id, question, user_id, created_at, poll_options (id, text)`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching polls:", error);
    return [];
  }

  return polls.map((poll) => ({
    ...poll,
    isOwner: user ? poll.user_id === user.id : false,
  }));
}

export async function getPoll(pollId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("polls")
    .select(`*, poll_options (*)`)
    .eq("id", pollId)
    .single();

  if (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
  console.log("Data fetched by getPoll:", data); // Add this line
  return data;
}

export async function updatePoll(
  pollId: string,
  data: { question: string; options: { id: string; text: string }[] },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to update a poll." };
  }

  const { question, options: optionsFromForm = [] } = data;

  // First, verify the user owns the poll they are trying to edit
  const { data: poll, error: ownerError } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", pollId)
    .single();

  if (ownerError || poll.user_id !== user.id) {
    return {
      success: false,
      error: "You are not authorized to edit this poll.",
    };
  }

  // Update poll question
  const { error: pollError } = await supabase
    .from("polls")
    .update({ question })
    .eq("id", pollId);

  if (pollError) {
    console.error("Error updating poll:", pollError);
    return { success: false, error: "Failed to update poll question." };
  }

  // Separate new options from existing ones
  const newOptions = optionsFromForm
    .filter((opt) => opt.id.startsWith("_new_"))
    .map((opt) => ({ poll_id: pollId, text: opt.text }));

  const updatedOptions = optionsFromForm
    .filter((opt) => !opt.id.startsWith("_new_"))
    .map((opt) => ({ id: opt.id, poll_id: pollId, text: opt.text }));

  // Insert the new options
  console.log("New options to insert:", newOptions); // Add this line
  if (newOptions.length > 0) {
    const { data: insertData, error: insertError } = await supabase
      .from("poll_options")
      .insert(newOptions)
      .select(); // Add .select() to get returned data
    console.log(
      "Supabase insert result for new poll options - Data:",
      insertData,
      "Error:",
      insertError,
    ); // More detailed log
    if (insertError) {
      console.error("Supabase insert error for new poll options:", insertError);
      return { success: false, error: "Failed to add new options." };
    }
  }

  // Update the existing options
  if (updatedOptions.length > 0) {
    const { error: updateError } = await supabase
      .from("poll_options")
      .upsert(updatedOptions);
    if (updateError) {
      console.error("Error updating existing poll options:", updateError);
      return { success: false, error: "Failed to update existing options." };
    }
  }

  // Delete any options that were removed from the form
  const existingOptions =
    (await supabase.from("poll_options").select("id").eq("poll_id", pollId))
      .data || [];
  const optionsOnFormIds = updatedOptions.map((o) => o.id);
  const optionsToDelete = existingOptions.filter(
    (opt) => !optionsOnFormIds.includes(opt.id),
  );

  if (optionsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("poll_options")
      .delete()
      .in(
        "id",
        optionsToDelete.map((o) => o.id),
      );
    if (deleteError) {
      console.error("Error deleting old poll options:", deleteError);
      return { success: false, error: "Failed to remove old options." };
    }
  }

  revalidatePath("/polls");
  revalidatePath(`/polls/${pollId}`);
  revalidatePath(`/polls/${pollId}/edit`);
  return { success: true };
}

export async function deletePoll(pollId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("polls").delete().eq("id", pollId);

  if (error) {
    console.error("Error deleting poll:", error);
    return { success: false, error: "Failed to delete poll." };
  }

  revalidatePath("/polls");
  return { success: true };
}
