"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Save,
  User,
  Code2,
} from "lucide-react";
import { FormEvent, useState } from "react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fullName: "Aman Pathak",
    email: "aman@example.com",
    mobile: "",
    college: "Maharishi University of Information Technology",
    course: "B.Tech",
    year: "3rd Year",
    domain: "Artificial Intelligence & Data Science",
    city: "Noida",
    linkedin: "",
    github: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Temporary frontend save.
    // Supabase integration will be added after Anusha's database work.
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/[0.06] blur-[150px]" />
        <div className="absolute bottom-[-200px] right-[-150px] h-[450px] w-[450px] rounded-full bg-indigo-500/[0.025] blur-[130px]" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-500 transition hover:text-white"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-700">
                  Participant Portal
                </div>

                <h1 className="mt-1 text-sm font-semibold">
                  My Profile
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-zinc-500">
                Registered Participant
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Page heading */}
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-violet-300">
              <User size={12} />
              Profile
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your participant profile
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Keep your information updated so organizers and teammates
              can understand your background and skills.
            </p>
          </section>

          {/* Main grid */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"
          >
            {/* Profile card */}
            <div className="h-fit rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-400/[0.08] text-2xl font-bold text-violet-300">
                    AP
                  </div>

                  <button
                    type="button"
                    aria-label="Change profile photo"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111] text-zinc-400 shadow-lg transition hover:text-white"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {form.fullName}
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  {form.email}
                </p>

                <div className="mt-5 w-full border-t border-white/[0.06] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600">
                      Profile completion
                    </span>

                    <span className="text-xs font-semibold text-violet-400">
                      85%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[85%] rounded-full bg-violet-400" />
                  </div>
                </div>

                <div className="mt-5 w-full rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4 text-left">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={15} />

                    <span className="text-xs font-medium">
                      Registration confirmed
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] leading-5 text-zinc-700">
                    Your HackIGNISIA 2026 participant registration
                    is active.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
              {/* Basic information */}
              <div>
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10">
                    <User size={14} />
                  </span>
                  Basic Information
                </div>

                <h3 className="mt-3 text-lg font-semibold">
                  Personal details
                </h3>

                <p className="mt-1 text-xs text-zinc-700">
                  Basic information about you.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={form.fullName}
                  onChange={(value) =>
                    updateField("fullName", value)
                  }
                  icon={<User size={15} />}
                />

                <Input
                  label="Email address"
                  value={form.email}
                  onChange={(value) =>
                    updateField("email", value)
                  }
                  icon={<Mail size={15} />}
                  disabled
                />

                <Input
                  label="Mobile number"
                  value={form.mobile}
                  onChange={(value) =>
                    updateField("mobile", value)
                  }
                  icon={<Phone size={15} />}
                  placeholder="+91 XXXXX XXXXX"
                />

                <Input
                  label="City"
                  value={form.city}
                  onChange={(value) =>
                    updateField("city", value)
                  }
                  icon={<MapPin size={15} />}
                />
              </div>

              {/* Academic */}
              <div className="mt-10 border-t border-white/[0.06] pt-8">
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10">
                    <GraduationCap size={14} />
                  </span>
                  Education
                </div>

                <h3 className="mt-3 text-lg font-semibold">
                  Academic information
                </h3>

                <p className="mt-1 text-xs text-zinc-700">
                  Tell us about your academic background.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Input
                  label="College / University"
                  value={form.college}
                  onChange={(value) =>
                    updateField("college", value)
                  }
                  icon={<GraduationCap size={15} />}
                />

                <Input
                  label="Course"
                  value={form.course}
                  onChange={(value) =>
                    updateField("course", value)
                  }
                  icon={<GraduationCap size={15} />}
                />

                <Input
                  label="Year of study"
                  value={form.year}
                  onChange={(value) =>
                    updateField("year", value)
                  }
                />

                <Input
                  label="Domain / Specialization"
                  value={form.domain}
                  onChange={(value) =>
                    updateField("domain", value)
                  }
                />
              </div>

              {/* Social */}
              <div className="mt-10 border-t border-white/[0.06] pt-8">
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10">
                    <Code2 size={14} />
                  </span>
                  Professional Links
                </div>

                <h3 className="mt-3 text-lg font-semibold">
                  Developer profiles
                </h3>

                <p className="mt-1 text-xs text-zinc-700">
                  Add links that help teammates and organizers
                  learn more about your work.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Input
                  label="LinkedIn URL"
                  value={form.linkedin}
                  onChange={(value) =>
                    updateField("linkedin", value)
                  }
                  icon={<User size={15} />}
                  placeholder="https://linkedin.com/in/..."
                />

                <Input
                  label="GitHub URL"
                  value={form.github}
                  onChange={(value) =>
                    updateField("github", value)
                  }
                  icon={<Code2 size={15} />}
                  placeholder="https://github.com/..."
                />
              </div>

              {/* Save */}
              <div className="mt-10 flex flex-col-reverse justify-end gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
                {saved && (
                  <div className="flex items-center justify-center gap-2 px-4 text-xs text-emerald-400 sm:mr-auto sm:justify-start">
                    <CheckCircle2 size={15} />
                    Changes saved successfully
                  </div>
                )}

                <Link
                  href="/dashboard"
                  className="rounded-xl border border-white/10 px-5 py-3 text-center text-xs font-medium text-zinc-500 transition hover:text-white"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-5 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
                >
                  <Save size={15} />
                  Save Changes
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <footer className="mt-10 border-t border-white/[0.06] pt-6">
            <div className="flex flex-col justify-between gap-3 text-[10px] text-zinc-700 sm:flex-row">
              <p>
                HackIGNISIA 2026 • Organized by UDTech India
              </p>

              <Link
                href="/dashboard"
                className="hover:text-zinc-400"
              >
                Back to Dashboard
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  value,
  onChange,
  icon,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </span>

      <div
        className={`flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-3.5 transition focus-within:border-violet-400/30 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {icon && (
          <span className="shrink-0 text-zinc-700">
            {icon}
          </span>
        )}

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-xs text-zinc-300 outline-none placeholder:text-zinc-800 disabled:cursor-not-allowed"
        />
      </div>
    </label>
  );
}