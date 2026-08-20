"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  Code2,
  File,
  FileCheck2,
  FileText,
  FolderOpen,
  Globe,
  Info,
  Lightbulb,
  Loader2,
  Lock,
  MessageSquare,
  Presentation,
  Save,
  Send,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type Step = 1 | 2 | 3 | 4 | 5;

type FormData = {
  projectTitle: string;
  tagline: string;
  problemStatement: string;
  targetUsers: string;
  solution: string;
  innovation: string;
  techStack: string;
  githubUrl: string;
  demoUrl: string;
  videoUrl: string;
  additionalInfo: string;
};

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  file: File;
};

/* =========================================================
   INITIAL DATA
========================================================= */

const initialForm: FormData = {
  projectTitle: "",
  tagline: "",
  problemStatement: "",
  targetUsers: "",
  solution: "",
  innovation: "",
  techStack: "",
  githubUrl: "",
  demoUrl: "",
  videoUrl: "",
  additionalInfo: "",
};

const steps = [
  {
    id: 1,
    title: "Project Basics",
    description: "Tell us about your idea",
    icon: Lightbulb,
  },
  {
    id: 2,
    title: "Problem & Solution",
    description: "Explain the impact",
    icon: Target,
  },
  {
    id: 3,
    title: "Technology",
    description: "Show your technical approach",
    icon: Zap,
  },
  {
    id: 4,
    title: "Resources",
    description: "Add project links & PPT",
    icon: FolderOpen,
  },
  {
    id: 5,
    title: "Review",
    description: "Review your submission",
    icon: FileCheck2,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ProjectPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [form, setForm] = useState<FormData>(initialForm);

  const [presentation, setPresentation] =
    useState<UploadedFile | null>(null);

  const [demoVideo, setDemoVideo] =
    useState<UploadedFile | null>(null);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [saved, setSaved] = useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });

    setSaved(false);
  }

  function validateStep(
    step: Step
  ): boolean {
    const nextErrors: Record<string, string> =
      {};

    if (step === 1) {
      if (!form.projectTitle.trim()) {
        nextErrors.projectTitle =
          "Project title is required.";
      }

      if (!form.tagline.trim()) {
        nextErrors.tagline =
          "A short tagline is required.";
      }
    }

    if (step === 2) {
      if (!form.problemStatement.trim()) {
        nextErrors.problemStatement =
          "Problem statement is required.";
      }

      if (!form.targetUsers.trim()) {
        nextErrors.targetUsers =
          "Target users are required.";
      }

      if (!form.solution.trim()) {
        nextErrors.solution =
          "Solution description is required.";
      }

      if (!form.innovation.trim()) {
        nextErrors.innovation =
          "Please explain what makes your solution innovative.";
      }
    }

    if (step === 3) {
      if (!form.techStack.trim()) {
        nextErrors.techStack =
          "Technology stack is required.";
      }
    }

    if (step === 4) {
      if (!form.githubUrl.trim()) {
        nextErrors.githubUrl =
          "GitHub repository URL is required.";
      } else if (
        !isValidUrl(form.githubUrl)
      ) {
        nextErrors.githubUrl =
          "Enter a valid GitHub URL.";
      }

      if (
        form.demoUrl.trim() &&
        !isValidUrl(form.demoUrl)
      ) {
        nextErrors.demoUrl =
          "Enter a valid demo URL.";
      }

      if (
        form.videoUrl.trim() &&
        !isValidUrl(form.videoUrl)
      ) {
        nextErrors.videoUrl =
          "Enter a valid video URL.";
      }

      if (!presentation) {
        nextErrors.presentation =
          "Project presentation is required.";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return false;
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(
        (currentStep + 1) as Step
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep(
        (currentStep - 1) as Step
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  async function saveDraft() {
    setIsSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    setIsSaving(false);
    setSaved(true);
  }

  /* =======================================================
     FILE UPLOAD
  ======================================================= */

  function handlePresentation(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    const validExtension =
      /\.(pdf|ppt|pptx)$/i.test(file.name);

    if (
      !validTypes.includes(file.type) &&
      !validExtension
    ) {
      setErrors((previous) => ({
        ...previous,
        presentation:
          "Only PDF, PPT or PPTX files are allowed.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        presentation:
          "Presentation must be smaller than 10 MB.",
      }));

      event.target.value = "";
      return;
    }

    setPresentation({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    });

    setErrors((previous) => {
      const next = { ...previous };
      delete next.presentation;
      return next;
    });
  }

  function handleDemoVideo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowed.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        demoVideo:
          "Only MP4, WebM or MOV videos are allowed.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        demoVideo:
          "Demo video must be smaller than 50 MB.",
      }));

      event.target.value = "";
      return;
    }

    setDemoVideo({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    });

    setErrors((previous) => {
      const next = { ...previous };
      delete next.demoVideo;
      return next;
    });
  }

  /* =======================================================
     FINAL SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    setIsSubmitting(false);
    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     COMPLETION
  ======================================================= */

  const completion = useMemo(() => {
    let completed = 0;

    if (form.projectTitle.trim()) completed++;
    if (form.tagline.trim()) completed++;
    if (form.problemStatement.trim())
      completed++;
    if (form.targetUsers.trim()) completed++;
    if (form.solution.trim()) completed++;
    if (form.innovation.trim()) completed++;
    if (form.techStack.trim()) completed++;
    if (form.githubUrl.trim()) completed++;
    if (presentation) completed++;

    return Math.round(
      (completed / 9) * 100
    );
  }, [form, presentation]);

  /* =======================================================
     SUBMITTED SCREEN
  ======================================================= */

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Background />

        <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-12">
          <div className="w-full rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400/10 text-emerald-400">
              <CheckCircle2 size={42} />
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
              <Check size={12} />
              Submission received
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Project submitted successfully
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">
              Your project submission has been
              recorded for HackIGNISIA 2026.
              Keep your GitHub repository and
              project resources updated until
              judging begins.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/[0.07] bg-black/20 p-5 text-left">
              <div className="text-[9px] uppercase tracking-[0.18em] text-zinc-700">
                Project
              </div>

              <div className="mt-2 text-sm font-semibold">
                {form.projectTitle}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="text-xs text-zinc-600">
                  Status
                </span>

                <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                  Submitted
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-5 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
              >
                Back to dashboard
                <ArrowRight size={15} />
              </Link>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                View submission
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Background />

      <div className="relative min-h-screen">
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-2xl">
          <div className="mx-auto flex h-18 max-w-[1450px] items-center justify-between px-5 sm:px-7 lg:px-10">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-zinc-500 transition hover:border-white/20 hover:text-white"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-700">
                  Participant Portal
                </div>

                <div className="mt-0.5 text-sm font-semibold">
                  Project Workspace
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saved && (
                <div className="hidden items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2 text-[10px] text-emerald-400 sm:flex">
                  <Check size={12} />
                  Draft saved
                </div>
              )}

              <button
                type="button"
                onClick={saveDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={14} />
                )}

                <span className="hidden sm:inline">
                  Save draft
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE
        =================================================== */}

        <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          {/* HEADER */}

          <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-violet-400/[0.08] via-white/[0.025] to-transparent p-6 sm:p-8 lg:p-10">
            <div className="absolute right-[-120px] top-[-150px] h-[350px] w-[350px] rounded-full bg-violet-500/[0.08] blur-[110px]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                <Sparkles size={11} />
                HackIGNISIA 2026
              </div>

              <div className="mt-5 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Build your project.
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                    Submit your project idea, explain
                    the problem you are solving, share
                    your technology stack and upload
                    your presentation.
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                  <div className="flex items-center justify-between gap-10">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.16em] text-zinc-700">
                        Completion
                      </div>

                      <div className="mt-1 text-xl font-bold text-violet-300">
                        {completion}%
                      </div>
                    </div>

                    <div className="h-12 w-12 rounded-full border border-violet-400/20 p-1">
                      <div
                        className="flex h-full w-full items-center justify-center rounded-full border-2 border-violet-400 text-[9px] font-bold"
                      >
                        {completion}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              STEPPER
          ================================================= */}

          <section className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
            <div className="grid gap-2 md:grid-cols-5">
              {steps.map((step) => {
                const Icon = step.icon;

                const active =
                  currentStep === step.id;

                const complete =
                  currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (
                        step.id < currentStep
                      ) {
                        setCurrentStep(
                          step.id as Step
                        );
                      }
                    }}
                    disabled={
                      step.id > currentStep
                    }
                    className={`group relative flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                      active
                        ? "border border-violet-400/15 bg-violet-400/[0.06]"
                        : complete
                        ? "bg-white/[0.02]"
                        : "opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        complete
                          ? "bg-emerald-400/10 text-emerald-400"
                          : active
                          ? "bg-violet-400/10 text-violet-400"
                          : "bg-white/[0.04] text-zinc-600"
                      }`}
                    >
                      {complete ? (
                        <Check size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`truncate text-[11px] font-semibold ${
                          active
                            ? "text-white"
                            : complete
                            ? "text-zinc-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {step.title}
                      </div>

                      <div className="mt-0.5 truncate text-[9px] text-zinc-700">
                        {step.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              {/* MAIN FORM */}

              <div className="min-w-0">
                {currentStep === 1 && (
                  <StepOne
                    form={form}
                    updateField={updateField}
                    errors={errors}
                  />
                )}

                {currentStep === 2 && (
                  <StepTwo
                    form={form}
                    updateField={updateField}
                    errors={errors}
                  />
                )}

                {currentStep === 3 && (
                  <StepThree
                    form={form}
                    updateField={updateField}
                    errors={errors}
                  />
                )}

                {currentStep === 4 && (
                  <StepFour
                    form={form}
                    updateField={updateField}
                    errors={errors}
                    presentation={
                      presentation
                    }
                    demoVideo={demoVideo}
                    onPresentation={
                      handlePresentation
                    }
                    onDemoVideo={
                      handleDemoVideo
                    }
                    onRemovePresentation={() =>
                      setPresentation(null)
                    }
                    onRemoveVideo={() =>
                      setDemoVideo(null)
                    }
                  />
                )}

                {currentStep === 5 && (
                  <StepFive
                    form={form}
                    presentation={
                      presentation
                    }
                    demoVideo={demoVideo}
                    onEdit={(step) =>
                      setCurrentStep(step)
                    }
                  /> 
                )}

                {/* NAVIGATION */}

                <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-white/[0.07] pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={
                      currentStep === 1
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-xs font-medium text-zinc-500 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-6 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
                    >
                      Continue
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isSubmitting
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-6 py-3 text-xs font-semibold text-black transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit project
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================= */}

              <aside className="space-y-6">
                {/* STATUS */}

                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="flex items-center gap-2 text-violet-400">
                    <FileText size={15} />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
                      Submission status
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                      <FileText size={18} />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        Draft
                      </div>

                      <div className="mt-0.5 text-[10px] text-zinc-700">
                        Not submitted yet
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-violet-400 transition-all"
                      style={{
                        width: `${completion}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[9px] text-zinc-700">
                    <span>Progress</span>
                    <span>{completion}%</span>
                  </div>
                </div>

                {/* REQUIREMENTS */}

                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="flex items-center gap-2">
                    <CircleHelp
                      size={15}
                      className="text-violet-400"
                    />

                    <h3 className="text-xs font-semibold">
                      Submission requirements
                    </h3>
                  </div>

                  <div className="mt-5 space-y-3">
                    <Requirement
                      text="Project title"
                      complete={
                        !!form.projectTitle.trim()
                      }
                    />

                    <Requirement
                      text="Problem & solution"
                      complete={
                        !!form.problemStatement.trim() &&
                        !!form.solution.trim()
                      }
                    />

                    <Requirement
                      text="Technology stack"
                      complete={
                        !!form.techStack.trim()
                      }
                    />

                    <Requirement
                      text="GitHub repository"
                      complete={
                        !!form.githubUrl.trim()
                      }
                    />

                    <Requirement
                      text="Presentation (PPT/PDF)"
                      complete={
                        !!presentation
                      }
                    />
                  </div>
                </div>

                {/* IMPORTANT */}

                <div className="rounded-3xl border border-violet-400/10 bg-violet-400/[0.035] p-5">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Info size={14} />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
                      Important
                    </span>
                  </div>

                  <p className="mt-4 text-[11px] leading-6 text-zinc-600">
                    Make sure your GitHub repository
                    is accessible to judges. Once the
                    project is submitted, changes may
                    be restricted after the submission
                    deadline.
                  </p>
                </div>

                {/* SECURITY */}

                <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4">
                  <Lock
                    size={14}
                    className="mt-0.5 shrink-0 text-zinc-700"
                  />

                  <p className="text-[9px] leading-5 text-zinc-700">
                    Your project information is
                    visible only to authorized
                    organizers and judges.
                  </p>
                </div>
              </aside>
            </div>
          </form>

          {/* FOOTER */}

          <footer className="mt-10 border-t border-white/[0.06] pt-6">
            <div className="flex flex-col justify-between gap-3 text-[10px] text-zinc-700 sm:flex-row">
              <p>
                HackIGNISIA 2026 • Organized by
                UDTech India
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
    </main>
  );
}

/* =========================================================
   STEP 1
========================================================= */

function StepOne({
  form,
  updateField,
  errors,
}: {
  form: FormData;
  updateField: (
    field: keyof FormData,
    value: string
  ) => void;
  errors: Record<string, string>;
}) {
  return (
    <FormCard
      eyebrow="Step 01"
      title="Project basics"
      description="Start by giving your project a clear identity. Keep the title and tagline simple and memorable."
      icon={<Lightbulb size={17} />}
    >
      <div className="space-y-6">
        <InputField
          label="Project title"
          required
          placeholder="e.g. VOKARA — Voice-first Emergency System"
          value={form.projectTitle}
          onChange={(value) =>
            updateField(
              "projectTitle",
              value
            )
          }
          error={errors.projectTitle}
          maxLength={100}
        />

        <InputField
          label="One-line tagline"
          required
          placeholder="Describe your project in one powerful sentence"
          value={form.tagline}
          onChange={(value) =>
            updateField(
              "tagline",
              value
            )
          }
          error={errors.tagline}
          maxLength={160}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <ReadOnlyField
            label="Hackathon"
            value="HackIGNISIA 2026"
          />

          <ReadOnlyField
            label="Selected track"
            value="AI & Machine Learning"
          />
        </div>

        <InfoBox>
          Your project should be related to the
          selected hackathon track and should
          demonstrate a meaningful technical
          solution.
        </InfoBox>
      </div>
    </FormCard>
  );
}

/* =========================================================
   STEP 2
========================================================= */

function StepTwo({
  form,
  updateField,
  errors,
}: {
  form: FormData;
  updateField: (
    field: keyof FormData,
    value: string
  ) => void;
  errors: Record<string, string>;
}) {
  return (
    <FormCard
      eyebrow="Step 02"
      title="Problem & solution"
      description="Explain the real-world problem, who faces it and how your solution addresses it."
      icon={<Target size={17} />}
    >
      <div className="space-y-6">
        <TextAreaField
          label="Problem statement"
          required
          placeholder="What problem are you solving? Why does this problem matter?"
          value={form.problemStatement}
          onChange={(value) =>
            updateField(
              "problemStatement",
              value
            )
          }
          error={errors.problemStatement}
          rows={7}
          maxLength={1500}
        />

        <TextAreaField
          label="Target users"
          required
          placeholder="Who will use your solution? Describe your target audience."
          value={form.targetUsers}
          onChange={(value) =>
            updateField(
              "targetUsers",
              value
            )
          }
          error={errors.targetUsers}
          rows={5}
          maxLength={800}
        />

        <TextAreaField
          label="Solution"
          required
          placeholder="How does your product solve the problem?"
          value={form.solution}
          onChange={(value) =>
            updateField(
              "solution",
              value
            )
          }
          error={errors.solution}
          rows={7}
          maxLength={1800}
        />

        <TextAreaField
          label="Innovation / uniqueness"
          required
          placeholder="What makes your approach different from existing solutions?"
          value={form.innovation}
          onChange={(value) =>
            updateField(
              "innovation",
              value
            )
          }
          error={errors.innovation}
          rows={6}
          maxLength={1200}
        />
      </div>
    </FormCard>
  );
}

/* =========================================================
   STEP 3
========================================================= */

function StepThree({
  form,
  updateField,
  errors,
}: {
  form: FormData;
  updateField: (
    field: keyof FormData,
    value: string
  ) => void;
  errors: Record<string, string>;
}) {
  return (
    <FormCard
      eyebrow="Step 03"
      title="Technology & implementation"
      description="Tell the judges what you are building with and how the technical architecture works."
      icon={<Zap size={17} />}
    >
      <div className="space-y-6">
        <TextAreaField
          label="Technology stack"
          required
          placeholder="e.g. Next.js, Node.js, Supabase, Python, FastAPI, PostgreSQL, OpenAI API"
          value={form.techStack}
          onChange={(value) =>
            updateField(
              "techStack",
              value
            )
          }
          error={errors.techStack}
          rows={6}
          maxLength={1000}
        />

        <TextAreaField
          label="Additional technical information"
          placeholder="Architecture, APIs, AI models, databases, hardware, deployment etc."
          value={form.additionalInfo}
          onChange={(value) =>
            updateField(
              "additionalInfo",
              value
            )
          }
          rows={8}
          maxLength={1500}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <TechBox
            icon={<Globe size={16} />}
            title="Frontend"
            value="Web / Mobile"
          />

          <TechBox
            icon={<Zap size={16} />}
            title="Backend"
            value="API / Services"
          />

          <TechBox
            icon={<MessageSquare size={16} />}
            title="AI / Data"
            value="Models / APIs"
          />
        </div>

        <InfoBox>
          Do not worry about perfect technical
          terminology. Explain the implementation
          clearly enough for a technical judge to
          understand your approach.
        </InfoBox>
      </div>
    </FormCard>
  );
}

/* =========================================================
   STEP 4
========================================================= */

function StepFour({
  form,
  updateField,
  errors,
  presentation,
  demoVideo,
  onPresentation,
  onDemoVideo,
  onRemovePresentation,
  onRemoveVideo,
}: {
  form: FormData;
  updateField: (
    field: keyof FormData,
    value: string
  ) => void;
  errors: Record<string, string>;
  presentation: UploadedFile | null;
  demoVideo: UploadedFile | null;
  onPresentation: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onDemoVideo: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onRemovePresentation: () => void;
  onRemoveVideo: () => void;
}) {
  return (
    <FormCard
      eyebrow="Step 04"
      title="Project resources"
      description="Add your repository, live demo and presentation. These resources help judges evaluate your project."
      icon={<FolderOpen size={17} />}
    >
      <div className="space-y-7">
        <InputField
          label="GitHub repository"
          placeholder="https://github.com/username/project"
          value={form.githubUrl}
          onChange={(value) =>
            updateField(
              "githubUrl",
              value
            )
          }
          error={errors.githubUrl}
          icon={<Code2 size={15} />}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Live demo URL"
            placeholder="https://your-project.vercel.app"
            value={form.demoUrl}
            onChange={(value) =>
              updateField(
                "demoUrl",
                value
              )
            }
            error={errors.demoUrl}
            icon={<Globe size={15} />}
          />

          <InputField
            label="Demo video URL"
            placeholder="https://youtube.com/..."
            value={form.videoUrl}
            onChange={(value) =>
              updateField(
                "videoUrl",
                value
              )
            }
            error={errors.videoUrl}
            icon={<MessageSquare size={15} />}
          />
        </div>

        {/* PRESENTATION */}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">
              Project presentation
              <span className="ml-1 text-violet-400">
                *
              </span>
            </label>

            <span className="text-[9px] text-zinc-700">
              PDF / PPT / PPTX • Max 10 MB
            </span>
          </div>

          {presentation ? (
            <UploadedFileCard
              file={presentation}
              onRemove={
                onRemovePresentation
              }
            />
          ) : (
            <label
              htmlFor="presentation-upload"
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center transition ${
                errors.presentation
                  ? "border-red-400/30 bg-red-400/[0.03]"
                  : "border-white/10 bg-white/[0.015] hover:border-violet-400/30 hover:bg-violet-400/[0.025]"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-400 transition group-hover:scale-105">
                <Presentation size={25} />
              </div>

              <div className="mt-4 text-sm font-semibold">
                Upload project presentation
              </div>

              <p className="mt-1 max-w-md text-[11px] leading-5 text-zinc-700">
                Upload the PPT/PPTX or PDF that
                explains your project, architecture,
                implementation and impact.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-[10px] font-semibold text-black">
                <Upload size={13} />
                Choose file
              </span>

              <input
                id="presentation-upload"
                type="file"
                accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={onPresentation}
                className="hidden"
              />
            </label>
          )}

          {errors.presentation && (
            <ErrorText
              message={errors.presentation}
            />
          )}
        </div>

        {/* OPTIONAL VIDEO FILE */}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">
              Demo video file
              <span className="ml-2 text-[9px] font-normal text-zinc-700">
                Optional
              </span>
            </label>

            <span className="text-[9px] text-zinc-700">
              MP4 / WebM / MOV • Max 50 MB
            </span>
          </div>

          {demoVideo ? (
            <UploadedFileCard
              file={demoVideo}
              onRemove={onRemoveVideo}
            />
          ) : (
            <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 transition hover:border-violet-400/30 hover:bg-violet-400/[0.02]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-600 group-hover:text-violet-400">
                <Upload size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-zinc-400">
                  Upload demo video
                </div>

                <div className="mt-1 text-[10px] text-zinc-700">
                  Optional — useful for showcasing
                  your working prototype.
                </div>
              </div>

              <span className="rounded-lg border border-white/10 px-3 py-2 text-[9px] font-medium text-zinc-600 group-hover:text-white">
                Browse
              </span>

              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={onDemoVideo}
                className="hidden"
              />
            </label>
          )}

          {errors.demoVideo && (
            <ErrorText
              message={errors.demoVideo}
            />
          )}
        </div>

        <InfoBox>
          The uploaded files are currently held in
          the browser only. Anusha can connect
          this upload component to Supabase Storage
          later.
        </InfoBox>
      </div>
    </FormCard>
  );
}

/* =========================================================
   STEP 5
========================================================= */

function StepFive({
  form,
  presentation,
  demoVideo,
  onEdit,
}: {
  form: FormData;
  presentation: UploadedFile | null;
  demoVideo: UploadedFile | null;
  onEdit: (step: Step) => void;
}) {
  return (
    <FormCard
      eyebrow="Step 05"
      title="Review your submission"
      description="Check everything carefully before submitting your project to the organizers."
      icon={<FileCheck2 size={17} />}
    >
      <div className="space-y-5">
        <ReviewSection
          title="Project basics"
          step={1}
          onEdit={onEdit}
        >
          <ReviewRow
            label="Project title"
            value={
              form.projectTitle
            }
          />

          <ReviewRow
            label="Tagline"
            value={form.tagline}
          />
        </ReviewSection>

        <ReviewSection
          title="Problem & solution"
          step={2}
          onEdit={onEdit}
        >
          <ReviewRow
            label="Problem"
            value={
              form.problemStatement
            }
          />

          <ReviewRow
            label="Target users"
            value={
              form.targetUsers
            }
          />

          <ReviewRow
            label="Solution"
            value={form.solution}
          />

          <ReviewRow
            label="Innovation"
            value={
              form.innovation
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Technology"
          step={3}
          onEdit={onEdit}
        >
          <ReviewRow
            label="Technology stack"
            value={
              form.techStack
            }
          />

          <ReviewRow
            label="Technical information"
            value={
              form.additionalInfo ||
              "Not provided"
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Resources"
          step={4}
          onEdit={onEdit}
        >
          <ReviewRow
            label="GitHub"
            value={form.githubUrl}
          />

          <ReviewRow
            label="Live demo"
            value={
              form.demoUrl ||
              "Not provided"
            }
          />

          <ReviewRow
            label="Demo video"
            value={
              form.videoUrl ||
              "Not provided"
            }
          />

          <ReviewRow
            label="Presentation"
            value={
              presentation
                ? presentation.name
                : "Not uploaded"
            }
          />

          <ReviewRow
            label="Video file"
            value={
              demoVideo
                ? demoVideo.name
                : "Not uploaded"
            }
          />
        </ReviewSection>

        <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] p-5">
          <div className="flex gap-3">
            <Info
              size={16}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <div className="text-xs font-semibold text-amber-300">
                Before you submit
              </div>

              <p className="mt-1.5 text-[10px] leading-5 text-zinc-600">
                Make sure your GitHub repository is
                accessible and your presentation
                contains accurate project information.
                After submission, changes may be
                restricted according to the event rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
}

/* =========================================================
   FORM CARD
========================================================= */

function FormCard({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
          {icon}
        </div>

        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
            {eyebrow}
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {title}
          </h2>

          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-zinc-700">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  required,
  placeholder,
  value,
  onChange,
  error,
  icon,
  maxLength,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-zinc-300">
          {label}

          {required && (
            <span className="ml-1 text-violet-400">
              *
            </span>
          )}
        </label>

        {maxLength && (
          <span className="text-[9px] text-zinc-700">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700">
            {icon}
          </div>
        )}

        <input
          value={value}
          maxLength={maxLength}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-black/20 px-4 py-3.5 text-xs text-white outline-none transition placeholder:text-zinc-800 ${
            icon ? "pl-10" : ""
          } ${
            error
              ? "border-red-400/30 focus:border-red-400/50"
              : "border-white/[0.08] focus:border-violet-400/30"
          }`}
        />
      </div>

      {error && (
        <ErrorText message={error} />
      )}
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function TextAreaField({
  label,
  required,
  placeholder,
  value,
  onChange,
  error,
  rows,
  maxLength,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows: number;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-zinc-300">
          {label}

          {required && (
            <span className="ml-1 text-violet-400">
              *
            </span>
          )}
        </label>

        {maxLength && (
          <span className="text-[9px] text-zinc-700">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        value={value}
        maxLength={maxLength}
        rows={rows}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`w-full resize-y rounded-xl border bg-black/20 px-4 py-3.5 text-xs leading-6 text-white outline-none transition placeholder:text-zinc-800 ${
          error
            ? "border-red-400/30 focus:border-red-400/50"
            : "border-white/[0.08] focus:border-violet-400/30"
        }`}
      />

      {error && (
        <ErrorText message={error} />
      )}
    </div>
  );
}

/* =========================================================
   READ ONLY FIELD
========================================================= */

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-zinc-300">
        {label}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3.5 text-xs text-zinc-500">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   UPLOADED FILE
========================================================= */

function UploadedFileCard({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
        <File size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-zinc-300">
          {file.name}
        </div>

        <div className="mt-1 flex items-center gap-2 text-[9px] text-zinc-700">
          <span>
            {formatFileSize(file.size)}
          </span>

          <span>•</span>

          <span className="text-emerald-400">
            Ready
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-700 transition hover:border-red-400/20 hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* =========================================================
   REVIEW
========================================================= */

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: Step;
  onEdit: (step: Step) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold">
          {title}
        </h3>

        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-[9px] font-medium text-violet-400 hover:text-violet-300"
        >
          Edit
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
      <div className="text-[9px] uppercase tracking-wider text-zinc-700">
        {label}
      </div>

      <div className="whitespace-pre-wrap break-words text-[11px] leading-5 text-zinc-400">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   REQUIREMENT
========================================================= */

function Requirement({
  text,
  complete,
}: {
  text: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          complete
            ? "bg-emerald-400/10 text-emerald-400"
            : "bg-white/[0.04] text-zinc-800"
        }`}
      >
        {complete ? (
          <Check size={11} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
        )}
      </div>

      <span
        className={`text-[10px] ${
          complete
            ? "text-zinc-400"
            : "text-zinc-700"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   TECH BOX
========================================================= */

function TechBox({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-600">
        {icon}
      </div>

      <div className="mt-3 text-xs font-medium text-zinc-400">
        {title}
      </div>

      <div className="mt-1 text-[9px] text-zinc-700">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-violet-400/10 bg-violet-400/[0.025] p-4">
      <Info
        size={14}
        className="mt-0.5 shrink-0 text-violet-400"
      />

      <p className="text-[10px] leading-5 text-zinc-600">
        {children}
      </p>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorText({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-1.5 text-[9px] text-red-400">
      <X size={11} />
      {message}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function isValidUrl(
  value: string
): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

/* =========================================================
   BACKGROUND
========================================================= */

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-300px] h-[650px] w-[850px] -translate-x-1/2 rounded-full bg-violet-600/[0.055] blur-[150px]" />

      <div className="absolute bottom-[-300px] left-[-200px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[130px]" />

      <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.02] blur-[140px]" />
    </div>
  );
}