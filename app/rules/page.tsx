"use client";

import Link from "next/link";
import { useState } from "react";

export default function RulesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
              H
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white">HackIGNISIA</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">2026</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <Link href="/#about" className="transition hover:text-white">About</Link>
            <Link href="/rules" className="text-white">Rules</Link>
            <Link href="/contact" className="transition hover:text-white">Contact</Link>
          </nav>
          <Link href="/login" className="btn-primary hidden md:inline-flex">
            Dashboard
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-10">
        <div className="container relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Hackathon Rules</h1>
            <p className="mt-4 text-lg text-zinc-400">Please read carefully before participating.</p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container py-10">
        <div className="max-w-3xl space-y-8 text-zinc-300">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Eligibility</h2>
            <p className="leading-7">
              HackIGNISIA 2026 is open to all university students. You must be currently enrolled in a recognized institution to participate.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Team Size</h2>
            <p className="leading-7">
              Teams can consist of 1 to 5 members. Cross-college teams are allowed. One person can only be part of one team.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Code of Conduct</h2>
            <p className="leading-7">
              All participants must adhere to our Code of Conduct. Harassment or abusive behavior of any kind will result in immediate disqualification.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">4. Project Requirements</h2>
            <p className="leading-7">
              All projects must be started from scratch during the hackathon. Using pre-existing projects or boilerplate code beyond standard frameworks is prohibited.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
