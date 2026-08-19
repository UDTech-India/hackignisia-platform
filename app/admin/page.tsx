"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Tab = "participants" | "teams" | "submissions";

type Participant = {
  id: string;
  name: string;
  email: string;
  college: string;
  role: string;
  status: "Registered" | "Pending";
};

type Team = {
  id: string;
  name: string;
  leader: string;
  members: number;
  track: string;
  status: "Active" | "Incomplete";
};

type Submission = {
  id: string;
  team: string;
  project: string;
  track: string;
  status: "Draft" | "Submitted" | "Under Review";
};

/* =========================================================
   DEMO DATA
   Replace later with Supabase data.
========================================================= */

const participants: Participant[] = [
  {
    id: "IGN26-00482",
    name: "Aman Pathak",
    email: "aman@example.com",
    college: "Maharishi University of Information Technology",
    role: "Participant",
    status: "Registered",
  },
  {
    id: "IGN26-00483",
    name: "Anusha Anu Prasad",
    email: "anusha@example.com",
    college: "MUIT",
    role: "Participant",
    status: "Registered",
  },
  {
    id: "IGN26-00484",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    college: "Delhi University",
    role: "Participant",
    status: "Registered",
  },
  {
    id: "IGN26-00485",
    name: "Priya Singh",
    email: "priya@example.com",
    college: "Amity University",
    role: "Participant",
    status: "Pending",
  },
  {
    id: "IGN26-00486",
    name: "Arjun Mehta",
    email: "arjun@example.com",
    college: "Galgotias University",
    role: "Participant",
    status: "Registered",
  },
];

const teams: Team[] = [
  {
    id: "TEAM-001",
    name: "Team Vector",
    leader: "Aman Pathak",
    members: 4,
    track: "AI & Machine Learning",
    status: "Active",
  },
  {
    id: "TEAM-002",
    name: "CodeForge",
    leader: "Rahul Sharma",
    members: 5,
    track: "Web & Full Stack",
    status: "Active",
  },
  {
    id: "TEAM-003",
    name: "InnovateX",
    leader: "Priya Singh",
    members: 2,
    track: "Social Impact",
    status: "Incomplete",
  },
  {
    id: "TEAM-004",
    name: "ByteBuilders",
    leader: "Arjun Mehta",
    members: 5,
    track: "AI & Machine Learning",
    status: "Active",
  },
];

const submissions: Submission[] = [
  {
    id: "SUB-001",
    team: "Team Vector",
    project: "AI-powered Emergency Response",
    track: "AI & Machine Learning",
    status: "Draft",
  },
  {
    id: "SUB-002",
    team: "CodeForge",
    project: "Smart Campus Platform",
    track: "Web & Full Stack",
    status: "Submitted",
  },
  {
    id: "SUB-003",
    team: "InnovateX",
    project: "Community Connect",
    track: "Social Impact",
    status: "Under Review",
  },
  {
    id: "SUB-004",
    team: "ByteBuilders",
    project: "Predictive Health Assistant",
    track: "AI & Machine Learning",
    status: "Submitted",
  },
];

/* =========================================================
   MAIN
========================================================= */

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("participants");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredParticipants = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return participants;

    return participants.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.college.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }, [search]);

  const filteredTeams = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return teams;

    return teams.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.leader.toLowerCase().includes(query) ||
        item.track.toLowerCase().includes(query)
    );
  }, [search]);

  const filteredSubmissions = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return submissions;

    return submissions.filter(
      (item) =>
        item.team.toLowerCase().includes(query) ||
        item.project.toLowerCase().includes(query) ||
        item.track.toLowerCase().includes(query)
    );
  }, [search]);

  function exportCSV() {
    let rows: string[] = [];

    if (tab === "participants") {
      rows = [
        "Registration ID,Name,Email,College,Role,Status",
        ...filteredParticipants.map(
          (item) =>
            `"${item.id}","${item.name}","${item.email}","${item.college}","${item.role}","${item.status}"`
        ),
      ];
    }

    if (tab === "teams") {
      rows = [
        "Team ID,Team Name,Leader,Members,Track,Status",
        ...filteredTeams.map(
          (item) =>
            `"${item.id}","${item.name}","${item.leader}","${item.members}","${item.track}","${item.status}"`
        ),
      ];
    }

    if (tab === "submissions") {
      rows = [
        "Submission ID,Team,Project,Track,Status",
        ...filteredSubmissions.map(
          (item) =>
            `"${item.id}","${item.team}","${item.project}","${item.track}","${item.status}"`
        ),
      ];
    }

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `hackignisia-${tab}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Background />

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="relative flex min-h-screen">
        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.08] bg-[#080808]/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-white/[0.08] px-5">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400 font-black text-black">
                H
              </div>

              <div>
                <div className="text-sm font-bold">
                  HackIGNISIA
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Admin Console
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pt-5">
            <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <div className="text-xs font-semibold">
                    Administrator
                  </div>

                  <div className="mt-1 text-[10px] text-zinc-600">
                    HackIGNISIA 2026
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] text-emerald-400">
                  System operational
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="mb-3 px-3 text-[9px] uppercase tracking-[0.2em] text-zinc-700">
              Management
            </div>

            <AdminNav
              icon={<LayoutDashboard size={17} />}
              label="Overview"
              active
            />

            <AdminNav
              icon={<Users size={17} />}
              label="Participants"
              onClick={() => {
                setTab("participants");
                setSidebarOpen(false);
              }}
            />

            <AdminNav
              icon={<Users size={17} />}
              label="Teams"
              onClick={() => {
                setTab("teams");
                setSidebarOpen(false);
              }}
            />

            <AdminNav
              icon={<FileCheck2 size={17} />}
              label="Submissions"
              onClick={() => {
                setTab("submissions");
                setSidebarOpen(false);
              }}
            />

            <AdminNav
              icon={<BarChart3 size={17} />}
              label="Analytics"
              badge="Soon"
            />

            <div className="mb-3 mt-8 px-3 text-[9px] uppercase tracking-[0.2em] text-zinc-700">
              Event
            </div>

            <AdminNav
              icon={<Bell size={17} />}
              label="Announcements"
              href="/dashboard/announcement"
            />

            <AdminNav
              icon={<FileText size={17} />}
              label="Event Website"
              href="/"
            />
          </nav>

          <div className="border-t border-white/[0.08] p-4">
            <div className="rounded-xl bg-white/[0.02] p-3">
              <div className="text-[9px] uppercase tracking-wider text-zinc-700">
                Event status
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs text-zinc-400">
                  Registration Active
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <div className="min-w-0 flex-1">
          {/* TOPBAR */}

          <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 lg:hidden"
                >
                  <Menu size={18} />
                </button>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-700">
                    HackIGNISIA 2026
                  </div>

                  <div className="mt-1 text-sm font-semibold">
                    Admin Dashboard
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-zinc-500 hover:text-white"
                >
                  <Bell size={18} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                </button>

                <div className="hidden h-7 w-px bg-white/10 sm:block" />

                <div className="hidden text-right sm:block">
                  <div className="text-xs font-medium">
                    Admin
                  </div>

                  <div className="mt-0.5 text-[10px] text-zinc-600">
                    Organizer
                  </div>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-xs font-semibold text-violet-300">
                  AD
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}

          <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {/* HEADER */}

            <section>
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-violet-300">
                    <Activity size={11} />
                    Control Center
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Event Overview
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                    Manage participants, teams and project
                    submissions from one centralized workspace.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportCSV}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
                >
                  <Download size={15} />
                  Export CSV
                </button>
              </div>
            </section>

            {/* STATS */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStat
                icon={<Users size={18} />}
                label="Participants"
                value="248"
                description="+18 this week"
              />

              <AdminStat
                icon={<Users size={18} />}
                label="Teams"
                value="64"
                description="58 complete teams"
              />

              <AdminStat
                icon={<FileCheck2 size={18} />}
                label="Submissions"
                value="42"
                description="24 submitted"
              />

              <AdminStat
                icon={<Activity size={18} />}
                label="Registration"
                value="Active"
                description="Event registration open"
                success
              />
            </section>

            {/* TABLE CARD */}

            <section className="mt-7 rounded-3xl border border-white/[0.08] bg-white/[0.025]">
              {/* TABLE HEADER */}

              <div className="border-b border-white/[0.07] p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                      Data Management
                    </div>

                    <h2 className="mt-2 text-lg font-semibold">
                      {tab === "participants"
                        ? "Participants"
                        : tab === "teams"
                        ? "Teams"
                        : "Project Submissions"}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-700">
                      Review and manage event records.
                    </p>
                  </div>

                  <div className="relative w-full xl:w-[320px]">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700"
                    />

                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder={`Search ${tab}...`}
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/30"
                    />
                  </div>
                </div>

                {/* TABS */}

                <div className="mt-6 flex gap-2 overflow-x-auto">
                  <TabButton
                    active={tab === "participants"}
                    onClick={() => {
                      setTab("participants");
                      setSearch("");
                    }}
                  >
                    Participants
                  </TabButton>

                  <TabButton
                    active={tab === "teams"}
                    onClick={() => {
                      setTab("teams");
                      setSearch("");
                    }}
                  >
                    Teams
                  </TabButton>

                  <TabButton
                    active={tab === "submissions"}
                    onClick={() => {
                      setTab("submissions");
                      setSearch("");
                    }}
                  >
                    Submissions
                  </TabButton>
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                {tab === "participants" && (
                  <ParticipantsTable
                    data={filteredParticipants}
                  />
                )}

                {tab === "teams" && (
                  <TeamsTable data={filteredTeams} />
                )}

                {tab === "submissions" && (
                  <SubmissionsTable
                    data={filteredSubmissions}
                  />
                )}
              </div>

              {/* PAGINATION */}

              <div className="flex flex-col justify-between gap-4 border-t border-white/[0.07] p-5 sm:flex-row sm:items-center">
                <div className="text-[10px] text-zinc-700">
                  Showing page {page} • Demo data
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="rounded-lg border border-white/10 p-2 text-zinc-600 hover:text-white"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-violet-400/10 px-2 text-[10px] font-medium text-violet-300">
                    {page}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="rounded-lg border border-white/10 p-2 text-zinc-600 hover:text-white"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </section>

            {/* FOOTER */}

            <footer className="mt-8 border-t border-white/[0.06] pt-6">
              <div className="flex flex-col justify-between gap-2 text-[10px] text-zinc-700 sm:flex-row">
                <p>
                  HackIGNISIA 2026 • UDTech India
                </p>

                <p>
                  Admin Console • Frontend Preview
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PARTICIPANTS TABLE
========================================================= */

function ParticipantsTable({
  data,
}: {
  data: Participant[];
}) {
  return (
    <table className="w-full min-w-[900px]">
      <thead>
        <tr className="border-b border-white/[0.06] text-left">
          <TableHead>ID</TableHead>
          <TableHead>Participant</TableHead>
          <TableHead>College</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className="border-b border-white/[0.05] transition hover:bg-white/[0.015]"
          >
            <TableCell>
              <span className="font-mono text-[10px] text-violet-300">
                {item.id}
              </span>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-3">
                <Initials name={item.name} />

                <div>
                  <div className="text-xs font-medium text-zinc-300">
                    {item.name}
                  </div>

                  <div className="mt-1 text-[10px] text-zinc-700">
                    {item.email}
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-xs text-zinc-500">
                {item.college}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-[10px] text-zinc-600">
                {item.role}
              </span>
            </TableCell>

            <TableCell>
              <StatusBadge status={item.status} />
            </TableCell>

            <TableCell>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-[10px] text-zinc-600 hover:text-white"
              >
                View
              </button>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================
   TEAMS TABLE
========================================================= */

function TeamsTable({ data }: { data: Team[] }) {
  return (
    <table className="w-full min-w-[850px]">
      <thead>
        <tr className="border-b border-white/[0.06] text-left">
          <TableHead>Team ID</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Leader</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Track</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className="border-b border-white/[0.05] transition hover:bg-white/[0.015]"
          >
            <TableCell>
              <span className="font-mono text-[10px] text-violet-300">
                {item.id}
              </span>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                  <Users size={15} />
                </div>

                <span className="text-xs font-medium text-zinc-300">
                  {item.name}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-xs text-zinc-500">
                {item.leader}
              </span>
            </TableCell>

            <TableCell>
              <span className="rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-zinc-400">
                {item.members} members
              </span>
            </TableCell>

            <TableCell>
              <span className="text-[10px] text-zinc-600">
                {item.track}
              </span>
            </TableCell>

            <TableCell>
              <StatusBadge status={item.status} />
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================
   SUBMISSIONS TABLE
========================================================= */

function SubmissionsTable({
  data,
}: {
  data: Submission[];
}) {
  return (
    <table className="w-full min-w-[850px]">
      <thead>
        <tr className="border-b border-white/[0.06] text-left">
          <TableHead>ID</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Track</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr
            key={item.id}
            className="border-b border-white/[0.05] transition hover:bg-white/[0.015]"
          >
            <TableCell>
              <span className="font-mono text-[10px] text-violet-300">
                {item.id}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-xs font-medium text-zinc-300">
                {item.team}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-xs text-zinc-500">
                {item.project}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-[10px] text-zinc-600">
                {item.track}
              </span>
            </TableCell>

            <TableCell>
              <StatusBadge status={item.status} />
            </TableCell>

            <TableCell>
              <button
                type="button"
                className="rounded-lg border border-white/10 px-3 py-2 text-[10px] text-zinc-600 hover:text-white"
              >
                Review
              </button>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/[0.06] blur-[150px]" />

      <div className="absolute bottom-[-300px] left-[-200px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[130px]" />

      <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.02] blur-[140px]" />
    </div>
  );
}

function AdminNav({
  icon,
  label,
  active = false,
  badge,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
  onClick?: () => void;
}) {
  const className = `group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${
    active
      ? "border border-violet-400/10 bg-violet-400/[0.07] text-white"
      : "text-zinc-600 hover:bg-white/[0.035] hover:text-zinc-300"
  }`;

  const content = (
    <>
      <span
        className={
          active
            ? "text-violet-400"
            : "group-hover:text-zinc-300"
        }
      >
        {icon}
      </span>

      <span>{label}</span>

      {badge && (
        <span className="ml-auto rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-zinc-700">
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
}

function AdminStat({
  icon,
  label,
  value,
  description,
  success = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        )}
      </div>

      <div className="mt-5 text-[9px] uppercase tracking-[0.16em] text-zinc-700">
        {label}
      </div>

      <div className="mt-1 text-xl font-semibold">
        {value}
      </div>

      <div className="mt-1 text-[10px] text-zinc-700">
        {description}
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium transition ${
        active
          ? "bg-violet-400 text-black"
          : "border border-white/10 bg-white/[0.02] text-zinc-600 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-700">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <td className="px-5 py-4">{children}</td>;
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-[10px] font-semibold text-violet-300">
      {initials}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    | "Registered"
    | "Pending"
    | "Active"
    | "Incomplete"
    | "Draft"
    | "Submitted"
    | "Under Review";
}) {
  const positive =
    status === "Registered" ||
    status === "Active" ||
    status === "Submitted";

  const warning =
    status === "Pending" ||
    status === "Incomplete" ||
    status === "Draft";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-medium ${
        positive
          ? "bg-emerald-400/[0.07] text-emerald-400"
          : warning
          ? "bg-amber-400/[0.07] text-amber-400"
          : "bg-violet-400/[0.07] text-violet-300"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}