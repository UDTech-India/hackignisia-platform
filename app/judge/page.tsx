"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Clock3, FileText, Gavel, LogOut, Search } from "lucide-react";

export default function JudgeDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: assignments } = await supabase
          .from("judge_assignments")
          .select("track")
          .eq("judge_id", user.id);

        if (!assignments || assignments.length === 0) {
          setIsLoading(false);
          return;
        }

        const tracks = assignments.map(a => a.track);

        const { data: subs, error } = await supabase
          .from("submissions")
          .select(`
            id,
            title,
            track,
            teams ( name ),
            evaluations ( status, total_score )
          `)
          .eq("status", "submitted")
          .in("track", tracks);

        if (subs) {
          setSubmissions(subs);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, supabase]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-white">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-2xl px-5 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Gavel size={20} />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Judge Portal</h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">HackIGNISIA 2026</p>
          </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition">
          <LogOut size={14} />
          Sign Out
        </button>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Assigned Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <p className="text-zinc-500">No submissions are available for judging in your assigned tracks yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {submissions.map(sub => {
              const evaluation = sub.evaluations?.[0];
              const isFinal = evaluation?.status === 'final';
              const teamName = Array.isArray(sub.teams) ? sub.teams[0]?.name : sub.teams?.name;

              return (
                <Link
                  key={sub.id}
                  href={`/judge/submission/${sub.id}`}
                  className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-violet-500/30 hover:bg-violet-500/[0.02]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        {sub.track}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">{sub.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">Team {teamName || 'Unknown'}</p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition group-hover:bg-violet-500 group-hover:text-white">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-2">
                      {isFinal ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                          <CheckCircle2 size={12} />
                          Evaluated
                        </div>
                      ) : evaluation ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                          <Clock3 size={12} />
                          Draft Saved
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          <FileText size={12} />
                          Pending
                        </div>
                      )}
                    </div>
                    
                    {isFinal && (
                      <div className="text-sm font-bold text-white">
                        Score: {evaluation?.total_score || 0}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
