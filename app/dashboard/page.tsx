"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

/* =========================================================
   TYPES
========================================================= */

type Activity = {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
};

type TeamMember = {
  name: string;
  role: string;
  initials: string;
};

type SidebarLinkProps = {
  icon: ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
};

/* =========================================================
   DEMO DATA
   Replace with Supabase data later.
========================================================= */

const participant = {
  name: "Aman Pathak",
  email: "aman@example.com",
  registrationId: "IGN26-00482",
  college: "Maharishi University of Information Technology",
  course: "B.Tech",
  year: "3rd Year",
  domain: "Artificial Intelligence & Data Science",
  track: "AI & Machine Learning",
  skills: ["Python", "React", "Node.js", "AI", "Data Science"],
  profileCompletion: 85,
};

const team = {
  name: "Team Vector",
  code: "VX7K29",
  members: 4,
  maxMembers: 5,
};

const teamMembers: TeamMember[] = [
  {
    name: "Aman Pathak",
    role: "Team Leader",
    initials: "AP",
  },
  {
    name: "Anusha Anu Prasad",
    role: "Backend & Architecture",
    initials: "AA",
  },
  {
    name: "Team Member",
    role: "Frontend Developer",
    initials: "TM",
  },
  {
    name: "Team Member",
    role: "AI / ML Developer",
    initials: "TM",
  },
];

const activities: Activity[] = [
  {
    icon: <CheckCircle2 size={16} />,
    title: "Registration completed",
    description:
      "Your participant registration was submitted successfully.",
    time: "Today",
  },
  {
    icon: <Users size={16} />,
    title: "Team created",
    description: "You are registered with Team Vector.",
    time: "Today",
  },
  {
    icon: <Target size={16} />,
    title: "Track selected",
    description: "AI & Machine Learning",
    time: "Today",
  },
];

const announcements = [
  {
    title: "Registration is now open",
    description:
      "Complete your participant profile and team details before the registration deadline.",
    date: "Aug 2026",
    important: true,
  },
  {
    title: "Team formation",
    description:
      "Participants can create a team or join an existing team using a team code.",
    date: "Aug 2026",
    important: false,
  },
  {
    title: "Hackathon updates",
    description:
      "Important event announcements will appear here.",
    date: "Coming soon",
    important: false,
  },
];

const eventDates = [
  {
    label: "Registration",
    date: "Open",
    status: "active",
  },
  {
    label: "Team Formation",
    date: "Coming Soon",
    status: "upcoming",
  },
  {
    label: "Hackathon",
    date: "Coming Soon",
    status: "upcoming",
  },
  {
    label: "Project Submission",
    date: "Coming Soon",
    status: "upcoming",
  },
];

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Background />

      <div className="relative flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col",
            "border-r border-white/[0.08]",
            "bg-[#080808]/95 backdrop-blur-2xl",
            "transition-transform duration-300",
            "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Logo */}

          <div className="flex h-20 items-center justify-between border-b border-white/[0.08] px-6">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400 text-sm font-black text-black shadow-lg shadow-violet-500/20">
                H
              </div>

              <div>
                <div className="text-sm font-bold tracking-tight">
                  HackIGNISIA
                </div>

                <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Participant Portal
                </div>
              </div>
            </Link>

            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mini profile */}

          <div className="px-4 pt-5">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center gap-3">
                <Avatar initials="AP" />

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {participant.name}
                  </div>

                  <div className="mt-0.5 truncate text-[11px] text-zinc-600">
                    {participant.registrationId}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-medium text-emerald-400">
                  Registered Participant
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}

          <nav className="flex-1 px-4 py-6">
            <div className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Workspace
            </div>

            <SidebarLink
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              active
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              icon={<Users size={17} />}
              label="My Team"
              href="/dashboard/team"
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              icon={<FileText size={17} />}
              label="Project"
              href="/dashboard/project"
              badge="Soon"
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              icon={<Bell size={17} />}
              label="Announcements"
              href="/dashboard/announcements"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="mb-3 mt-8 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Account
            </div>

            <SidebarLink
              icon={<User size={17} />}
              label="My Profile"
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
            />

            <SidebarLink
              icon={<Settings size={17} />}
              label="Settings"
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
            />
          </nav>

          {/* Event card */}

          <div className="px-4 pb-4">
            <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-4">
              <div className="flex items-center gap-2 text-violet-400">
                <Sparkles size={14} />

                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  HackIGNISIA 2026
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-zinc-600">
                Build meaningful solutions with students,
                developers and innovators.
              </p>

              <Link
                href="/"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300"
              >
                Event homepage
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Logout */}

          <div className="border-t border-white/[0.08] p-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* =====================================================
            MAIN AREA
        ===================================================== */}

        <div className="min-w-0 flex-1">
          {/* Topbar */}

          <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 hover:text-white lg:hidden"
                >
                  <Menu size={19} />
                </button>

                <div>
                  <div className="text-xs text-zinc-600">
                    Participant Portal
                  </div>

                  <div className="mt-0.5 text-sm font-semibold">
                    Dashboard
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-zinc-500 transition hover:text-white"
                >
                  <Bell size={18} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                </button>

                <div className="hidden h-7 w-px bg-white/10 sm:block" />

                <div className="hidden text-right sm:block">
                  <div className="text-xs font-medium">
                    {participant.name}
                  </div>

                  <div className="mt-0.5 text-[10px] text-zinc-600">
                    Participant
                  </div>
                </div>

                <Avatar initials="AP" small />
              </div>
            </div>
          </header>

          {/* Content */}

          <div className="mx-auto max-w-[1450px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {/* Welcome */}

            <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-400/[0.08] via-white/[0.025] to-transparent p-6 sm:p-8 lg:p-10">
              <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-violet-500/[0.08] blur-[100px]" />

              <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    HackIGNISIA 2026
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Welcome back,{" "}
                    <span className="text-violet-400">
                      {participant.name.split(" ")[0]}
                    </span>
                    .
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                    Your participant workspace is ready.
                    Manage your profile, team and hackathon
                    journey from one place.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-zinc-700">
                      Registration ID
                    </div>

                    <div className="mt-1 font-mono text-sm font-semibold text-violet-300">
                      {participant.registrationId}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<ShieldCheck size={18} />}
                label="Registration"
                value="Confirmed"
                description="You're officially registered"
                status="success"
              />

              <StatCard
                icon={<Users size={18} />}
                label="Team"
                value={team.name}
                description={`${team.members}/${team.maxMembers} members`}
              />

              <StatCard
                icon={<Target size={18} />}
                label="Track"
                value="AI & ML"
                description="Preferred track"
              />

              <StatCard
                icon={<Trophy size={18} />}
                label="Profile"
                value={`${participant.profileCompletion}%`}
                description="Profile completed"
              />
            </section>

            {/* Main grid */}

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
              {/* LEFT */}

              <div className="space-y-6">
                {/* Profile */}

                <DashboardCard>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <SectionHeading
                      icon={<User size={16} />}
                      eyebrow="Profile"
                      title="Complete your profile"
                      description="A complete profile helps teammates and organizers know you better."
                    />

                    <Link
                      href="/dashboard/profile"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/30 hover:text-white"
                    >
                      Edit profile
                      <ChevronRight size={13} />
                    </Link>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {participant.profileCompletion}%
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          Profile completion
                        </div>
                      </div>

                      <span className="text-xs font-medium text-violet-400">
                        Almost there
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-violet-400 transition-all"
                        style={{
                          width: `${participant.profileCompletion}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <MiniInfo
                        label="College"
                        value={participant.college}
                        icon={<GraduationCap size={14} />}
                      />

                      <MiniInfo
                        label="Year"
                        value={participant.year}
                        icon={<CalendarDays size={14} />}
                      />

                      <MiniInfo
                        label="Domain"
                        value={participant.domain}
                        icon={<Code2 size={14} />}
                      />
                    </div>
                  </div>
                </DashboardCard>

                {/* Team */}

                <DashboardCard>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <SectionHeading
                      icon={<Users size={16} />}
                      eyebrow="Team"
                      title={team.name}
                      description="Your current hackathon team."
                    />

                    <Link
                      href="/dashboard/team"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/30 hover:text-white"
                    >
                      Manage team
                      <ChevronRight size={13} />
                    </Link>
                  </div>

                  <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-700">
                            Team code
                          </div>

                          <div className="mt-2 font-mono text-2xl font-bold tracking-[0.15em] text-violet-300">
                            {team.code}
                          </div>
                        </div>

                        <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2 text-[10px] font-medium text-emerald-400">
                          Active
                        </div>
                      </div>

                      <div className="mt-5 h-px bg-white/[0.06]" />

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-zinc-600">
                          Team capacity
                        </span>

                        <span className="text-xs font-medium text-zinc-400">
                          {team.members}/{team.maxMembers}
                        </span>
                      </div>

                      <div className="mt-2 flex gap-1.5">
                        {Array.from({
                          length: team.maxMembers,
                        }).map((_, index) => (
                          <div
                            key={index}
                            className={[
                              "h-1.5 flex-1 rounded-full",
                              index < team.members
                                ? "bg-violet-400"
                                : "bg-white/[0.07]",
                            ].join(" ")}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/[0.025] px-6 py-5 lg:min-w-[190px]">
                      <div className="text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                          <Users size={20} />
                        </div>

                        <div className="mt-3 text-xl font-bold">
                          {team.members}
                        </div>

                        <div className="text-[10px] uppercase tracking-wider text-zinc-700">
                          Team Members
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {teamMembers.map((member, index) => (
                      <div
                        key={`${member.name}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
                      >
                        <Avatar
                          initials={member.initials}
                          small
                        />

                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-zinc-300">
                            {member.name}
                          </div>

                          <div className="mt-0.5 truncate text-[10px] text-zinc-700">
                            {member.role}
                          </div>
                        </div>

                        {index === 0 && (
                          <span className="ml-auto rounded-md bg-violet-400/10 px-2 py-1 text-[8px] uppercase tracking-wider text-violet-400">
                            Leader
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </DashboardCard>

                {/* Project */}

                <DashboardCard>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <SectionHeading
                      icon={<Zap size={16} />}
                      eyebrow="Project"
                      title="Your hackathon project"
                      description="Turn your idea into something meaningful."
                    />

                    <Link
                      href="/dashboard/project"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-violet-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-violet-300"
                    >
                      Open project
                      <ChevronRight size={13} />
                    </Link>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-violet-400/15 bg-violet-400/[0.06] px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-violet-300">
                        {participant.track}
                      </span>

                      <span className="rounded-lg border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-zinc-600">
                        Draft
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">
                      Build a meaningful AI-powered solution
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                      Your project workspace will allow you to
                      define your problem statement, solution,
                      technology stack and final submission.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {participant.skills
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-zinc-600"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                </DashboardCard>
              </div>

              {/* RIGHT */}

              <div className="space-y-6">
                {/* Timeline */}

                <DashboardCard>
                  <SectionHeading
                    icon={<CalendarDays size={16} />}
                    eyebrow="Event"
                    title="Hackathon timeline"
                    description="Your journey at a glance."
                  />

                  <div className="mt-7 space-y-5">
                    {eventDates.map((item, index) => (
                      <TimelineItem
                        key={item.label}
                        label={item.label}
                        date={item.date}
                        active={item.status === "active"}
                        last={
                          index === eventDates.length - 1
                        }
                      />
                    ))}
                  </div>
                </DashboardCard>

                {/* Announcements */}

                <DashboardCard>
                  <div className="flex items-start justify-between gap-4">
                    <SectionHeading
                      icon={<Bell size={16} />}
                      eyebrow="Updates"
                      title="Announcements"
                      description="Latest event information."
                    />

                    <Link
                      href="/dashboard/announcements"
                      className="text-[10px] font-medium text-violet-400 hover:text-violet-300"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="mt-6 space-y-3">
                    {announcements.map(
                      (announcement) => (
                        <div
                          key={announcement.title}
                          className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 transition hover:border-white/[0.12]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              {announcement.important && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                              )}

                              <h3 className="truncate text-xs font-semibold text-zinc-300">
                                {announcement.title}
                              </h3>
                            </div>

                            <span className="shrink-0 text-[9px] text-zinc-700">
                              {announcement.date}
                            </span>
                          </div>

                          <p className="mt-2 text-[11px] leading-5 text-zinc-700">
                            {announcement.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </DashboardCard>

                {/* Activity */}

                <DashboardCard>
                  <SectionHeading
                    icon={<Clock3 size={16} />}
                    eyebrow="Activity"
                    title="Recent activity"
                    description="Your latest participant actions."
                  />

                  <div className="mt-6 space-y-5">
                    {activities.map(
                      (activity, index) => (
                        <ActivityItem
                          key={activity.title}
                          activity={activity}
                          last={
                            index === activities.length - 1
                          }
                        />
                      )
                    )}
                  </div>
                </DashboardCard>
              </div>
            </section>

            {/* Footer */}

            <footer className="mt-10 border-t border-white/[0.06] pt-6">
              <div className="flex flex-col justify-between gap-3 text-[10px] text-zinc-700 sm:flex-row">
                <p>
                  HackIGNISIA 2026 • Organized by UDTech India
                </p>

                <div className="flex gap-4">
                  <Link
                    href="/"
                    className="hover:text-zinc-400"
                  >
                    Home
                  </Link>

                  <Link
                    href="/rules"
                    className="hover:text-zinc-400"
                  >
                    Rules
                  </Link>

                  <Link
                    href="/contact"
                    className="hover:text-zinc-400"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   BACKGROUND
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

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  icon,
  label,
  href,
  active = false,
  badge,
  onClick,
}: SidebarLinkProps) {
  const className = [
    "group mb-1 flex w-full items-center gap-3 rounded-xl",
    "px-3 py-3 text-left text-xs font-medium transition",
    active
      ? "border border-violet-400/10 bg-violet-400/[0.07] text-white"
      : "text-zinc-600 hover:bg-white/[0.035] hover:text-zinc-300",
  ].join(" ");

  const content = (
    <>
      <span
        className={
          active
            ? "text-violet-400"
            : "text-zinc-600 group-hover:text-zinc-300"
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
      <Link
        href={href}
        onClick={onClick}
        className={className}
      >
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

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  initials,
  small = false,
}: {
  initials: string;
  small?: boolean;
}) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-xl",
        "bg-violet-400/10 font-semibold text-violet-300",
        small
          ? "h-9 w-9 text-[10px]"
          : "h-10 w-10 text-xs",
      ].join(" ")}
    >
      {initials}
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
  status,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  status?: "success";
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
          {icon}
        </div>

        {status === "success" && (
          <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        )}
      </div>

      <div className="mt-5 text-[9px] uppercase tracking-[0.16em] text-zinc-700">
        {label}
      </div>

      <div className="mt-1 truncate text-lg font-semibold">
        {value}
      </div>

      <div className="mt-1 text-[10px] text-zinc-700">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      {children}
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10">
          {icon}
        </span>

        {eyebrow}
      </div>

      <h2 className="mt-3 text-lg font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-700">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <div className="flex items-center gap-2 text-zinc-700">
        {icon}

        <span className="text-[9px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <div className="mt-2 line-clamp-2 text-[11px] leading-5 text-zinc-500">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   TIMELINE
========================================================= */

function TimelineItem({
  label,
  date,
  active,
  last,
}: {
  label: string;
  date: string;
  active: boolean;
  last: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {!last && (
        <div className="absolute left-[7px] top-5 h-[calc(100%+10px)] w-px bg-white/[0.07]" />
      )}

      <div
        className={[
          "relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border",
          active
            ? "border-violet-400 bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.4)]"
            : "border-white/10 bg-[#111]",
        ].join(" ")}
      />

      <div className="flex flex-1 items-start justify-between gap-3">
        <div>
          <div
            className={[
              "text-xs font-medium",
              active ? "text-white" : "text-zinc-600",
            ].join(" ")}
          >
            {label}
          </div>

          <div className="mt-1 text-[10px] text-zinc-700">
            {active
              ? "Currently active"
              : "Schedule will be announced"}
          </div>
        </div>

        <span
          className={[
            "shrink-0 text-[10px]",
            active
              ? "font-medium text-violet-400"
              : "text-zinc-700",
          ].join(" ")}
        >
          {date}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */

function ActivityItem({
  activity,
  last,
}: {
  activity: Activity;
  last: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <div className="absolute bottom-[-16px] left-[14px] top-9 w-px bg-white/[0.06]" />
      )}

      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-violet-400">
        {activity.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-medium text-zinc-400">
            {activity.title}
          </div>

          <span className="shrink-0 text-[9px] text-zinc-700">
            {activity.time}
          </span>
        </div>

        <p className="mt-1 text-[10px] leading-5 text-zinc-700">
          {activity.description}
        </p>
      </div>
    </div>
  );
}