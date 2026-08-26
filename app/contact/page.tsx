"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
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
            <Link href="/rules" className="transition hover:text-white">Rules</Link>
            <Link href="/contact" className="text-white">Contact</Link>
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
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Contact Us</h1>
            <p className="mt-4 text-lg text-zinc-400">We're here to help you succeed.</p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container py-10">
        <div className="max-w-3xl space-y-8 text-zinc-300">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-2">Email Support</h2>
            <p className="leading-7 mb-4">
              For general inquiries, sponsorship opportunities, or technical support, please reach out to our team at:
            </p>
            <a href="mailto:support@udtech.com" className="text-violet-400 hover:text-violet-300">
              support@udtech.com
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-2">Discord Server</h2>
            <p className="leading-7 mb-4">
              Join our official Discord server to find teammates, ask questions to mentors, and get real-time updates during the hackathon.
            </p>
            <button 
              onClick={() => alert("The official Discord server link will be added soon!")}
              className="inline-flex items-center justify-center rounded-xl bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
            >
              Join Discord (Coming Soon)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
