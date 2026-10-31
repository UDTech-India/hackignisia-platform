"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type UpdateEventDatesParams = {
  eventId: string;
  submissionOpensAt: string;
  submissionDeadlineAt: string;
  judgingStartsAt: string;
  judgingEndsAt: string;
  resultsAt: string | null;
};

export async function updateEventDates(params: UpdateEventDatesParams) {
  try {
    const supabase = await createClient();

    // Verify session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Not authenticated. Please log in again." };
    }

    // Call the hardened SECURITY DEFINER RPC
    const { error: rpcError } = await supabase.rpc("admin_update_event_dates", {
      p_event_id: params.eventId,
      p_submission_opens_at: params.submissionOpensAt,
      p_submission_deadline_at: params.submissionDeadlineAt,
      p_judging_starts_at: params.judgingStartsAt,
      p_judging_ends_at: params.judgingEndsAt,
      p_results_at: params.resultsAt,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    // Revalidate all pages reading event schedule
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/project");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
