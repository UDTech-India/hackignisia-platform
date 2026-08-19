"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Send,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

type SubmissionStatus =
  | "Submitted"
  | "Draft"
  | "Under Review"
  | "Needs Changes";

type Submission = {
  id: string;
  team: string;
  teamCode: string;
  leader: string;
  track: string;
  title: string;
  submittedAt: string;
  status: SubmissionStatus;
  members: number;
  score: number | null;
};

const initialSubmissions: Submission[] = [
  {
    id: "SUB-001",
    team: "Team Vector",
    teamCode: "VX7K29",
    leader: "Aman Pathak",
    track: "AI & Machine Learning",
    title: "AI Powered Emergency Intelligence Platform",
    submittedAt: "18 Aug 2026, 08:42 PM",
    status: "Submitted",
    members: 4,
    score: null,
  },
  {
    id: "SUB-002",
    team: "Code Titans",
    teamCode: "CT82LM",
    leader: "Rahul Sharma",
    track: "Web & Full Stack",
    title: "Smart Community Management Platform",
    submittedAt: "18 Aug 2026, 06:21 PM",
    status: "Under Review",
    members: 5,
    score: 82,
  },
  {
    id: "SUB-003",
    team: "ByteForce",
    teamCode: "BF73QK",
    leader: "Priya Singh",
    track: "AI & Machine Learning",
    title: "AI Assisted Learning Companion",
    submittedAt: "17 Aug 2026, 11:05 PM",
    status: "Submitted",
    members: 4,
    score: null,
  },
  {
    id: "SUB-004",
    team: "Innovators",
    teamCode: "IN45PX",
    leader: "Arjun Mehta",
    track: "Social Impact",
    title: "Accessible Digital Services",
    submittedAt: "17 Aug 2026, 09:14 PM",
    status: "Needs Changes",
    members: 3,
    score: 61,
  },
  {
    id: "SUB-005",
    team: "TechNova",
    teamCode: "TN91ZA",
    leader: "Neha Verma",
    track: "Web & Full Stack",
    title: "Campus Collaboration Network",
    submittedAt: "16 Aug 2026, 07:32 PM",
    status: "Draft",
    members: 5,
    score: null,
  },
];

const tracks = [
  "All Tracks",
  "AI & Machine Learning",
  "Web & Full Stack",
  "Social Impact",
];

const statuses = [
  "All Status",
  "Submitted",
  "Under Review",
  "Needs Changes",
  "Draft",
];

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);

  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All Tracks");
  const [status, setStatus] = useState("All Status");
  const [selected, setSelected] =
    useState<Submission | null>(null);

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !query ||
        submission.team.toLowerCase().includes(query) ||
        submission.teamCode.toLowerCase().includes(query) ||
        submission.leader.toLowerCase().includes(query) ||
        submission.title.toLowerCase().includes(query) ||
        submission.id.toLowerCase().includes(query);

      const matchesTrack =
        track === "All Tracks" ||
        submission.track === track;

      const matchesStatus =
        status === "All Status" ||
        submission.status === status;

      return (
        matchesSearch &&
        matchesTrack &&
        matchesStatus
      );
    });
  }, [search, track, status, submissions]);

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(
      (item) => item.status === "Submitted"
    ).length,
    review: submissions.filter(
      (item) => item.status === "Under Review"
    ).length,
    draft: submissions.filter(
      (item) => item.status === "Draft"
    ).length,
  };

  function updateStatus(
    id: string,
    newStatus: SubmissionStatus
  ) {
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id
          ? {
              ...submission,
              status: newStatus,
            }
          : submission
      )
    );

    setSelected((current) =>
      current?.id === id
        ? {
            ...current,
            status: newStatus,
          }
        : current
    );
  }

  function exportCSV() {
    const headers = [
      "Submission ID",
      "Team",
      "Team Code",
      "Leader",
      "Track",
      "Project Title",
      "Members",
      "Status",
      "Score",
      "Submitted At",
    ];

    const rows = filteredSubmissions.map(
      (submission) => [
        submission.id,
        submission.team,
        submission.teamCode,
        submission.leader,
        submission.track,
        submission.title,
        submission.members,
        submission.status,
        submission.score ?? "",
        submission.submittedAt,
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "hackignisia-submissions.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* BACKGROUND */}

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

                <h1 className="mt-1 text-sm font-semibold">
                  Submissions
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-medium text-emerald-400">
                  Admin System Online
                </span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-xs font-bold text-violet-300">
                AP
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {/* PAGE INTRO */}

          <section className="mb-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                  <FileText size={12} />
                  Project Management
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Submission{" "}
                  <span className="text-violet-400">
                    Management
                  </span>
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  Review, monitor and manage project
                  submissions from all participating teams.
                </p>
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-medium text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-400/[0.05] hover:text-white"
              >
                <Download size={15} />
                Export CSV
              </button>
            </div>
          </section>

          {/* STATS */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<FileText size={18} />}
              label="Total Submissions"
              value={stats.total}
              description="All project records"
            />

            <StatCard
              icon={<CheckCircle2 size={18} />}
              label="Submitted"
              value={stats.submitted}
              description="Ready for review"
              success
            />

            <StatCard
              icon={<Clock3 size={18} />}
              label="Under Review"
              value={stats.review}
              description="Currently being reviewed"
            />

            <StatCard
              icon={<FileText size={18} />}
              label="Drafts"
              value={stats.draft}
              description="Not submitted yet"
            />
          </section>

          {/* TABLE CARD */}

          <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
            {/* TOOLBAR */}

            <div className="border-b border-white/[0.07] p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row">
                {/* SEARCH */}

                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search team, leader, project or submission ID..."
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-xs text-white outline-none placeholder:text-zinc-700 transition focus:border-violet-400/30"
                  />
                </div>

                {/* TRACK */}

                <FilterSelect
                  value={track}
                  onChange={setTrack}
                  options={tracks}
                />

                {/* STATUS */}

                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  options={statuses}
                />

                <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 text-[10px] text-zinc-600">
                  <Filter size={14} />
                  {filteredSubmissions.length} results
                </div>
              </div>
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.015]">
                    <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Submission
                    </th>

                    <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Team
                    </th>

                    <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Track
                    </th>

                    <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Members
                    </th>

                    <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Score
                    </th>

                    <th className="px-5 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubmissions.map(
                    (submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-white/[0.05] transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                              <FileText size={16} />
                            </div>

                            <div className="min-w-0">
                              <div className="font-mono text-[10px] text-violet-400">
                                {submission.id}
                              </div>

                              <div className="mt-1 max-w-[260px] truncate text-xs font-medium text-zinc-300">
                                {submission.title}
                              </div>

                              <div className="mt-1 text-[9px] text-zinc-700">
                                {submission.submittedAt}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="text-xs font-medium text-zinc-300">
                            {submission.team}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5">
                            <Users size={11} className="text-zinc-700" />
                            <span className="text-[9px] text-zinc-700">
                              {submission.leader}
                            </span>
                          </div>

                          <div className="mt-1 font-mono text-[9px] text-zinc-800">
                            {submission.teamCode}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-lg border border-violet-400/10 bg-violet-400/[0.05] px-2.5 py-1.5 text-[9px] text-violet-300">
                            {submission.track}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="text-xs text-zinc-500">
                            {submission.members}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            status={submission.status}
                          />
                        </td>

                        <td className="px-5 py-5">
                          {submission.score !== null ? (
                            <span className="text-sm font-semibold text-white">
                              {submission.score}
                              <span className="ml-1 text-[9px] text-zinc-700">
                                /100
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-700">
                              Not scored
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(submission)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-medium text-zinc-500 transition hover:border-violet-400/30 hover:text-white"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}

            <div className="space-y-3 p-4 lg:hidden">
              {filteredSubmissions.map(
                (submission) => (
                  <div
                    key={submission.id}
                    className="rounded-2xl border border-white/[0.07] bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[9px] text-violet-400">
                          {submission.id}
                        </div>

                        <h3 className="mt-1 text-sm font-semibold text-zinc-200">
                          {submission.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-zinc-700">
                          {submission.team} •{" "}
                          {submission.teamCode}
                        </p>
                      </div>

                      <StatusBadge
                        status={submission.status}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <InfoBox
                        label="Track"
                        value={submission.track}
                      />

                      <InfoBox
                        label="Members"
                        value={String(
                          submission.members
                        )}
                      />

                      <InfoBox
                        label="Leader"
                        value={submission.leader}
                      />

                      <InfoBox
                        label="Score"
                        value={
                          submission.score !== null
                            ? `${submission.score}/100`
                            : "Not scored"
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelected(submission)
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs text-zinc-400 hover:text-white"
                    >
                      <Eye size={14} />
                      View Submission
                    </button>
                  </div>
                )
              )}
            </div>

            {filteredSubmissions.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-700">
                  <Search size={20} />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  No submissions found
                </h3>

                <p className="mt-2 text-xs text-zinc-700">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </section>

          {/* FOOTER */}

          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-[10px] text-zinc-700 sm:flex-row">
            <p>
              HackIGNISIA 2026 • Admin Management
            </p>

            <div className="flex gap-4">
              <Link
                href="/admin"
                className="transition hover:text-zinc-400"
              >
                Admin Dashboard
              </Link>

              <Link
                href="/admin/teams"
                className="transition hover:text-zinc-400"
              >
                Teams
              </Link>

              <Link
                href="/admin/participants"
                className="transition hover:text-zinc-400"
              >
                Participants
              </Link>
            </div>
          </footer>
        </div>
      </div>

      {/* DETAIL MODAL */}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.07] bg-[#0a0a0a]/95 p-5 backdrop-blur-xl">
              <div>
                <div className="font-mono text-[9px] text-violet-400">
                  {selected.id}
                </div>

                <h2 className="mt-1 text-lg font-semibold">
                  Submission Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-600 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={selected.status}
                  />

                  <span className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[9px] text-zinc-600">
                    {selected.track}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold">
                  {selected.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-zinc-600">
                  Submitted by{" "}
                  <span className="text-zinc-400">
                    {selected.team}
                  </span>{" "}
                  and led by{" "}
                  <span className="text-zinc-400">
                    {selected.leader}
                  </span>
                  .
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailBox
                  label="Team"
                  value={selected.team}
                />

                <DetailBox
                  label="Team Code"
                  value={selected.teamCode}
                />

                <DetailBox
                  label="Team Members"
                  value={String(selected.members)}
                />

                <DetailBox
                  label="Submitted"
                  value={selected.submittedAt}
                />
              </div>

              <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-5">
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                  <ShieldCheck size={13} />
                  Admin Review
                </div>

                <p className="mt-3 text-xs leading-6 text-zinc-600">
                  Backend submission data and judge
                  evaluation will be connected by Anusha
                  through Supabase.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton
                    label="Mark Under Review"
                    icon={<Clock3 size={13} />}
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        "Under Review"
                      )
                    }
                  />

                  <ActionButton
                    label="Mark Submitted"
                    icon={<CheckCircle2 size={13} />}
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        "Submitted"
                      )
                    }
                  />

                  <ActionButton
                    label="Needs Changes"
                    icon={<XCircle size={13} />}
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        "Needs Changes"
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-xs text-zinc-500 transition hover:text-white"
                >
                  <Send size={14} />
                  Contact Team
                </button>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-violet-400 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  success = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.12]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
          {icon}
        </div>

        {success && (
          <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        )}
      </div>

      <div className="mt-5 text-[9px] uppercase tracking-[0.16em] text-zinc-700">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-[10px] text-zinc-700">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative min-w-[180px]">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-black/20 px-4 pr-10 text-xs text-zinc-400 outline-none transition focus:border-violet-400/30"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#0a0a0a]"
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700"
      />
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: SubmissionStatus;
}) {
  const config: Record<
    SubmissionStatus,
    {
      className: string;
      icon: React.ReactNode;
    }
  > = {
    Submitted: {
      className:
        "border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-400",
      icon: <CheckCircle2 size={11} />,
    },

    "Under Review": {
      className:
        "border-amber-400/10 bg-amber-400/[0.05] text-amber-400",
      icon: <Clock3 size={11} />,
    },

    Draft: {
      className:
        "border-white/10 bg-white/[0.03] text-zinc-500",
      icon: <FileText size={11} />,
    },

    "Needs Changes": {
      className:
        "border-red-400/10 bg-red-400/[0.05] text-red-400",
      icon: <XCircle size={11} />,
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-medium ${current.className}`}
    >
      {current.icon}
      {status}
    </span>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
      <div className="text-[8px] uppercase tracking-wider text-zinc-700">
        {label}
      </div>

      <div className="mt-1 truncate text-[10px] text-zinc-400">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="text-[9px] uppercase tracking-[0.15em] text-zinc-700">
        {label}
      </div>

      <div className="mt-2 text-xs font-medium text-zinc-300">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-[10px] text-zinc-500 transition hover:border-violet-400/30 hover:bg-violet-400/[0.04] hover:text-white"
    >
      {icon}
      {label}
    </button>
  );
}