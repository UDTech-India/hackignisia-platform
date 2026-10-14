"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Save, Send, Loader2 } from "lucide-react";

type Criterion = {
  key: string;
  label: string;
  max: number;
};

const DEFAULT_RUBRIC: Criterion[] = [
  { key: "innovation", label: "Innovation & Creativity", max: 25 },
  { key: "technical", label: "Technical Complexity", max: 25 },
  { key: "impact", label: "Impact & Viability", max: 25 },
  { key: "design", label: "Design & UX", max: 25 },
];

export default function SubmissionEvaluation({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [submission, setSubmission] = useState<any>(null);
  const [rubric, setRubric] = useState<Criterion[]>(DEFAULT_RUBRIC);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: sub } = await supabase
          .from("submissions")
          .select(`
            *,
            teams ( name, event_id ),
            evaluations (*)
          `)
          .eq("id", params.id)
          .single();

        if (sub) {
          setSubmission(sub);
          const teamEventId = Array.isArray(sub.teams) ? sub.teams[0]?.event_id : sub.teams?.event_id;
          if (teamEventId) {
            const { data: rubricData } = await supabase
              .from("event_rubrics")
              .select("criteria")
              .eq("event_id", teamEventId)
              .maybeSingle();

            if (rubricData?.criteria && typeof rubricData.criteria === "object") {
              const loadedRubric: Criterion[] = Object.entries(rubricData.criteria).map(
                ([k, v]: [string, any]) => ({
                  key: k,
                  label: v?.label || k,
                  max: typeof v?.max === "number" ? v.max : 25,
                })
              );
              if (loadedRubric.length > 0) {
                setRubric(loadedRubric);
              }
            }
          }

          const evalRow = sub.evaluations?.[0];
          if (evalRow) {
            setEvaluationId(evalRow.id);
            setScores(evalRow.scores || {});
            setComments(evalRow.comments || "");
            if (evalRow.status === 'final') {
              setIsFinal(true);
            }
          }
        } else {
          router.push("/judge");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id, router, supabase]);

  async function handleSaveDraft() {
    if (isFinal) return;
    setIsSaving(true);
    setSaved(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Omit keys left empty or invalid
      const cleanScores: Record<string, number> = {};
      for (const [k, v] of Object.entries(scores)) {
        if (typeof v === "number" && !isNaN(v) && Number.isFinite(v)) {
          cleanScores[k] = v;
        }
      }

      const payload = {
        submission_id: params.id,
        judge_id: user.id,
        scores: cleanScores,
        comments,
        status: "draft"
      };

      if (evaluationId) {
        await supabase.from("evaluations").update(payload).eq("id", evaluationId);
      } else {
        const { data } = await supabase.from("evaluations").insert([payload]).select("id").single();
        if (data) setEvaluationId(data.id);
      }
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!evaluationId) return alert("Please save a draft first.");
    const confirmFinal = confirm("Are you sure you want to finalize this evaluation? You will not be able to change your scores afterwards.");
    if (!confirmFinal) return;
    
    setIsSubmitting(true);
    try {
      await handleSaveDraft(); // force save
      const { error } = await supabase.rpc("finalize_evaluation", { p_evaluation_id: evaluationId });
      if (error) throw error;
      
      setIsFinal(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      alert(e.message || "Failed to finalize evaluation.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleScoreChange = (key: string, val: string, max: number) => {
    if (val === "" || val === null || val === undefined) {
      setScores(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSaved(false);
      return;
    }
    const parsed = Number(val);
    if (isNaN(parsed)) {
      setScores(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSaved(false);
      return;
    }
    let num = parsed;
    if (num > max) num = max;
    if (num < 0) num = 0;
    setScores(prev => ({ ...prev, [key]: num }));
    setSaved(false);
  };

  const currentTotal = Object.values(scores).reduce((a, b) => a + (typeof b === "number" && !isNaN(b) ? b : 0), 0);
  const maxTotal = rubric.reduce((a, b) => a + b.max, 0);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-white">Loading...</div>;
  }

  const teamName = Array.isArray(submission?.teams) ? submission?.teams[0]?.name : submission?.teams?.name;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-2xl px-5 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/judge" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-500 hover:text-white transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Evaluation</div>
            <div className="text-sm font-semibold">{submission.title}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* SUBMISSION DETAILS */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
                {submission.track}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
                Team {teamName}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{submission.title}</h1>
            <p className="mt-3 text-lg text-zinc-400">{submission.tagline}</p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">Problem Statement</h3>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{submission.problem_statement}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">Solution</h3>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{submission.solution}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">Innovation</h3>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{submission.innovation}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">Tech Stack</h3>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{submission.tech_stack}</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/[0.06]">
              {submission.github_url && (
                <a href={submission.github_url} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline">GitHub Repo &rarr;</a>
              )}
              {submission.demo_url && (
                <a href={submission.demo_url} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline">Live Demo &rarr;</a>
              )}
              {submission.video_url && (
                <a href={submission.video_url} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline">Demo Video &rarr;</a>
              )}
            </div>
          </div>
        </div>

        {/* EVALUATION FORM */}
        <div>
          <div className="sticky top-28 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="text-xl font-bold mb-6">Evaluation Rubric</h2>
            
            {isFinal && (
              <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={16} />
                  Evaluation Finalized
                </div>
                <p className="mt-1 text-xs opacity-80">This evaluation has been locked and submitted.</p>
              </div>
            )}

            <fieldset disabled={isFinal} className="space-y-6">
              {rubric.map(crit => (
                <div key={crit.key}>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-medium text-zinc-300">{crit.label}</label>
                    <span className="text-xs text-zinc-500">Max {crit.max}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={crit.max}
                    value={scores[crit.key] !== undefined ? scores[crit.key] : ""}
                    onChange={(e) => handleScoreChange(crit.key, e.target.value, crit.max)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition disabled:opacity-50"
                  />
                </div>
              ))}

              <div className="border-t border-white/[0.06] pt-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Private Comments</label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => { setComments(e.target.value); setSaved(false); }}
                  placeholder="Feedback and notes (only visible to admins/judges)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition disabled:opacity-50"
                />
              </div>
            </fieldset>

            <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
              <div className="text-sm text-zinc-500">Total Score</div>
              <div className="text-3xl font-bold text-violet-400">
                {currentTotal} <span className="text-sm font-normal text-zinc-500">/ {maxTotal}</span>
              </div>
            </div>

            {!isFinal && (
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saved ? "Saved" : "Save Draft"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Final
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
