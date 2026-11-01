"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SubmissionCountdown, {
  formatISTDate,
  formatISTDateTime,
  EventDates,
} from "@/components/SubmissionCountdown";
import {
  sitePrizes,
  siteSponsors,
  siteFAQs,
} from "@/lib/siteContent";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventData, setEventData] = useState<EventDates>(null);
  const [tracks, setTracks] = useState<Array<{ id?: string; name: string; description: string | null }>>([
    {
      name: "AI & Machine Learning",
      description: "Artificial intelligence, machine learning, and intelligent automation",
    },
    {
      name: "Web & App Development",
      description: "Full-stack web applications, mobile apps, and developer platforms",
    },
    {
      name: "Social Impact & Innovation",
      description: "Projects targeting social good, healthcare, education, or sustainability",
    },
    {
      name: "Open Innovation",
      description: "Wildcard innovations, novel hardware/software blends, and emerging technologies",
    },
  ]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("events")
      .select("id, name, submission_opens_at, submission_deadline_at, judging_starts_at, judging_ends_at, results_at")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEventData(data);
      });

    supabase
      .from("tracks")
      .select("id, name, description")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTracks(data);
        }
      });
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="HackIGNISIA Logo"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div>
              <div className="text-sm font-bold tracking-tight text-white">
                HackIGNISIA
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                2026
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <a
              href="#about"
              className="transition hover:text-white"
            >
              About
            </a>

            <a
              href="#tracks"
              className="transition hover:text-white"
            >
              Tracks
            </a>

            <a
              href="#timeline"
              className="transition hover:text-white"
            >
              Timeline
            </a>

            <a
              href="#prizes"
              className="transition hover:text-white"
            >
              Prizes
            </a>

            <a
              href="#sponsors"
              className="transition hover:text-white"
            >
              Sponsors
            </a>

            <a
              href="#faq"
              className="transition hover:text-white"
            >
              FAQ
            </a>
            <Link
              href="/rules"
              className="transition hover:text-white"
            >
              Rules
            </Link>
            <Link
              href="/contact"
              className="transition hover:text-white"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn-primary"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-lg text-zinc-300 transition hover:border-white/20 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 md:hidden">
            <nav className="container flex flex-col py-3">
              <a
                href="#about"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                About
              </a>

              <a
                href="#tracks"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                Tracks
              </a>

              <a
                href="#timeline"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                Timeline
              </a>

              <a
                href="#prizes"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                Prizes
              </a>

              <a
                href="#sponsors"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                Sponsors
              </a>

              <a
                href="#faq"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                FAQ
              </a>
              <Link
                href="/rules"
                onClick={closeMobileMenu}
                className="border-b border-white/5 py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                Rules
              </Link>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="py-4 text-sm text-zinc-400 transition hover:text-white"
              >
                Contact
              </Link>

              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="mt-4 text-center text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={closeMobileMenu}
                className="btn-primary mt-4 justify-center"
              >
                Register for HackIGNISIA →
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="pointer-events-none absolute right-[-200px] top-[300px] h-[350px] w-[350px] rounded-full bg-indigo-600/5 blur-[120px]" />

        <div className="container relative flex min-h-[calc(100vh-64px)] items-center py-20 sm:py-24 lg:py-28">
          <div className="w-full max-w-5xl">
            {/* Badge */}
            <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-xs font-medium text-violet-300">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />

              <span>
                National Online AI &amp; Innovation Hackathon
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-5xl text-5xl font-bold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Build what
              <br />
              <span className="text-violet-400">matters.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              HackIGNISIA 2026 brings together students, developers,
              designers, and innovators from across India to build
              technology-driven solutions for real-world challenges.
            </p>

            {/* Event information */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400">
                {eventData?.submission_opens_at && eventData?.submission_deadline_at
                  ? `${formatISTDateTime(eventData.submission_opens_at)} – ${formatISTDateTime(eventData.submission_deadline_at)}`
                  : "TBA"}
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400">
                Online
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400">
                Open to Builders Across India
              </div>
            </div>

            {/* LIVE SUBMISSION COUNTDOWN */}
            <SubmissionCountdown event={eventData} />

            {/* CTA */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="btn-primary justify-center sm:w-auto"
              >
                Register for HackIGNISIA
                <span>→</span>
              </Link>

              <a
                href="#about"
                className="btn-secondary justify-center sm:w-auto"
              >
                Explore the Hackathon
              </a>
            </div>

            {/* Stats */}
            <div className="mt-14 grid max-w-3xl grid-cols-1 gap-6 border-t border-white/10 pt-7 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-bold text-white">
                  4
                </div>

                <div className="mt-1 text-xs leading-5 text-zinc-500">
                  Hackathon Tracks
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">
                  Online
                </div>

                <div className="mt-1 text-xs leading-5 text-zinc-500">
                  National Hackathon
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">
                  Free
                </div>

                <div className="mt-1 text-xs leading-5 text-zinc-500">
                  Registration on Unstop
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ABOUT */}
      {/* ========================================================= */}

      <section
        id="about"
        className="section relative overflow-hidden"
      >
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            {/* Left */}
            <div>
              <div className="section-label">
                01 — About HackIGNISIA
              </div>

              <h2 className="section-title mt-5">
                More than a hackathon.
                <br />
                <span className="text-violet-400">
                  A platform to build.
                </span>
              </h2>
            </div>

            {/* Right */}
            <div>
              <p className="text-lg leading-8 text-zinc-300">
                HackIGNISIA 2026 is a national online AI &amp;
                Innovation Hackathon bringing together students,
                developers, designers, and innovators from across
                India to build solutions for real-world challenges.
              </p>

              <p className="mt-6 text-base leading-7 text-zinc-500">
                Participants will work in teams, explore emerging
                technologies, learn from mentors, and turn ideas
                into working prototypes. The focus is not only on
                building fast, but on building something meaningful.
              </p>

              <p className="mt-6 text-base leading-7 text-zinc-500">
                Whether you are an experienced developer or
                participating in your first hackathon, HackIGNISIA
                provides a space to experiment, collaborate, learn,
                and showcase what you can build.
              </p>

              {/* Highlights */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="text-violet-400">✦</div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    Build for Impact
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Solve meaningful problems across AI, emerging
                    technology, education, accessibility,
                    sustainability, and social impact.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="text-violet-400">◇</div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    Collaborate
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Find teammates, exchange ideas, and work
                    alongside builders with different skills and
                    perspectives.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="text-violet-400">◎</div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    Learn &amp; Connect
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Get guidance from mentors, interact with the
                    ecosystem, and learn from fellow participants.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="text-violet-400">↗</div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    Showcase Your Work
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Turn your idea into a working prototype and
                    showcase it to mentors, judges, partners, and
                    the wider community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TRACKS */}
      {/* ========================================================= */}

      <section
        id="tracks"
        className="section relative overflow-hidden border-t border-white/10"
      >
        <div className="container">
          <div className="max-w-3xl">
            <div className="section-label">02 — Tracks</div>

            <h2 className="section-title mt-5">
              Choose a problem.
              <br />
              <span className="text-violet-400">
                Build a solution.
              </span>
            </h2>

            <p className="section-description mt-6">
              Explore problem spaces that encourage participants
              to think beyond conventional solutions and build
              technology that matters.
            </p>
          </div>

          {/* Track Cards */}
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((track, idx) => {
              const icons = ["◈", "◇", "✦", "◎"];
              return (
                <div
                  key={track.name}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-widest text-zinc-600">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <span className="text-2xl">{icons[idx % icons.length]}</span>
                  </div>

                  <h3 className="mt-10 text-xl font-semibold text-white">
                    {track.name}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-zinc-500">
                    {track.description || "Build impactful solutions in this space."}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-7 sm:flex-row sm:items-center">
            <div>
              <div className="font-semibold text-white">
                Have an unconventional idea?
              </div>

              <div className="mt-1 text-sm text-zinc-500">
                Your solution does not have to fit inside a box.
              </div>
            </div>

            <Link
              href="/register"
              className="btn-secondary w-fit"
            >
              Start Building →
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TIMELINE */}
      {/* ========================================================= */}

      <section
        id="timeline"
        className="section border-t border-white/10"
      >
        <div className="container">
          <div className="section-label">
            03 — Timeline
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <h2 className="section-title mt-5">
                From registration
                <br />
                to{" "}
                <span className="text-violet-400">
                  recognition.
                </span>
              </h2>
            </div>

            <p className="section-description">
              Every stage of HackIGNISIA is designed to help
              participants move from an idea to a meaningful
              working solution.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mt-16">
            <div className="absolute left-[15px] top-3 hidden h-[calc(100%-24px)] w-px bg-white/10 md:block" />

            <div className="space-y-5">
              {/* 01 */}
              <div className="relative grid gap-5 md:grid-cols-[32px_1fr]">
                <div className="relative z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/40 bg-black text-xs font-bold text-violet-400">
                  01
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-violet-400">
                        Registration
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Register &amp; join the community
                      </h3>
                    </div>

                    <div className="text-sm text-zinc-500">
                      On Unstop
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                    Create your participant account, complete your
                    profile, and get ready to participate in
                    HackIGNISIA 2026.
                  </p>
                </div>
              </div>

              {/* 02 */}
              <div className="relative grid gap-5 md:grid-cols-[32px_1fr]">
                <div className="relative z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-xs font-bold text-zinc-400">
                  02
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-500">
                        Team Formation
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Find your builders
                      </h3>
                    </div>

                    <div className="text-sm text-zinc-500">
                      Before Hackathon
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                    Build your team, invite teammates, discover
                    new collaborators, and prepare your idea before
                    the hackathon begins.
                  </p>
                </div>
              </div>

              {/* 03 */}
              <div className="relative grid gap-5 md:grid-cols-[32px_1fr]">
                <div className="relative z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/40 bg-violet-400/10 text-xs font-bold text-violet-400">
                  03
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.04] p-6 transition hover:border-violet-400/40">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-violet-400">
                        Hackathon
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Build what matters.
                      </h3>
                    </div>

                    <div className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-300">
                      {eventData?.submission_opens_at && eventData?.submission_deadline_at
                        ? `${formatISTDateTime(eventData.submission_opens_at)} – ${formatISTDateTime(eventData.submission_deadline_at)}`
                        : "TBA"}
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                    Collaborate with your team, attend sessions,
                    connect with mentors, and turn your idea into
                    a working prototype.
                  </p>
                </div>
              </div>

              {/* 04 */}
              <div className="relative grid gap-5 md:grid-cols-[32px_1fr]">
                <div className="relative z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-xs font-bold text-zinc-400">
                  04
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-500">
                        Submission
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Submit your solution
                      </h3>
                    </div>

                    <div className="text-sm text-zinc-500">
                      {eventData?.submission_deadline_at
                        ? `Deadline: ${formatISTDateTime(eventData.submission_deadline_at)}`
                        : "TBA"}
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                    Submit your project, repository, demo,
                    documentation, and required details through
                    the participant dashboard.
                  </p>
                </div>
              </div>

              {/* 05 */}
              <div className="relative grid gap-5 md:grid-cols-[32px_1fr]">
                <div className="relative z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-xs font-bold text-zinc-400">
                  05
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet-400/30">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-500">
                        Judging
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Ideas meet evaluation
                      </h3>
                    </div>

                    <div className="text-sm text-zinc-500">
                      {eventData?.judging_starts_at && eventData?.judging_ends_at
                        ? `${formatISTDateTime(eventData.judging_starts_at)} – ${formatISTDateTime(eventData.judging_ends_at)}`
                        : "TBA"}
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                    Projects will be evaluated based on innovation,
                    technical execution, relevance, impact, and
                    overall solution quality.
                  </p>
                </div>
              </div>

              {/* 06 */}
              <div className="relative grid gap-5 md:grid-cols-[32px_1fr]">
                <div className="relative z-10 mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/40 bg-black text-xs font-bold text-violet-400">
                  06
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-white/[0.03] p-6 transition hover:border-violet-400/40">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-violet-400">
                        Results
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Celebrate the builders
                      </h3>
                    </div>

                    <div className="text-sm text-zinc-500">
                      {eventData?.results_at
                        ? formatISTDateTime(eventData.results_at)
                        : "TBA"}
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                    Winners, standout projects, special
                    recognitions, and participation achievements
                    will be announced after evaluation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRIZES */}
      {/* ========================================================= */}

      <section
        id="prizes"
        className="section border-t border-white/10"
      >
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="section-label">
                04 — Prizes
              </div>

              <h2 className="section-title mt-5">
                Build something
                <br />
                <span className="text-violet-400">
                  worth recognising.
                </span>
              </h2>
            </div>

            <p className="section-description">
              Great ideas deserve more than a leaderboard position.
              HackIGNISIA recognises innovation, execution, impact,
              and the builders behind meaningful solutions.
            </p>
          </div>

          {/* Main Prize */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-400/[0.04]">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-8 md:p-12">
                <div className="text-xs uppercase tracking-[0.2em] text-violet-400">
                  HackIGNISIA 2026
                </div>

                <h3 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  The best solutions
                  <br />
                  deserve the spotlight.
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
                  Compete with builders from across India and get
                  the opportunity to showcase your work, receive
                  recognition, and connect with the wider technology
                  ecosystem.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-400">
                    Winner Recognition
                  </span>

                  <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-400">
                    Certificates
                  </span>

                  <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-400">
                    Special Awards
                  </span>
                </div>
              </div>

              <div className="flex min-h-[280px] items-center justify-center border-t border-white/10 p-8 lg:border-l lg:border-t-0">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    Prize Pool
                  </div>

                  <div className="mt-4 text-5xl font-black tracking-tight text-white md:text-6xl">
                    TBA
                  </div>

                  <div className="mt-3 text-sm text-zinc-500">
                    To be announced soon
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recognition Cards */}
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {sitePrizes.map((prize) => (
              <div
                key={prize.rank}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-widest text-zinc-600">
                    {prize.rank}
                  </span>
                  <span className="text-xs text-violet-400">{prize.reward}</span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-white">
                  {prize.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {prize.description}
                </p>
              </div>
            ))}
          </div>

          {/* Sponsor Bounties */}
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-7 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                  Sponsor Challenges
                </div>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  More opportunities may be unlocked by our partners.
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Sponsor-specific challenges, bounties, tools,
                  credits, and additional rewards may be announced
                  as our ecosystem partners come on board.
                </p>
              </div>

              <a
                href="#sponsors"
                className="btn-secondary w-fit shrink-0"
              >
                Meet Our Partners →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SPONSORS */}
      {/* ========================================================= */}

      <section
        id="sponsors"
        className="section border-t border-white/10"
      >
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="section-label">
                05 — Sponsors &amp; Partners
              </div>

              <h2 className="section-title mt-5">
                Built with
                <br />
                <span className="text-violet-400">
                  the ecosystem.
                </span>
              </h2>
            </div>

            <p className="section-description">
              HackIGNISIA is powered by organizations, communities,
              and technology partners who believe in supporting the
              next generation of builders.
            </p>
          </div>

          {/* Partner Logo Area */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                Our Ecosystem
              </div>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                Partner announcements will be updated here as
                collaborations are officially confirmed.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
                <span className="text-sm font-medium text-zinc-700">
                  Partner
                </span>
              </div>

              <div className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
                <span className="text-sm font-medium text-zinc-700">
                  Partner
                </span>
              </div>

              <div className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
                <span className="text-sm font-medium text-zinc-700">
                  Partner
                </span>
              </div>

              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                <span className="text-sm font-medium text-zinc-700">
                  Your Logo
                </span>
              </div>
            </div>
          </div>

          {/* Partnership Types */}
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {siteSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                  {sponsor.category}
                </div>

                <h3 className="mt-4 text-xl font-semibold text-white">
                  {sponsor.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {sponsor.description}
                </p>
              </div>
            ))}
          </div>

          {/* Sponsor CTA */}
          <div className="mt-5 overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-400/[0.04]">
            <div className="flex flex-col gap-7 p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                  Partner With Us
                </div>

                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                  Want to support the next generation of builders?
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Explore sponsorship, technology partnership,
                  community collaboration, mentorship, prizes, and
                  other opportunities with HackIGNISIA 2026.
                </p>
              </div>

              <a
                href="mailto:support@udtech.com?subject=HackIGNISIA%202026%20Partnership"
                className="btn-primary w-fit shrink-0"
              >
                Become a Partner →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FAQ */}
      {/* ========================================================= */}

      <section
        id="faq"
        className="section border-t border-white/10"
      >
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Left */}
            <div>
              <div className="section-label">
                06 — FAQ
              </div>

              <h2 className="section-title mt-5">
                Questions?
                <br />
                <span className="text-violet-400">
                  We&apos;ve got you.
                </span>
              </h2>

              <p className="section-description mt-6">
                Everything you need to know before joining
                HackIGNISIA 2026. More event-specific details will
                be updated as registrations open.
              </p>

              <Link
                href="/register"
                className="btn-secondary mt-8 w-fit"
              >
                Register for HackIGNISIA →
              </Link>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {siteFAQs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6">
                    <span className="text-sm font-medium text-white">
                      {faq.question}
                    </span>

                    <span className="text-xl text-zinc-500 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <div className="border-t border-white/10 px-6 pb-6 pt-5">
                    <p className="text-sm leading-6 text-zinc-500">
                      {faq.isDateDynamic
                        ? eventData?.submission_opens_at && eventData?.submission_deadline_at
                          ? `HackIGNISIA 2026 submissions run from ${formatISTDateTime(eventData.submission_opens_at)} to ${formatISTDateTime(eventData.submission_deadline_at)}.`
                          : "TBA"
                        : faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL CTA */}
      {/* ========================================================= */}

      <section className="border-t border-white/10">
        <div className="container py-20 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-400/[0.04] p-8 text-center md:p-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

            <div className="relative">
              <div className="text-xs uppercase tracking-[0.2em] text-violet-400">
                HackIGNISIA 2026
              </div>

              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Have an idea?
                <br />
                <span className="text-violet-400">
                  Build it.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                Join builders from across India and turn your idea
                into something real.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="btn-primary justify-center"
                >
                  Register for HackIGNISIA →
                </Link>

                <a
                  href="#tracks"
                  className="btn-secondary justify-center"
                >
                  Explore Tracks
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}

      <footer className="border-t border-white/10">
        <div className="container py-12">
          <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="HackIGNISIA Logo"
                    width={36}
                    height={36}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <div className="text-sm font-bold tracking-tight text-white">
                    HackIGNISIA
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    2026
                  </div>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
                A national online AI &amp; Innovation Hackathon
                bringing together students, developers, designers,
                and innovators to build solutions for real-world
                challenges.
              </p>

              <p className="mt-4 text-xs text-zinc-600">
                Organized by UDTech India
              </p>
            </div>

            {/* Explore */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Explore
              </div>

              <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-500">
                <a
                  href="#about"
                  className="transition hover:text-white"
                >
                  About
                </a>

                <a
                  href="#tracks"
                  className="transition hover:text-white"
                >
                  Tracks
                </a>

                <a
                  href="#timeline"
                  className="transition hover:text-white"
                >
                  Timeline
                </a>

                <a
                  href="#prizes"
                  className="transition hover:text-white"
                >
                  Prizes
                </a>

                <a
                  href="#faq"
                  className="transition hover:text-white"
                >
                  FAQ
                </a>
              </div>
            </div>

            {/* Connect */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Connect
              </div>

              <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-500">
                <a
                  href="https://www.linkedin.com/company/udtech-india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  LinkedIn
                </a>

                <a
                  href="https://www.instagram.com/udtech2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  Instagram
                </a>

                <a
                  href="mailto:indiaudtech@gmail.com"
                  className="transition hover:text-white"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-600">
              © 2026 HackIGNISIA. All rights reserved.
            </div>

            <div className="flex flex-wrap gap-5 text-xs text-zinc-600">
              <span>
                National Online Hackathon
              </span>

              <span>
                {eventData?.submission_opens_at && eventData?.submission_deadline_at
                  ? `${formatISTDateTime(eventData.submission_opens_at)} – ${formatISTDateTime(eventData.submission_deadline_at)}`
                  : "2026"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}