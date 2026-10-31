"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export type EventDates = {
  id?: string;
  submission_opens_at: string | null;
  submission_deadline_at: string | null;
  judging_starts_at?: string | null;
  judging_ends_at?: string | null;
  results_at?: string | null;
} | null;

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

export function formatISTDate(isoString: string | null | undefined): string {
  if (!isoString) return "TBA";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatISTDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "TBA";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "TBA";
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

export default function SubmissionCountdown({ event }: { event: EventDates }) {
  const [mounted, setMounted] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string>("Loading Schedule...");
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!event || !event.submission_opens_at || !event.submission_deadline_at) {
      setStatusLabel("Submission Dates Announced Soon");
      setTargetTime(null);
      return;
    }

    const opensMs = new Date(event.submission_opens_at).getTime();
    const deadlineMs = new Date(event.submission_deadline_at).getTime();

    function evaluateWindow() {
      const now = Date.now();
      if (now < opensMs) {
        setStatusLabel("Submissions Open In");
        setTargetTime(opensMs);
      } else if (now >= opensMs && now <= deadlineMs) {
        setStatusLabel("Submission Window Closes In");
        setTargetTime(deadlineMs);
      } else {
        setStatusLabel("Submissions Closed");
        setTargetTime(null);
      }
    }

    evaluateWindow();
    const interval = setInterval(evaluateWindow, 1000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (!targetTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      return;
    }

    function calculateTime() {
      const now = Date.now();
      const diff = (targetTime as number) - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (!mounted) {
    return (
      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 backdrop-blur-xl">
        <Clock size={16} className="text-violet-400" />
        <span className="text-xs text-zinc-500">Loading countdown...</span>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="mt-8 inline-flex flex-col gap-3 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.07] via-white/[0.03] to-transparent p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500"></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
          {statusLabel}
        </span>
      </div>

      {targetTime !== null && !timeLeft.isExpired ? (
        <div className="flex items-center gap-2 font-mono text-lg font-bold sm:gap-3 sm:text-xl">
          <div className="flex flex-col items-center">
            <span className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-white shadow-inner">
              {pad(timeLeft.days)}
            </span>
            <span className="mt-1 text-[9px] font-normal uppercase tracking-wider text-zinc-500">
              Days
            </span>
          </div>
          <span className="pb-4 text-violet-400">:</span>

          <div className="flex flex-col items-center">
            <span className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-white shadow-inner">
              {pad(timeLeft.hours)}
            </span>
            <span className="mt-1 text-[9px] font-normal uppercase tracking-wider text-zinc-500">
              Hours
            </span>
          </div>
          <span className="pb-4 text-violet-400">:</span>

          <div className="flex flex-col items-center">
            <span className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-white shadow-inner">
              {pad(timeLeft.minutes)}
            </span>
            <span className="mt-1 text-[9px] font-normal uppercase tracking-wider text-zinc-500">
              Min
            </span>
          </div>
          <span className="pb-4 text-violet-400">:</span>

          <div className="flex flex-col items-center">
            <span className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-violet-400 shadow-inner">
              {pad(timeLeft.seconds)}
            </span>
            <span className="mt-1 text-[9px] font-normal uppercase tracking-wider text-zinc-500">
              Sec
            </span>
          </div>
        </div>
      ) : (
        <span className="text-xs font-medium text-zinc-400">
          {statusLabel === "Submissions Closed" ? "Submissions have concluded." : "Schedule to be published."}
        </span>
      )}
    </div>
  );
}

