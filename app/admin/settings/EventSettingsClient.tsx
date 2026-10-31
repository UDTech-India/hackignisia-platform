"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Info,
  Loader2,
  Save,
  ShieldAlert,
} from "lucide-react";
import { updateEventDates } from "./actions";

export type EventData = {
  id: string;
  name: string;
  slug: string;
  submission_opens_at: string | null;
  submission_deadline_at: string | null;
  judging_starts_at: string | null;
  judging_ends_at: string | null;
  results_at: string | null;
};

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  action: string;
  target_id: string;
  details: {
    submission_opens_at?: { old: string | null; new: string | null };
    submission_deadline_at?: { old: string | null; new: string | null };
    judging_starts_at?: { old: string | null; new: string | null };
    judging_ends_at?: { old: string | null; new: string | null };
    results_at?: { old: string | null; new: string | null };
  };
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

type Props = {
  event: EventData;
  submittedCount: number;
  recentLogs: AuditLogEntry[];
};

function toISTInputValues(isoString: string | null | undefined): { date: string; time: string } {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: "", time: "" };

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function combineToISTISO(date: string, time: string): string | null {
  if (!date || date.trim() === "") return null;
  const safeTime = time && time.trim() !== "" ? time : "00:00";
  return `${date}T${safeTime}:00+05:30`;
}

function formatISTDisplay(isoString: string | null | undefined): string {
  if (!isoString) return "Not configured (NULL)";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "Invalid Date";
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST"
  );
}

export default function EventSettingsClient({ event, submittedCount, recentLogs }: Props) {
  const router = useRouter();

  // Form input states (Date and Time strings)
  const initialOpens = toISTInputValues(event.submission_opens_at);
  const initialDeadline = toISTInputValues(event.submission_deadline_at);
  const initialJudgeStarts = toISTInputValues(event.judging_starts_at);
  const initialJudgeEnds = toISTInputValues(event.judging_ends_at);
  const initialResults = toISTInputValues(event.results_at);

  const [opensDate, setOpensDate] = useState(initialOpens.date);
  const [opensTime, setOpensTime] = useState(initialOpens.time);

  const [deadlineDate, setDeadlineDate] = useState(initialDeadline.date);
  const [deadlineTime, setDeadlineTime] = useState(initialDeadline.time);

  const [judgeStartsDate, setJudgeStartsDate] = useState(initialJudgeStarts.date);
  const [judgeStartsTime, setJudgeStartsTime] = useState(initialJudgeStarts.time);

  const [judgeEndsDate, setJudgeEndsDate] = useState(initialJudgeEnds.date);
  const [judgeEndsTime, setJudgeEndsTime] = useState(initialJudgeEnds.time);

  const [resultsDate, setResultsDate] = useState(initialResults.date);
  const [resultsTime, setResultsTime] = useState(initialResults.time);

  // Modal, Loading & Message states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute ISO representations with explicit +05:30 offset
  const newOpensISO = combineToISTISO(opensDate, opensTime);
  const newDeadlineISO = combineToISTISO(deadlineDate, deadlineTime);
  const newJudgeStartsISO = combineToISTISO(judgeStartsDate, judgeStartsTime);
  const newJudgeEndsISO = combineToISTISO(judgeEndsDate, judgeEndsTime);
  const newResultsISO = resultsDate ? combineToISTISO(resultsDate, resultsTime) : null;

  // Determine changes
  type DiffItem = {
    field: string;
    label: string;
    oldVal: string | null;
    newVal: string | null;
  };

  const changes: DiffItem[] = [];

  if (newOpensISO !== event.submission_opens_at) {
    changes.push({
      field: "submission_opens_at",
      label: "Submission Window Opens",
      oldVal: event.submission_opens_at,
      newVal: newOpensISO,
    });
  }

  if (newDeadlineISO !== event.submission_deadline_at) {
    changes.push({
      field: "submission_deadline_at",
      label: "Submission Deadline",
      oldVal: event.submission_deadline_at,
      newVal: newDeadlineISO,
    });
  }

  if (newJudgeStartsISO !== event.judging_starts_at) {
    changes.push({
      field: "judging_starts_at",
      label: "Judging Starts",
      oldVal: event.judging_starts_at,
      newVal: newJudgeStartsISO,
    });
  }

  if (newJudgeEndsISO !== event.judging_ends_at) {
    changes.push({
      field: "judging_ends_at",
      label: "Judging Ends",
      oldVal: event.judging_ends_at,
      newVal: newJudgeEndsISO,
    });
  }

  if (newResultsISO !== event.results_at) {
    changes.push({
      field: "results_at",
      label: "Results Announcement",
      oldVal: event.results_at,
      newVal: newResultsISO,
    });
  }

  // Extra UI warnings
  const warnings: string[] = [];
  const nowMs = Date.now();

  if (newDeadlineISO) {
    const deadlineMs = new Date(newDeadlineISO).getTime();
    if (deadlineMs < nowMs) {
      warnings.push("Warning: The submission deadline is configured in the past.");
    }

    if (
      event.submission_deadline_at &&
      deadlineMs < new Date(event.submission_deadline_at).getTime() &&
      submittedCount > 0
    ) {
      warnings.push(
        `Warning: Moving the submission deadline earlier while ${submittedCount} team project(s) have already been submitted.`
      );
    }
  }

  if (event.judging_starts_at) {
    const oldJudgeStartMs = new Date(event.judging_starts_at).getTime();
    const judgingDatesChanged =
      newJudgeStartsISO !== event.judging_starts_at || newJudgeEndsISO !== event.judging_ends_at;

    if (oldJudgeStartMs < nowMs && judgingDatesChanged) {
      warnings.push(
        "Warning: The judging period has already commenced. Modifying judging window dates may disrupt ongoing evaluations."
      );
    }
  }

  function handleSaveClick(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (changes.length === 0) {
      setErrorMessage("No changes detected. Modify at least one date or time before saving.");
      return;
    }

    setShowConfirmModal(true);
  }

  async function handleConfirmSave() {
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!newOpensISO || !newDeadlineISO || !newJudgeStartsISO || !newJudgeEndsISO) {
      setErrorMessage("Submission window and judging window dates are strictly required.");
      setIsSubmitting(false);
      setShowConfirmModal(false);
      return;
    }

    const result = await updateEventDates({
      eventId: event.id,
      submissionOpensAt: newOpensISO,
      submissionDeadlineAt: newDeadlineISO,
      judgingStartsAt: newJudgeStartsISO,
      judgingEndsAt: newJudgeEndsISO,
      resultsAt: newResultsISO,
    });

    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (!result.success) {
      setErrorMessage(result.error || "Failed to update event dates.");
    } else {
      setSuccessMessage(
        "Event schedule dates updated successfully! All public pages and submission windows have been live-revalidated."
      );
      router.refresh();
    }
  }

  return (
    <div className="space-y-10">
      {/* STATUS NOTIFICATIONS */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-rose-400" />
          <div className="text-sm">
            <span className="font-semibold">Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="text-sm">
            <span className="font-semibold">Success: </span>
            {successMessage}
          </div>
        </div>
      )}

      {/* EVENT SCHEDULE FORM */}
      <form onSubmit={handleSaveClick} className="rounded-3xl border border-white/[0.08] bg-[#080808]/90 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Event Schedule & Submission Window</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Configure hackathon dates. All values are automatically parsed and stored in{" "}
              <span className="font-semibold text-violet-400">IST (UTC+05:30)</span>.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            <Clock size={14} />
            <span>IST (Asia/Kolkata)</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. Submission Window Opens */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                1. Submission Opens At <span className="text-violet-400">*</span>
              </label>
              <span className="text-[10px] text-zinc-500">IST (Asia/Kolkata)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={opensDate}
                onChange={(e) => setOpensDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <input
                type="time"
                required
                value={opensTime}
                onChange={(e) => setOpensTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">
              Current: {formatISTDisplay(event.submission_opens_at)}
            </div>
          </div>

          {/* 2. Submission Deadline */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                2. Submission Deadline <span className="text-violet-400">*</span>
              </label>
              <span className="text-[10px] text-zinc-500">IST (Asia/Kolkata)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">
              Current: {formatISTDisplay(event.submission_deadline_at)}
            </div>
          </div>

          {/* 3. Judging Starts */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                3. Judging Starts At <span className="text-violet-400">*</span>
              </label>
              <span className="text-[10px] text-zinc-500">IST (Asia/Kolkata)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={judgeStartsDate}
                onChange={(e) => setJudgeStartsDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <input
                type="time"
                required
                value={judgeStartsTime}
                onChange={(e) => setJudgeStartsTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">
              Current: {formatISTDisplay(event.judging_starts_at)}
            </div>
          </div>

          {/* 4. Judging Ends */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                4. Judging Ends At <span className="text-violet-400">*</span>
              </label>
              <span className="text-[10px] text-zinc-500">IST (Asia/Kolkata)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={judgeEndsDate}
                onChange={(e) => setJudgeEndsDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <input
                type="time"
                required
                value={judgeEndsTime}
                onChange={(e) => setJudgeEndsTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">
              Current: {formatISTDisplay(event.judging_ends_at)}
            </div>
          </div>

          {/* 5. Results Announcement (Optional) */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                5. Results Announcement (Optional)
              </label>
              <span className="text-[10px] text-zinc-500">IST (Asia/Kolkata)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <input
                type="date"
                value={resultsDate}
                onChange={(e) => setResultsDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <input
                type="time"
                value={resultsTime}
                onChange={(e) => setResultsTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">
              Current: {formatISTDisplay(event.results_at)}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:opacity-50"
          >
            <Save size={16} />
            Review &amp; Apply Schedule Changes
          </button>
        </div>
      </form>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl sm:p-8">
            <h3 className="text-lg font-bold text-white">Confirm Schedule Updates</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Please review the following schedule adjustments before committing to the database:
            </p>

            {/* Changed Fields Diff */}
            <div className="mt-5 space-y-3">
              {changes.map((c) => (
                <div
                  key={c.field}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs"
                >
                  <div className="font-semibold text-violet-300">{c.label}</div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                    <span className="line-through text-rose-400/80">{formatISTDisplay(c.oldVal)}</span>
                    <span className="text-zinc-600">→</span>
                    <span className="font-semibold text-emerald-400">{formatISTDisplay(c.newVal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Warnings Alert */}
            {warnings.length > 0 && (
              <div className="mt-5 space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle size={16} className="text-amber-400" />
                  Operational Warnings
                </div>
                {warnings.map((w, idx) => (
                  <p key={idx} className="leading-relaxed">
                    • {w}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSave}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10 MOST RECENT AUDIT LOG ENTRIES */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#080808]/90 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center gap-2 border-b border-white/[0.08] pb-4">
          <History size={18} className="text-violet-400" />
          <h3 className="text-base font-bold text-white">Recent Schedule Change Audit Log</h3>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No schedule updates have been logged yet.
          </div>
        ) : (
          <div className="space-y-4">
            {recentLogs.map((log) => {
              const actorDisplay =
                log.profiles?.full_name || log.profiles?.email || log.actor_id || "Administrator";
              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 text-xs"
                >
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <span className="font-semibold text-zinc-200">
                      Changed by: <span className="text-violet-400">{actorDisplay}</span>
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {formatISTDisplay(log.created_at)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {Object.entries(log.details).map(([key, val]) => {
                      if (!val || typeof val !== "object" || !("old" in val)) return null;
                      const fieldKey = key.replace(/_/g, " ");
                      return (
                        <div key={key} className="rounded-lg bg-black/40 p-2 text-[11px]">
                          <span className="capitalize text-zinc-400">{fieldKey}: </span>
                          <span className="line-through text-rose-400/80">
                            {formatISTDisplay((val as { old: string | null }).old)}
                          </span>
                          <span className="mx-1 text-zinc-600">→</span>
                          <span className="text-emerald-400">
                            {formatISTDisplay((val as { new: string | null }).new)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
