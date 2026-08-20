"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Download,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type TeamStatus = "Active" | "Full" | "Incomplete";

type TeamMember = {
  name: string;
  email: string;
  role: "Leader" | "Member";
  initials: string;
};

type Team = {
  id: string;
  name: string;
  code: string;
  track: string;
  status: TeamStatus;
  members: number;
  maxMembers: number;
  leader: string;
  college: string;
  createdAt: string;
  membersList: TeamMember[];
};

/* =========================================================
   DUMMY DATA
   Replace with Supabase later.
========================================================= */

const teams: Team[] = [
  {
    id: "TEAM-001",
    name: "Team Vector",
    code: "VX7K29",
    track: "AI & ML",
    status: "Active",
    members: 4,
    maxMembers: 5,
    leader: "Aman Pathak",
    college: "Maharishi University of Information Technology",
    createdAt: "18 Aug 2026",
    membersList: [
      {
        name: "Aman Pathak",
        email: "aman@example.com",
        role: "Leader",
        initials: "AP",
      },
      {
        name: "Anusha Anu Prasad",
        email: "anusha@example.com",
        role: "Member",
        initials: "AA",
      },
      {
        name: "Team Member",
        email: "member1@example.com",
        role: "Member",
        initials: "TM",
      },
      {
        name: "Team Member",
        email: "member2@example.com",
        role: "Member",
        initials: "TM",
      },
    ],
  },
  {
    id: "TEAM-002",
    name: "Code Titans",
    code: "CT8P42",
    track: "Web3",
    status: "Active",
    members: 3,
    maxMembers: 5,
    leader: "Rahul Sharma",
    college: "Delhi University",
    createdAt: "18 Aug 2026",
    membersList: [
      {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        role: "Leader",
        initials: "RS",
      },
      {
        name: "Vikas Kumar",
        email: "vikas@example.com",
        role: "Member",
        initials: "VK",
      },
      {
        name: "Aditya Singh",
        email: "aditya@example.com",
        role: "Member",
        initials: "AS",
      },
    ],
  },
  {
    id: "TEAM-003",
    name: "TechNova",
    code: "TN4M81",
    track: "FinTech",
    status: "Full",
    members: 5,
    maxMembers: 5,
    leader: "Priya Singh",
    college: "Amity University",
    createdAt: "17 Aug 2026",
    membersList: [
      {
        name: "Priya Singh",
        email: "priya@example.com",
        role: "Leader",
        initials: "PS",
      },
      {
        name: "Riya Sharma",
        email: "riya@example.com",
        role: "Member",
        initials: "RS",
      },
      {
        name: "Kunal Verma",
        email: "kunal@example.com",
        role: "Member",
        initials: "KV",
      },
      {
        name: "Aman Gupta",
        email: "aman.g@example.com",
        role: "Member",
        initials: "AG",
      },
      {
        name: "Nikhil Jain",
        email: "nikhil@example.com",
        role: "Member",
        initials: "NJ",
      },
    ],
  },
  {
    id: "TEAM-004",
    name: "ByteForce",
    code: "BF2R67",
    track: "AI & ML",
    status: "Active",
    members: 4,
    maxMembers: 5,
    leader: "Neha Gupta",
    college: "Galgotias University",
    createdAt: "16 Aug 2026",
    membersList: [
      {
        name: "Neha Gupta",
        email: "neha@example.com",
        role: "Leader",
        initials: "NG",
      },
      {
        name: "Rohan Das",
        email: "rohan@example.com",
        role: "Member",
        initials: "RD",
      },
      {
        name: "Sakshi Jain",
        email: "sakshi@example.com",
        role: "Member",
        initials: "SJ",
      },
      {
        name: "Arnav Mehta",
        email: "arnav@example.com",
        role: "Member",
        initials: "AM",
      },
    ],
  },
  {
    id: "TEAM-005",
    name: "Innovators",
    code: "IN9Q34",
    track: "HealthTech",
    status: "Incomplete",
    members: 2,
    maxMembers: 5,
    leader: "Karan Mehta",
    college: "Sharda University",
    createdAt: "16 Aug 2026",
    membersList: [
      {
        name: "Karan Mehta",
        email: "karan@example.com",
        role: "Leader",
        initials: "KM",
      },
      {
        name: "Piyush Shah",
        email: "piyush@example.com",
        role: "Member",
        initials: "PS",
      },
    ],
  },
  {
    id: "TEAM-006",
    name: "NextGen",
    code: "NG5X73",
    track: "AI & ML",
    status: "Active",
    members: 3,
    maxMembers: 5,
    leader: "Simran Kaur",
    college: "DTU",
    createdAt: "15 Aug 2026",
    membersList: [
      {
        name: "Simran Kaur",
        email: "simran@example.com",
        role: "Leader",
        initials: "SK",
      },
      {
        name: "Harsh Raj",
        email: "harsh@example.com",
        role: "Member",
        initials: "HR",
      },
      {
        name: "Megha Jain",
        email: "megha@example.com",
        role: "Member",
        initials: "MJ",
      },
    ],
  },
];

/* =========================================================
   MAIN
========================================================= */

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackFilter, setTrackFilter] = useState("All");
  const [selectedTeam, setSelectedTeam] =
    useState<Team | null>(null);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query) ||
        team.leader.toLowerCase().includes(query) ||
        team.college.toLowerCase().includes(query) ||
        team.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        team.status === statusFilter;

      const matchesTrack =
        trackFilter === "All" ||
        team.track === trackFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTrack
      );
    });
  }, [search, statusFilter, trackFilter]);

  const totalMembers = teams.reduce(
    (sum, team) => sum + team.members,
    0
  );

  const fullTeams = teams.filter(
    (team) => team.status === "Full"
  ).length;

  const incompleteTeams = teams.filter(
    (team) => team.status === "Incomplete"
  ).length;

  function exportCSV() {
    const headers = [
      "Team ID",
      "Team Name",
      "Team Code",
      "Track",
      "Status",
      "Members",
      "Max Members",
      "Leader",
      "College",
      "Created At",
    ];

    const rows = filteredTeams.map((team) => [
      team.id,
      team.name,
      team.code,
      team.track,
      team.status,
      team.members,
      team.maxMembers,
      team.leader,
      team.college,
      team.createdAt,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
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
    link.download = "hackignisia-teams.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[550px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/[0.055] blur-[150px]" />

        <div className="absolute bottom-[-200px] right-[-150px] h-[450px] w-[450px] rounded-full bg-indigo-500/[0.025] blur-[130px]" />
      </div>

      <div className="relative">
        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-500 transition hover:border-violet-400/20 hover:text-white"
              >
                <ArrowLeft size={17} />
              </Link>

              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Admin Portal
                </div>

                <h1 className="mt-1 text-sm font-semibold">
                  Teams
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportCSV}
                className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:text-white sm:flex"
              >
                <Download size={15} />
                Export CSV
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400 text-xs font-black text-black">
                A
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* PAGE HEADER */}

          <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-violet-300">
                <Users size={12} />
                Team Management
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Registered Teams
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                Monitor team formation, member capacity,
                tracks and team leaders for HackIGNISIA 2026.
              </p>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-5 py-3 text-xs font-semibold text-black transition hover:bg-violet-300 sm:hidden"
            >
              <Download size={15} />
              Export CSV
            </button>
          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={18} />}
              label="Total Teams"
              value={String(teams.length)}
              description="Registered teams"
            />

            <StatCard
              icon={<ShieldCheck size={18} />}
              label="Total Members"
              value={String(totalMembers)}
              description="Across all teams"
              success
            />

            <StatCard
              icon={<Crown size={18} />}
              label="Full Teams"
              value={String(fullTeams)}
              description="Reached max capacity"
            />

            <StatCard
              icon={<UserPlusIcon />}
              label="Incomplete"
              value={String(incompleteTeams)}
              description="Teams below capacity"
            />
          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
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
                  placeholder="Search team name, code, leader, college..."
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-10 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/30"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* STATUS */}

              <div className="relative">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-black/20 pl-9 pr-10 text-xs text-zinc-400 outline-none focus:border-violet-400/30 xl:w-40"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Full">Full</option>
                  <option value="Incomplete">
                    Incomplete
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700"
                />
              </div>

              {/* TRACK */}

              <div className="relative">
                <select
                  value={trackFilter}
                  onChange={(event) =>
                    setTrackFilter(event.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-black/20 px-4 pr-10 text-xs text-zinc-400 outline-none focus:border-violet-400/30 xl:w-48"
                >
                  <option value="All">All Tracks</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Web3">Web3</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">
                    HealthTech
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-700"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              TABLE
          ================================================= */}

          <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
            <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h3 className="text-sm font-semibold">
                  Teams List
                </h3>

                <p className="mt-1 text-[10px] text-zinc-700">
                  Showing {filteredTeams.length} of{" "}
                  {teams.length} teams
                </p>
              </div>

              <span className="text-[10px] text-zinc-700">
                HackIGNISIA 2026
              </span>
            </div>

            {/* DESKTOP */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Team
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Leader
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Members
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Track
                    </th>

                    <th className="px-4 py-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeams.map((team) => (
                    <tr
                      key={team.id}
                      className="border-b border-white/[0.05] transition hover:bg-white/[0.018]"
                    >
                      {/* TEAM */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <TeamAvatar name={team.name} />

                          <div>
                            <div className="text-xs font-semibold text-zinc-300">
                              {team.name}
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-mono text-[10px] tracking-wider text-violet-400/80">
                                {team.code}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  navigator.clipboard?.writeText(
                                    team.code
                                  )
                                }
                                className="text-zinc-700 hover:text-white"
                                title="Copy team code"
                              >
                                <Copy size={11} />
                              </button>
                            </div>

                            <div className="mt-1 text-[9px] text-zinc-700">
                              {team.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* LEADER */}

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-[9px] font-bold text-violet-300">
                            {getInitials(team.leader)}
                          </div>

                          <div>
                            <div className="text-xs text-zinc-400">
                              {team.leader}
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-[9px] text-violet-400">
                              <Crown size={9} />
                              Team Leader
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* MEMBERS */}

                      <td className="px-4 py-4">
                        <div className="w-28">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400">
                              {team.members}/
                              {team.maxMembers}
                            </span>

                            <span className="text-[9px] text-zinc-700">
                              {Math.round(
                                (team.members /
                                  team.maxMembers) *
                                  100
                              )}
                              %
                            </span>
                          </div>

                          <div className="mt-2 flex gap-1">
                            {Array.from({
                              length: team.maxMembers,
                            }).map((_, index) => (
                              <div
                                key={index}
                                className={`h-1.5 flex-1 rounded-full ${
                                  index < team.members
                                    ? "bg-violet-400"
                                    : "bg-white/[0.07]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* TRACK */}

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg border border-violet-400/10 bg-violet-400/[0.05] px-2.5 py-1.5 text-[9px] text-violet-300">
                          {team.track}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <TeamStatusBadge
                          status={team.status}
                        />
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTeam(team)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-zinc-600 transition hover:border-violet-400/20 hover:text-violet-300"
                            title="View team"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-zinc-600 transition hover:border-white/15 hover:text-white"
                            title="More options"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}

            <div className="divide-y divide-white/[0.05] lg:hidden">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <TeamAvatar name={team.name} />

                      <div>
                        <div className="text-xs font-semibold text-zinc-300">
                          {team.name}
                        </div>

                        <div className="mt-1 font-mono text-[9px] text-violet-400">
                          {team.code}
                        </div>
                      </div>
                    </div>

                    <TeamStatusBadge
                      status={team.status}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <InfoBox
                      label="Leader"
                      value={team.leader}
                    />

                    <InfoBox
                      label="Track"
                      value={team.track}
                    />

                    <InfoBox
                      label="Members"
                      value={`${team.members}/${team.maxMembers}`}
                    />

                    <InfoBox
                      label="Created"
                      value={team.createdAt}
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTeam(team)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-xs text-zinc-400 transition hover:border-violet-400/20 hover:text-white"
                    >
                      <Eye size={14} />
                      View Team
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          team.code
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-600 transition hover:text-white"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* EMPTY */}

            {filteredTeams.length === 0 && (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-700">
                  <Search size={20} />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  No teams found
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
              HackIGNISIA 2026 • Admin Team Management
            </p>

            <Link
              href="/admin"
              className="flex items-center gap-1 transition hover:text-zinc-400"
            >
              Back to Admin Dashboard
              <ChevronRight size={12} />
            </Link>
          </footer>
        </div>
      </div>

      {/* =================================================
          TEAM DETAIL MODAL
      ================================================= */}

      {selectedTeam && (
        <TeamModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </main>
  );
}

/* =========================================================
   TEAM MODAL
========================================================= */

function TeamModal({
  team,
  onClose,
}: {
  team: Team;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#0b0b0b] shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
          <div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-violet-400">
              Team Details
            </div>

            <h3 className="mt-2 text-lg font-semibold">
              {team.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-600 transition hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <TeamAvatar
              name={team.name}
              large
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xl font-semibold">
                  {team.name}
                </h4>

                <TeamStatusBadge
                  status={team.status}
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-[0.15em] text-violet-300">
                  {team.code}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      team.code
                    )
                  }
                  className="text-zinc-600 transition hover:text-white"
                  title="Copy team code"
                >
                  <Copy size={13} />
                </button>
              </div>

              <div className="mt-1 text-[10px] text-zinc-700">
                {team.id}
              </div>
            </div>
          </div>

          {/* TEAM INFO */}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Team Leader"
              value={team.leader}
              icon={<Crown size={14} />}
            />

            <DetailItem
              label="Track"
              value={team.track}
              icon={<ShieldCheck size={14} />}
            />

            <DetailItem
              label="College"
              value={team.college}
              icon={<Users size={14} />}
            />

            <DetailItem
              label="Created"
              value={team.createdAt}
              icon={<Users size={14} />}
            />
          </div>

          {/* MEMBERS */}

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">
                  Team Members
                </h4>

                <p className="mt-1 text-[10px] text-zinc-700">
                  {team.members} of {team.maxMembers} spots
                  occupied
                </p>
              </div>

              <div className="text-xs font-medium text-violet-400">
                {Math.round(
                  (team.members / team.maxMembers) * 100
                )}
                %
              </div>
            </div>

            <div className="mt-3 flex gap-1.5">
              {Array.from({
                length: team.maxMembers,
              }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index < team.members
                      ? "bg-violet-400"
                      : "bg-white/[0.07]"
                  }`}
                />
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {team.membersList.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-xs font-bold text-violet-300">
                    {member.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-zinc-300">
                      {member.name}
                    </div>

                    <div className="mt-1 truncate text-[10px] text-zinc-700">
                      {member.email}
                    </div>
                  </div>

                  {member.role === "Leader" ? (
                    <span className="flex items-center gap-1 rounded-lg bg-violet-400/10 px-2 py-1.5 text-[8px] uppercase tracking-wider text-violet-400">
                      <Crown size={9} />
                      Leader
                    </span>
                  ) : (
                    <span className="rounded-lg border border-white/[0.06] px-2 py-1.5 text-[8px] uppercase tracking-wider text-zinc-700">
                      Member
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-xs text-zinc-400 transition hover:border-violet-400/20 hover:text-white"
            >
              <Mail size={14} />
              Contact Leader
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-red-400/10 px-5 py-3 text-xs text-red-400 transition hover:bg-red-400/[0.05]"
            >
              <Trash2 size={14} />
              Remove Team
            </button>
          </div>
        </div>
      </div>
    </div>
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
  success,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.13]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
          {icon}
        </div>

        {success && (
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-400">
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
   TEAM AVATAR
========================================================= */

function TeamAvatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-violet-400/10 font-bold text-violet-300 ${
        large
          ? "h-16 w-16 rounded-2xl text-lg"
          : "h-10 w-10 text-xs"
      }`}
    >
      {initials}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function TeamStatusBadge({
  status,
}: {
  status: TeamStatus;
}) {
  const styles = {
    Active:
      "border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-400",
    Full:
      "border-violet-400/10 bg-violet-400/[0.05] text-violet-300",
    Incomplete:
      "border-amber-400/10 bg-amber-400/[0.05] text-amber-400",
  };

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1.5 text-[9px] font-medium ${styles[status]}`}
    >
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
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
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
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-zinc-700">
        {icon}

        <span className="text-[9px] uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>

      <div className="mt-2 break-words text-xs text-zinc-300">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* =========================================================
   SMALL USER ICON
========================================================= */

function UserPlusIcon() {
  return (
    <div className="relative">
      <Users size={18} />

      <span className="absolute -bottom-1 -right-1 text-[8px]">
        +
      </span>
    </div>
  );
}