import Link from "next/link";
import { ArrowLeft, Sliders, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import EventSettingsClient, { EventData, AuditLogEntry } from "./EventSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // 1. Server-load the active event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, slug, submission_opens_at, submission_deadline_at, judging_starts_at, judging_ends_at, results_at")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  // 2. Count submitted projects (for warning when moving deadline earlier)
  const { count: submittedCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  // 3. Load 10 most recent event_dates_updated audit logs with actor profile
  const { data: logs } = await supabase
    .from("admin_audit_log")
    .select("id, actor_id, action, target_type, target_id, details, created_at, profiles:actor_id (full_name, email)")
    .eq("action", "event_dates_updated")
    .order("created_at", { ascending: false })
    .limit(10);

  const activeEvent = (event as EventData) || {
    id: "",
    name: "HackIGNISIA 2026",
    slug: "hackignisia-2026",
    submission_opens_at: null,
    submission_deadline_at: null,
    judging_starts_at: null,
    judging_ends_at: null,
    results_at: null,
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* BACKGROUND GRADIENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[550px] w-[750px] -translate-x-1/2 rounded-full bg-violet-600/[0.07] blur-[150px]" />
        <div className="absolute bottom-[-250px] right-[-200px] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.035] blur-[140px]" />
      </div>

      <div className="relative">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-500 transition hover:text-white"
              >
                <ArrowLeft size={17} />
              </Link>

              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400">
                  Admin Portal
                </div>
                <h1 className="mt-1 text-sm font-semibold">Event Schedule Settings</h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400">
                  Live Database Controls
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <section className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              <Calendar size={12} />
              Timeline &amp; Window Configuration
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Event Window <span className="text-violet-400">Settings</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Adjust submission deadlines and judging windows dynamically. Changes take effect across
              all server RPCs and public pages immediately.
            </p>
          </section>

          {eventError && (
            <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
              Database warning: Could not fetch active event automatically.
            </div>
          )}

          <EventSettingsClient
            event={activeEvent}
            submittedCount={submittedCount || 0}
            recentLogs={(logs as unknown as AuditLogEntry[]) || []}
          />
        </div>
      </div>
    </main>
  );
}
