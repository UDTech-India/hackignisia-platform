"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Info,
  Megaphone,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Announcement = {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  important?: boolean;
  unread?: boolean;
};

const announcements: Announcement[] = [
  {
    id: 1,
    title: "HackIGNISIA 2026 Registration is Open",
    description:
      "Participant registration is now open. Complete your profile and team details before the deadline.",
    content:
      "HackIGNISIA 2026 registration is officially open. Participants should complete their profile information, select their preferred track, and create or join a team. Keep checking the dashboard for important updates regarding the hackathon schedule.",
    date: "August 2026",
    category: "Registration",
    important: true,
    unread: true,
  },
  {
    id: 2,
    title: "Team Formation Guidelines",
    description:
      "Create your team or join an existing team using the team code shared by your team leader.",
    content:
      "Participants can create a new team or join an existing team using a valid team code. Team leaders can manage members and team information from the Team Dashboard.",
    date: "August 2026",
    category: "Teams",
    unread: true,
  },
  {
    id: 3,
    title: "Project Submission Portal",
    description:
      "The project workspace will be used to prepare and submit your hackathon project.",
    content:
      "Your Project Dashboard will contain the project details, problem statement, proposed solution, technology stack, PPT upload and final submission information. Make sure all required fields are completed before submitting.",
    date: "Coming Soon",
    category: "Submission",
  },
  {
    id: 4,
    title: "Hackathon Schedule",
    description:
      "Official hackathon dates and detailed event timeline will be announced soon.",
    content:
      "The official schedule will include registration, team formation, project submission, judging and results. Participants will receive updates through the dashboard.",
    date: "Coming Soon",
    category: "Event",
  },
  {
    id: 5,
    title: "Important Participant Updates",
    description:
      "Keep your profile and contact information updated to receive important event communications.",
    content:
      "Participants should ensure that their email address, mobile number, college, course and other profile information are accurate. Important communication may be shared through the registered contact details.",
    date: "Coming Soon",
    category: "Information",
  },
];

const categories = [
  "All",
  "Registration",
  "Teams",
  "Submission",
  "Event",
  "Information",
];

export default function AnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [readAnnouncements, setReadAnnouncements] = useState<number[]>([]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const categoryMatch =
        selectedCategory === "All" ||
        announcement.category === selectedCategory;

      const searchMatch =
        announcement.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        announcement.description
          .toLowerCase()
          .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  const unreadCount = announcements.filter(
    (announcement) =>
      announcement.unread &&
      !readAnnouncements.includes(announcement.id)
  ).length;

  function markAsRead(id: number) {
    setReadAnnouncements((current) =>
      current.includes(id) ? current : [...current, id]
    );
  }

  function openAnnouncement(announcement: Announcement) {
    markAsRead(announcement.id);
    setSelectedAnnouncement(announcement);
  }

  function markAllAsRead() {
    setReadAnnouncements(announcements.map((announcement) => announcement.id));
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Background />

      <div className="relative min-h-screen">
        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-500 transition hover:border-violet-400/20 hover:text-white"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
                  Participant Portal
                </div>

                <h1 className="mt-1 text-sm font-semibold">
                  Announcements
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-violet-400/10 bg-violet-400/[0.05] px-3 py-1.5 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

                <span className="text-[10px] font-medium text-violet-300">
                  HackIGNISIA 2026
                </span>
              </div>

              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-violet-400">
                <Bell size={17} />

                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {/* HERO */}

          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-400/[0.09] via-white/[0.025] to-transparent p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute right-[-100px] top-[-150px] h-[350px] w-[350px] rounded-full bg-violet-500/[0.08] blur-[120px]" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-300">
                <Megaphone size={12} />
                Event Updates
              </div>

              <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Stay in the loop.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                    Find the latest HackIGNISIA announcements, participant
                    updates, submission information and important event
                    communications.
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:text-white"
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <InfoCard
                  icon={<Bell size={15} />}
                  label="Total updates"
                  value={String(announcements.length)}
                />

                <InfoCard
                  icon={<Sparkles size={15} />}
                  label="Unread"
                  value={String(unreadCount)}
                />

                <InfoCard
                  icon={<Star size={15} />}
                  label="Important"
                  value={String(
                    announcements.filter((item) => item.important).length
                  )}
                />
              </div>
            </div>
          </section>

          {/* SEARCH */}

          <section className="mt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search announcements..."
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-xs text-white outline-none placeholder:text-zinc-700 transition focus:border-violet-400/30"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-[10px] font-medium transition ${
                        active
                          ? "border-violet-400/20 bg-violet-400/[0.08] text-violet-300"
                          : "border-white/[0.07] bg-white/[0.02] text-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ANNOUNCEMENTS */}

          <section className="mt-6">
            {filteredAnnouncements.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((announcement) => {
                  const isRead =
                    !announcement.unread ||
                    readAnnouncements.includes(announcement.id);

                  return (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      isRead={isRead}
                      onOpen={() => openAnnouncement(announcement)}
                      onMarkRead={() => markAsRead(announcement.id)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* FOOTER */}

          <footer className="mt-12 border-t border-white/[0.06] pt-6">
            <div className="flex flex-col justify-between gap-3 text-[10px] text-zinc-700 sm:flex-row">
              <p>
                HackIGNISIA 2026 • Organized by UDTech India
              </p>

              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="transition hover:text-zinc-400"
                >
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/team"
                  className="transition hover:text-zinc-400"
                >
                  My Team
                </Link>

                <Link
                  href="/dashboard/project"
                  className="transition hover:text-zinc-400"
                >
                  Project
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* DETAIL MODAL */}

      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </main>
  );
}

/* =========================================================
   ANNOUNCEMENT CARD
========================================================= */

function AnnouncementCard({
  announcement,
  isRead,
  onOpen,
  onMarkRead,
}: {
  announcement: Announcement;
  isRead: boolean;
  onOpen: () => void;
  onMarkRead: () => void;
}) {
  return (
    <article
      className={`group rounded-2xl border p-5 transition sm:p-6 ${
        isRead
          ? "border-white/[0.07] bg-white/[0.02]"
          : "border-violet-400/15 bg-violet-400/[0.025]"
      } hover:border-white/[0.13]`}
    >
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            announcement.important
              ? "bg-violet-400/10 text-violet-400"
              : "bg-white/[0.04] text-zinc-500"
          }`}
        >
          {announcement.important ? (
            <Megaphone size={17} />
          ) : (
            <Bell size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {!isRead && (
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}

                <h3 className="text-sm font-semibold text-zinc-200">
                  {announcement.title}
                </h3>

                {announcement.important && (
                  <span className="rounded-md border border-violet-400/15 bg-violet-400/[0.06] px-2 py-1 text-[8px] font-medium uppercase tracking-wider text-violet-300">
                    Important
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/[0.04] px-2 py-1 text-[8px] uppercase tracking-wider text-zinc-600">
                  {announcement.category}
                </span>

                <span className="flex items-center gap-1 text-[9px] text-zinc-700">
                  <CalendarDays size={10} />
                  {announcement.date}
                </span>
              </div>
            </div>

            {!isRead && (
              <span className="shrink-0 text-[9px] font-medium uppercase tracking-wider text-violet-400">
                New
              </span>
            )}
          </div>

          <p className="mt-4 max-w-3xl text-xs leading-6 text-zinc-600">
            {announcement.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-400 px-3.5 py-2 text-[10px] font-semibold text-black transition hover:bg-violet-300"
            >
              Read announcement
              <ChevronRight size={12} />
            </button>

            {!isRead && (
              <button
                type="button"
                onClick={onMarkRead}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3.5 py-2 text-[10px] font-medium text-zinc-500 transition hover:border-white/15 hover:text-white"
              >
                <Check size={12} />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MODAL
========================================================= */

function AnnouncementModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close announcement"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0a0a0a] shadow-2xl shadow-black/50">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                <Megaphone size={18} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-violet-400/[0.07] px-2 py-1 text-[8px] uppercase tracking-wider text-violet-300">
                    {announcement.category}
                  </span>

                  {announcement.important && (
                    <span className="rounded-md border border-violet-400/15 px-2 py-1 text-[8px] uppercase tracking-wider text-violet-300">
                      Important
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-semibold leading-7">
                  {announcement.title}
                </h2>

                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-700">
                  <CalendarDays size={11} />
                  {announcement.date}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-7">
          <p className="text-sm leading-7 text-zinc-400">
            {announcement.content}
          </p>

          <div className="mt-7 rounded-2xl border border-violet-400/10 bg-violet-400/[0.025] p-4">
            <div className="flex gap-3">
              <Sparkles
                size={16}
                className="mt-0.5 shrink-0 text-violet-400"
              />

              <div>
                <div className="text-xs font-semibold text-zinc-300">
                  Participant reminder
                </div>

                <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                  Keep checking your participant dashboard regularly for
                  important HackIGNISIA updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/[0.07] p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-violet-400">
        {icon}

        <span className="text-[9px] uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <div className="mt-1 text-sm font-semibold text-zinc-200">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
        <Search size={22} />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-zinc-300">
        No announcements found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-700">
        Try changing your search query or selecting a different category.
      </p>
    </div>
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