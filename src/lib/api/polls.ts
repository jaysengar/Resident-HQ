import { getCurrentUserContext } from "./core";

export async function getActivePoll(): Promise<any> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !poll) return null;

  // Check if resident already voted
  const flat = userCtx.flat_no || userCtx.flat;
  if (!flat) return poll;

  const { data: vote } = await supabase
    .from("poll_votes")
    .select("id")
    .eq("poll_id", poll.id)
    .eq("flat_number", flat)
    .maybeSingle();

  if (vote) return null; // Already voted

  return poll;
}

export async function submitPollVote(pollId: string, optionIndex: number): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  const flat = userCtx.flat_no || userCtx.flat;
  
  if (!flat) throw new Error("Flat number not found");

  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    flat_number: flat,
    option_index: optionIndex,
  });

  if (error) throw new Error(error.message);
}

export async function createPoll(question: string, options: string[]): Promise<void> {
  const { serverCreatePoll } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  const { supabase } = await import("@/lib/supabase");
  
  await serverCreatePoll({
    data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "",
      societyId: userCtx.society_id,
      question,
      options,
    },
  });
}

export async function getManagerPolls(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data: polls, error } = await supabase
    .from("polls")
    .select("*, poll_votes(option_index)")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return polls.map((p: any) => {
    const results = p.options.map((opt: string, idx: number) => {
      const votes = p.poll_votes.filter((v: any) => v.option_index === idx).length;
      return { option: opt, votes };
    });
    
    return {
      ...p,
      results,
      total_votes: p.poll_votes.length
    };
  });
}
