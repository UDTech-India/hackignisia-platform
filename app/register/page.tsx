"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type ParticipationType = "have-team" | "need-team" | "";

type TeamMode = "create" | "join" | "";

type FormData = {
  /* Profile */
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  about: string;

  /* Academic */
  college: string;
  course: string;
  currentYear: string;
  primaryDomain: string;
  otherDomain: string;
  skills: string;

  /* Team */
  teamName: string;
  teamCode: string;
  teamMode: TeamMode;
  lookingForTeam: boolean;

  /* Professional */
  github: string;
  linkedin: string;
  portfolio: string;

  /* Hackathon */
  projectIdea: string;
  preferredTrack: string;

  /* Consent */
  agreeTerms: boolean;
  agreeCommunication: boolean;
};

type ErrorMap = Partial<
  Record<keyof FormData | "participation", string>
>;

const TOTAL_STEPS = 4;

const DRAFT_KEY =
  "hackignisia-registration-draft-v1";

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  about: "",

  college: "",
  course: "",
  currentYear: "",
  primaryDomain: "",
  otherDomain: "",
  skills: "",

  teamName: "",
  teamCode: "",
  teamMode: "",
  lookingForTeam: false,

  github: "",
  linkedin: "",
  portfolio: "",

  projectIdea: "",
  preferredTrack: "",

  agreeTerms: false,
  agreeCommunication: false,
};

/* =========================================================
   CONSTANTS
========================================================= */

const steps = [
  {
    number: "01",
    title: "Profile",
    short: "Personal",
  },
  {
    number: "02",
    title: "Academics",
    short: "Academic",
  },
  {
    number: "03",
    title: "Team",
    short: "Team",
  },
  {
    number: "04",
    title: "Review",
    short: "Review",
  },
];

const yearOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
  "Other",
];

const domainOptions = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Web Development",
  "App Development",
  "Cybersecurity",
  "Cloud Computing",
  "Blockchain / Web3",
  "IoT",
  "AR / VR",
  "UI / UX Design",
  "DevOps",
  "Other",
];

const trackOptions = [
  "AI & Machine Learning",
  "Web & App Development",
  "Social Impact & Innovation",
  "Open Innovation",
];

/* =========================================================
   HELPERS
========================================================= */

function normalizeFormData(
  data: Partial<FormData>
): FormData {
  return {
    ...initialFormData,
    ...data,
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\s|-/g, "");

  return /^(?:\+91|91)?[6-9]\d{9}$/.test(
    cleaned
  );
}

function isValidUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value.trim());

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function getSkillsCount(skills: string) {
  if (!skills.trim()) {
    return 0;
  }

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean).length;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  const [participation, setParticipation] =
    useState<ParticipationType>("");

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [errors, setErrors] =
    useState<ErrorMap>({});

  const [submitted, setSubmitted] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [draftRestored, setDraftRestored] =
    useState(false);

  const [showClearDraft, setShowClearDraft] =
    useState(false);

  /* =====================================================
     RESTORE DRAFT
  ===================================================== */

 /* =====================================================
   RESTORE DRAFT
===================================================== */

useEffect(() => {
  const restoreDraft = () => {
    try {
      const savedDraft =
        window.localStorage.getItem(DRAFT_KEY);

      if (!savedDraft) {
        return;
      }

      const parsed = JSON.parse(savedDraft);

      if (parsed?.formData) {
        setFormData(
          normalizeFormData(parsed.formData)
        );
      }

      if (
        parsed?.participation === "have-team" ||
        parsed?.participation === "need-team"
      ) {
        setParticipation(parsed.participation);
      }

      setDraftRestored(true);
    } catch (error) {
      console.warn(
        "Unable to restore registration draft.",
        error
      );
    }
  };

  const timer = window.setTimeout(
    restoreDraft,
    0
  );

  return () => {
    window.clearTimeout(timer);
  };
}, []);

  /* =====================================================
     AUTO SAVE DRAFT
  ===================================================== */

  useEffect(() => {
    if (
      !formData.fullName &&
      !formData.email &&
      !formData.college &&
      !participation
    ) {
      return;
    }

    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          formData,
          participation,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      console.warn(
        "Unable to save registration draft."
      );
    }
  }, [formData, participation]);

  /* =====================================================
     UPDATE FIELD
  ===================================================== */

  const updateField = <
    K extends keyof FormData
  >(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      const next = { ...previous };

      delete next[field];

      return next;
    });
  };

  /* =====================================================
     PARTICIPATION
  ===================================================== */

  const handleParticipation = (
    type: ParticipationType
  ) => {
    setParticipation(type);

    setErrors((previous) => {
      const next = { ...previous };

      delete next.participation;
      delete next.teamMode;
      delete next.teamName;
      delete next.teamCode;

      return next;
    });

    if (type === "need-team") {
      setFormData((previous) => ({
        ...previous,
        lookingForTeam: true,
        teamMode: "",
        teamName: "",
        teamCode: "",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        lookingForTeam: false,
      }));
    }
  };

  /* =====================================================
     VALIDATION — STEP 1
  ===================================================== */

  const validateStepOne = () => {
    const nextErrors: ErrorMap = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName =
        "Please enter your full name.";
    } else if (
      formData.fullName.trim().length < 2
    ) {
      nextErrors.fullName =
        "Name must contain at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email =
        "Please enter your email address.";
    } else if (
      !isValidEmail(formData.email)
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone =
        "Please enter your phone number.";
    } else if (
      !isValidPhone(formData.phone)
    ) {
      nextErrors.phone =
        "Please enter a valid Indian mobile number.";
    }

    if (!formData.city.trim()) {
      nextErrors.city =
        "Please enter your city.";
    }

    if (!formData.state.trim()) {
      nextErrors.state =
        "Please enter your state.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /* =====================================================
     VALIDATION — STEP 2
  ===================================================== */

  const validateStepTwo = () => {
    const nextErrors: ErrorMap = {};

    if (!formData.college.trim()) {
      nextErrors.college =
        "Please enter your college or university.";
    }

    if (!formData.course.trim()) {
      nextErrors.course =
        "Please enter your course or degree.";
    }

    if (!formData.currentYear) {
      nextErrors.currentYear =
        "Please select your current year.";
    }

    if (!formData.primaryDomain) {
      nextErrors.primaryDomain =
        "Please select your primary domain.";
    }

    if (
      formData.primaryDomain === "Other" &&
      !formData.otherDomain.trim()
    ) {
      nextErrors.otherDomain =
        "Please specify your domain.";
    }

    if (!formData.skills.trim()) {
      nextErrors.skills =
        "Please enter at least one skill.";
    } else if (
      getSkillsCount(formData.skills) < 1
    ) {
      nextErrors.skills =
        "Please enter at least one valid skill.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /* =====================================================
     VALIDATION — STEP 3
  ===================================================== */

  const validateStepThree = () => {
    const nextErrors: ErrorMap = {};

    if (!participation) {
      nextErrors.participation =
        "Please select a participation option.";
    }

    if (
      participation === "have-team" &&
      !formData.teamMode
    ) {
      nextErrors.teamMode =
        "Please choose whether you want to create or join a team.";
    }

    if (
      participation === "have-team" &&
      formData.teamMode === "create" &&
      !formData.teamName.trim()
    ) {
      nextErrors.teamName =
        "Please enter your team name.";
    }

    if (
      participation === "have-team" &&
      formData.teamMode === "join" &&
      !formData.teamCode.trim()
    ) {
      nextErrors.teamCode =
        "Please enter the team code.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /* =====================================================
     VALIDATION — STEP 4
  ===================================================== */

  const validateStepFour = () => {
    const nextErrors: ErrorMap = {};

    if (
      formData.github.trim() &&
      !isValidUrl(formData.github)
    ) {
      nextErrors.github =
        "Please enter a valid GitHub URL.";
    }

    if (
      formData.linkedin.trim() &&
      !isValidUrl(formData.linkedin)
    ) {
      nextErrors.linkedin =
        "Please enter a valid LinkedIn URL.";
    }

    if (
      formData.portfolio.trim() &&
      !isValidUrl(formData.portfolio)
    ) {
      nextErrors.portfolio =
        "Please enter a valid website URL.";
    }

    if (!formData.projectIdea.trim()) {
      nextErrors.projectIdea =
        "Please describe what you want to build.";
    } else if (
      formData.projectIdea.trim().length < 20
    ) {
      nextErrors.projectIdea =
        "Please provide a little more detail about your idea.";
    }

    if (!formData.preferredTrack) {
      nextErrors.preferredTrack =
        "Please select your preferred track.";
    }

    if (!formData.agreeTerms) {
      nextErrors.agreeTerms =
        "You must accept the participation terms.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /* =====================================================
     VALIDATE CURRENT STEP
  ===================================================== */

  const validateCurrentStep = () => {
    if (step === 1) {
      return validateStepOne();
    }

    if (step === 2) {
      return validateStepTwo();
    }

    if (step === 3) {
      return validateStepThree();
    }

    return validateStepFour();
  };

  /* =====================================================
     NEXT
  ===================================================== */

  const nextStep = () => {
    const valid = validateCurrentStep();

    if (!valid) {
      window.scrollTo({
        top: 250,
        behavior: "smooth",
      });

      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =====================================================
     PREVIOUS
  ===================================================== */

  const previousStep = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);

      setErrors({});

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =====================================================
     GO TO STEP
  ===================================================== */

  const goToStep = (targetStep: number) => {
    if (
      targetStep >= 1 &&
      targetStep <= TOTAL_STEPS &&
      targetStep <= step
    ) {
      setStep(targetStep);
      setErrors({});

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =====================================================
     CLEAR DRAFT
  ===================================================== */

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(
        DRAFT_KEY
      );
    } catch {
      console.warn(
        "Unable to clear registration draft."
      );
    }

    setFormData({
      ...initialFormData,
    });

    setParticipation("");
    setErrors({});
    setStep(1);
    setSubmitted(false);
    setShowClearDraft(false);
    setDraftRestored(false);
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const valid = validateStepFour();

    if (!valid) {
      window.scrollTo({
        top: 250,
        behavior: "smooth",
      });

      return;
    }

    if (!participation) {
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    /*
      BACKEND INTEGRATION PLACEHOLDER

      Anusha can replace this simulated submission
      with the actual Supabase/API implementation.

      Example:

      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            participation,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }
    */

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      console.log(
        "HackIGNISIA Registration:",
        {
          ...formData,
          participation,
        }
      );

      try {
        window.localStorage.removeItem(
          DRAFT_KEY
        );
      } catch {
        // Ignore storage errors.
      }

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Registration submission failed:",
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =====================================================
     DERIVED VALUES
  ===================================================== */

  const skillsCount = useMemo(
    () => getSkillsCount(formData.skills),
    [formData.skills]
  );

  /* =====================================================
     SUCCESS SCREEN
  ===================================================== */

  if (submitted) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Background />

        <Navbar />

        <section className="relative px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-violet-400/20 bg-violet-400/[0.04] p-7 text-center shadow-2xl shadow-black/30 sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-400 text-3xl font-black text-black shadow-lg shadow-violet-500/20">
                ✓
              </div>

              <div className="mt-8 text-xs uppercase tracking-[0.2em] text-violet-400">
                Registration Submitted
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                You&apos;re registered for HackIGNISIA.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                Thank you for registering. Your
                participant information has been captured
                successfully. Further event communication
                will be shared through the contact details
                provided during registration.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 text-left">
                <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                  Registration Summary
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Summary
                    label="Participant"
                    value={
                      formData.fullName ||
                      "Not provided"
                    }
                  />

                  <Summary
                    label="Email"
                    value={
                      formData.email ||
                      "Not provided"
                    }
                  />

                  <Summary
                    label="Participation"
                    value={
                      participation ===
                      "have-team"
                        ? "With a Team"
                        : "Looking for a Team"
                    }
                  />

                  <Summary
                    label="Track"
                    value={
                      formData.preferredTrack ||
                      "Not selected"
                    }
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/"
                  className="btn-primary justify-center"
                >
                  Back to HackIGNISIA →
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                  }}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
                >
                  Edit Registration
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main className="min-h-screen bg-black text-white">
      <Background />

      <Navbar />

      <section className="relative px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl">

          {/* PAGE HEADER */}

          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-xs font-medium text-violet-300">
              HackIGNISIA 2026
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Register to{" "}
              <span className="text-violet-400">
                build what matters.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Join students, developers, designers, and
              innovators from across India to build
              meaningful solutions.
            </p>
          </div>

          {/* DRAFT RESTORED */}

          {draftRestored && (
            <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-violet-400/10 bg-violet-400/[0.04] px-4 py-3">
              <p className="text-xs text-zinc-500">
                Your previous registration draft has been
                restored automatically.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowClearDraft(true)
                }
                className="shrink-0 text-xs font-medium text-zinc-500 transition hover:text-white"
              >
                Clear draft
              </button>
            </div>
          )}

          {/* CLEAR DRAFT CONFIRMATION */}

          {showClearDraft && (
            <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-red-400/20 bg-red-400/[0.04] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-400">
                  Are you sure you want to clear all
                  saved registration information?
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowClearDraft(false)
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={clearDraft}
                    className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROGRESS */}

          <div className="mx-auto mt-10 max-w-3xl">
            <div className="flex items-start">
              {steps.map((item, index) => {
                const current = index + 1;

                const active = current <= step;
                const completed = current < step;

                return (
                  <div
                    key={item.number}
                    className="flex flex-1 items-start"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          current <= step
                        ) {
                          goToStep(current);
                        }
                      }}
                      disabled={current > step}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold transition ${
                          active
                            ? "border-violet-400 bg-violet-400 text-black"
                            : "border-white/10 bg-white/[0.03] text-zinc-600"
                        }`}
                      >
                        {completed
                          ? "✓"
                          : item.number}
                      </div>

                      <span
                        className={`mt-2 hidden text-[10px] uppercase tracking-wider sm:block ${
                          active
                            ? "text-violet-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {item.title}
                      </span>
                    </button>

                    {current < TOTAL_STEPS && (
                      <div
                        className={`mx-2 mt-5 h-px flex-1 transition ${
                          current < step
                            ? "bg-violet-400/60"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 sm:p-8 md:p-10"
          >

            {/* =================================================
               STEP 1
            ================================================= */}

            {step === 1 && (
              <section>
                <StepHeader
                  number="01"
                  title="Tell us about yourself"
                  description="Start with your basic participant information."
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(value) =>
                      updateField(
                        "fullName",
                        value
                      )
                    }
                    error={errors.fullName}
                  />

                  <Input
                    label="Email Address"
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                    error={errors.email}
                  />

                  <Input
                    label="Phone Number"
                    required
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(value) =>
                      updateField(
                        "phone",
                        value
                      )
                    }
                    error={errors.phone}
                  />

                  <Input
                    label="City"
                    required
                    placeholder="e.g. Noida"
                    value={formData.city}
                    onChange={(value) =>
                      updateField(
                        "city",
                        value
                      )
                    }
                    error={errors.city}
                  />

                  <Input
                    label="State"
                    required
                    placeholder="e.g. Uttar Pradesh"
                    value={formData.state}
                    onChange={(value) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                    error={errors.state}
                  />

                  <div className="sm:col-span-2">
                    <Textarea
                      label="About You"
                      placeholder="Tell us briefly about yourself, your interests, or what you like building..."
                      value={formData.about}
                      maxLength={500}
                      onChange={(value) =>
                        updateField(
                          "about",
                          value
                        )
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
               STEP 2
            ================================================= */}

            {step === 2 && (
              <section>
                <StepHeader
                  number="02"
                  title="Academic details"
                  description="Help us understand your academic and technical background."
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="College / University"
                      required
                      placeholder="Enter your college or university"
                      value={formData.college}
                      onChange={(value) =>
                        updateField(
                          "college",
                          value
                        )
                      }
                      error={errors.college}
                    />
                  </div>

                  <Input
                    label="Course / Degree"
                    required
                    placeholder="B.Tech, BCA, MCA, etc."
                    value={formData.course}
                    onChange={(value) =>
                      updateField(
                        "course",
                        value
                      )
                    }
                    error={errors.course}
                  />

                  <Select
                    label="Current Year"
                    required
                    value={formData.currentYear}
                    onChange={(value) =>
                      updateField(
                        "currentYear",
                        value
                      )
                    }
                    options={yearOptions}
                    placeholder="Select year"
                    error={
                      errors.currentYear
                    }
                  />

                  <Select
                    label="Primary Domain"
                    required
                    value={
                      formData.primaryDomain
                    }
                    onChange={(value) =>
                      updateField(
                        "primaryDomain",
                        value
                      )
                    }
                    options={domainOptions}
                    placeholder="Select your domain"
                    error={
                      errors.primaryDomain
                    }
                  />

                  {formData.primaryDomain ===
                    "Other" && (
                    <Input
                      label="Specify Domain"
                      required
                      placeholder="Enter your domain"
                      value={
                        formData.otherDomain
                      }
                      onChange={(value) =>
                        updateField(
                          "otherDomain",
                          value
                        )
                      }
                      error={
                        errors.otherDomain
                      }
                    />
                  )}

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Skills{" "}
                      <span className="text-violet-400">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(event) =>
                        updateField(
                          "skills",
                          event.target.value
                        )
                      }
                      placeholder="Python, React, Node.js, AI, UI/UX..."
                      className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:ring-1 ${
                        errors.skills
                          ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-400/20"
                          : "border-white/10 focus:border-violet-400/50 focus:ring-violet-400/20"
                      }`}
                    />

                    <div className="mt-2 flex justify-between">
                      <div>
                        {errors.skills && (
                          <p className="text-xs text-red-400">
                            {errors.skills}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-zinc-700">
                        {skillsCount} skill
                        {skillsCount === 1
                          ? ""
                          : "s"}{" "}
                        detected
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-zinc-600">
                      Separate multiple skills using
                      commas.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
               STEP 3
            ================================================= */}

            {step === 3 && (
              <section>
                <StepHeader
                  number="03"
                  title="How are you participating?"
                  description="Choose whether you already have a team or want to find teammates."
                />

                {/* PARTICIPATION */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ParticipationCard
                    selected={
                      participation ===
                      "have-team"
                    }
                    icon="◈"
                    title="I have a team"
                    description="I already have teammates and want to register together."
                    action="Create or join a team"
                    onClick={() =>
                      handleParticipation(
                        "have-team"
                      )
                    }
                  />

                  <ParticipationCard
                    selected={
                      participation ===
                      "need-team"
                    }
                    icon="+"
                    title="I need a team"
                    description="I am participating individually and want to connect with other builders."
                    action="Find teammates"
                    onClick={() =>
                      handleParticipation(
                        "need-team"
                      )
                    }
                  />
                </div>

                {errors.participation && (
                  <p className="mt-3 text-xs text-red-400">
                    {errors.participation}
                  </p>
                )}

                {/* HAVE TEAM */}

                {participation ===
                  "have-team" && (
                  <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
                    <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                      Team Registration
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      Team setup
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      Create a new team or join an existing
                      team using a team code.
                    </p>

                    {/* CREATE / JOIN */}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateField(
                            "teamMode",
                            "create"
                          );

                          updateField(
                            "teamCode",
                            ""
                          );
                        }}
                        className={`rounded-xl border p-4 text-left transition ${
                          formData.teamMode ===
                          "create"
                            ? "border-violet-400/50 bg-violet-400/[0.06]"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          Create a team
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          Start a new team for your
                          participants.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateField(
                            "teamMode",
                            "join"
                          );

                          updateField(
                            "teamName",
                            ""
                          );
                        }}
                        className={`rounded-xl border p-4 text-left transition ${
                          formData.teamMode ===
                          "join"
                            ? "border-violet-400/50 bg-violet-400/[0.06]"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          Join a team
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          Join an existing team using
                          its code.
                        </div>
                      </button>
                    </div>

                    {errors.teamMode && (
                      <p className="mt-3 text-xs text-red-400">
                        {errors.teamMode}
                      </p>
                    )}

                    {/* CREATE */}

                    {formData.teamMode ===
                      "create" && (
                      <div className="mt-6">
                        <Input
                          label="Team Name"
                          required
                          placeholder="Enter your team name"
                          value={
                            formData.teamName
                          }
                          onChange={(value) =>
                            updateField(
                              "teamName",
                              value
                            )
                          }
                          error={
                            errors.teamName
                          }
                        />

                        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                          <p className="text-xs leading-6 text-zinc-600">
                            After backend integration,
                            the system can generate a
                            unique team code for your
                            newly created team.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* JOIN */}

                    {formData.teamMode ===
                      "join" && (
                      <div className="mt-6">
                        <Input
                          label="Team Code"
                          required
                          placeholder="Enter team code"
                          value={
                            formData.teamCode
                          }
                          onChange={(value) =>
                            updateField(
                              "teamCode",
                              value.toUpperCase()
                            )
                          }
                          error={
                            errors.teamCode
                          }
                        />

                        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                          <p className="text-xs leading-6 text-zinc-600">
                            Enter the team code shared
                            by your team leader. The
                            code will be verified after
                            backend integration.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* NEED TEAM */}

                {participation ===
                  "need-team" && (
                  <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-400/[0.04] p-6">
                    <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                      Team Matching
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      Find builders with complementary
                      skills.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      We can use your technical interests,
                      domain, and skills to help you
                      discover suitable teammates.
                    </p>

                    <label className="mt-6 flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={
                          formData.lookingForTeam
                        }
                        onChange={(event) =>
                          updateField(
                            "lookingForTeam",
                            event.target.checked
                          )
                        }
                        className="mt-1 h-4 w-4 accent-violet-400"
                      />

                      <span className="text-sm leading-6 text-zinc-500">
                        I am interested in finding
                        teammates through the HackIGNISIA
                        community.
                      </span>
                    </label>

                    <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs leading-6 text-zinc-600">
                        Your preference will be stored
                        with your registration once the
                        backend integration is completed.
                      </p>
                    </div>
                  </div>
                )}

                {!participation && (
                  <div className="mt-6 rounded-xl border border-dashed border-white/10 p-5 text-center">
                    <p className="text-xs leading-6 text-zinc-600">
                      Select one of the options above to
                      continue with your team preferences.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* =================================================
               STEP 4
            ================================================= */}

            {step === 4 && (
              <section>
                <StepHeader
                  number="04"
                  title="Complete your profile"
                  description="Add your professional profiles, project preference, and review your registration."
                />

                <div className="grid gap-6">

                  {/* SOCIAL */}

                  <div>
                    <div className="mb-5 text-xs uppercase tracking-[0.18em] text-zinc-600">
                      Professional Profiles
                    </div>

                    <div className="grid gap-6">
                      <Input
                        label="GitHub Profile"
                        placeholder="https://github.com/username"
                        value={formData.github}
                        onChange={(value) =>
                          updateField(
                            "github",
                            value
                          )
                        }
                        error={errors.github}
                      />

                      <Input
                        label="LinkedIn Profile"
                        placeholder="https://linkedin.com/in/username"
                        value={
                          formData.linkedin
                        }
                        onChange={(value) =>
                          updateField(
                            "linkedin",
                            value
                          )
                        }
                        error={
                          errors.linkedin
                        }
                      />

                      <Input
                        label="Portfolio / Website"
                        placeholder="https://yourwebsite.com"
                        value={
                          formData.portfolio
                        }
                        onChange={(value) =>
                          updateField(
                            "portfolio",
                            value
                          )
                        }
                        error={
                          errors.portfolio
                        }
                      />
                    </div>
                  </div>

                  {/* TRACK */}

                  <Select
                    label="Preferred Hackathon Track"
                    required
                    value={
                      formData.preferredTrack
                    }
                    onChange={(value) =>
                      updateField(
                        "preferredTrack",
                        value
                      )
                    }
                    options={trackOptions}
                    placeholder="Select preferred track"
                    error={
                      errors.preferredTrack
                    }
                  />

                  {/* IDEA */}

                  <Textarea
                    label="What do you want to build?"
                    required
                    placeholder="Describe the kind of problem you want to solve, the technology you may use, or the solution you have in mind..."
                    value={
                      formData.projectIdea
                    }
                    maxLength={1000}
                    onChange={(value) =>
                      updateField(
                        "projectIdea",
                        value
                      )
                    }
                    error={
                      errors.projectIdea
                    }
                  />

                  {/* PROFILE SUMMARY */}

                  <ReviewSection
                    title="Your Profile"
                    onEdit={() =>
                      goToStep(1)
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Summary
                        label="Name"
                        value={
                          formData.fullName ||
                          "Not provided"
                        }
                      />

                      <Summary
                        label="Email"
                        value={
                          formData.email ||
                          "Not provided"
                        }
                      />

                      <Summary
                        label="Phone"
                        value={
                          formData.phone ||
                          "Not provided"
                        }
                      />

                      <Summary
                        label="Location"
                        value={
                          formData.city &&
                          formData.state
                            ? `${formData.city}, ${formData.state}`
                            : "Not provided"
                        }
                      />

                      <Summary
                        label="College"
                        value={
                          formData.college ||
                          "Not provided"
                        }
                      />

                      <Summary
                        label="Course"
                        value={
                          formData.course ||
                          "Not provided"
                        }
                      />
                    </div>
                  </ReviewSection>

                  {/* ACADEMIC SUMMARY */}

                  <ReviewSection
                    title="Academic & Skills"
                    onEdit={() =>
                      goToStep(2)
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Summary
                        label="Current Year"
                        value={
                          formData.currentYear ||
                          "Not selected"
                        }
                      />

                      <Summary
                        label="Domain"
                        value={
                          formData.primaryDomain ||
                          "Not selected"
                        }
                      />

                      <Summary
                        label="Skills"
                        value={
                          formData.skills ||
                          "Not provided"
                        }
                      />

                      <Summary
                        label="Preferred Track"
                        value={
                          formData.preferredTrack ||
                          "Not selected"
                        }
                      />
                    </div>
                  </ReviewSection>

                  {/* TEAM SUMMARY */}

                  <ReviewSection
                    title="Team Participation"
                    onEdit={() =>
                      goToStep(3)
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Summary
                        label="Participation"
                        value={
                          participation ===
                          "have-team"
                            ? "I have a team"
                            : participation ===
                                "need-team"
                              ? "I need a team"
                              : "Not selected"
                        }
                      />

                      {participation ===
                        "have-team" && (
                        <>
                          <Summary
                            label="Team Mode"
                            value={
                              formData.teamMode ===
                              "create"
                                ? "Create a Team"
                                : formData.teamMode ===
                                    "join"
                                  ? "Join Existing Team"
                                  : "Not selected"
                            }
                          />

                          {formData.teamMode ===
                            "create" && (
                            <Summary
                              label="Team Name"
                              value={
                                formData.teamName ||
                                "Not provided"
                              }
                            />
                          )}

                          {formData.teamMode ===
                            "join" && (
                            <Summary
                              label="Team Code"
                              value={
                                formData.teamCode ||
                                "Not provided"
                              }
                            />
                          )}
                        </>
                      )}

                      {participation ===
                        "need-team" && (
                        <Summary
                          label="Team Matching"
                          value={
                            formData.lookingForTeam
                              ? "Interested"
                              : "Not interested"
                          }
                        />
                      )}
                    </div>
                  </ReviewSection>

                  {/* PROJECT SUMMARY */}

                  <ReviewSection
                    title="Hackathon Interest"
                    onEdit={() =>
                      goToStep(4)
                    }
                  >
                    <div className="grid gap-3">
                      <Summary
                        label="Preferred Track"
                        value={
                          formData.preferredTrack ||
                          "Not selected"
                        }
                      />

                      <Summary
                        label="Project Idea"
                        value={
                          formData.projectIdea ||
                          "Not provided"
                        }
                      />
                    </div>
                  </ReviewSection>

                  {/* TERMS */}

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20">
                      <input
                        type="checkbox"
                        checked={
                          formData.agreeTerms
                        }
                        onChange={(event) =>
                          updateField(
                            "agreeTerms",
                            event.target.checked
                          )
                        }
                        className="mt-1 h-4 w-4 accent-violet-400"
                      />

                      <span className="text-xs leading-6 text-zinc-500">
                        I agree to participate in
                        HackIGNISIA 2026 and confirm that
                        the information provided by me is
                        accurate. I agree to follow the
                        event rules and participation
                        guidelines.

                        <span className="ml-1 text-violet-400">
                          *
                        </span>
                      </span>
                    </label>

                    {errors.agreeTerms && (
                      <p className="mt-2 text-xs text-red-400">
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>

                  {/* COMMUNICATION */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <input
                      type="checkbox"
                      checked={
                        formData.agreeCommunication
                      }
                      onChange={(event) =>
                        updateField(
                          "agreeCommunication",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4 accent-violet-400"
                    />

                    <span className="text-xs leading-6 text-zinc-600">
                      I agree to receive important
                      HackIGNISIA announcements, updates,
                      and event-related communication.
                    </span>
                  </label>

                  {/* FINAL NOTICE */}

                  <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.03] p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
                      Before you submit
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      Please review your information
                      carefully. Your registration will be
                      connected to the HackIGNISIA participant
                      system after the backend integration is
                      completed.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
               NAVIGATION
            ================================================= */}

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">

              {/* LEFT */}

              {step > 1 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Previous
                </button>
              ) : (
                <Link
                  href="/"
                  className="text-center text-sm text-zinc-600 transition hover:text-white sm:text-left"
                >
                  Cancel
                </Link>
              )}

              {/* RIGHT */}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary justify-center"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Registration →
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* FOOTER NOTE */}

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <p className="text-xs leading-6 text-zinc-700">
              HackIGNISIA 2026 • Organized by UDTech India
            </p>

            <p className="mt-1 text-[11px] text-zinc-800">
              National Online AI &amp; Innovation Hackathon
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

      <div className="absolute bottom-[-250px] left-[-150px] h-[450px] w-[450px] rounded-full bg-violet-500/[0.04] blur-[120px]" />

      <div className="absolute right-[-200px] top-[35%] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
    </div>
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
            H
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

        <Link
          href="/"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </header>
  );
}

/* =========================================================
   STEP HEADER
========================================================= */

function StepHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
        Step {number}
      </div>

      <h2 className="mt-3 text-2xl font-bold tracking-tight">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  required = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}

        {required && (
          <span className="ml-1 text-violet-400">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:ring-1 ${
          error
            ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-400/20"
            : "border-white/10 focus:border-violet-400/50 focus:ring-violet-400/20"
        }`}
      />

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  error,
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">
          {label}

          {required && (
            <span className="ml-1 text-violet-400">
              *
            </span>
          )}
        </label>

        <span className="text-[11px] text-zinc-700">
          {value.length}/{maxLength}
        </span>
      </div>

      <textarea
        rows={5}
        value={value}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={`w-full resize-none rounded-xl border bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:ring-1 ${
          error
            ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-400/20"
            : "border-white/10 focus:border-violet-400/50 focus:ring-violet-400/20"
        }`}
      />

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}

        {required && (
          <span className="ml-1 text-violet-400">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-zinc-300 outline-none transition focus:ring-1 ${
          error
            ? "border-red-400/50 focus:border-red-400/60 focus:ring-red-400/20"
            : "border-white/10 focus:border-violet-400/50 focus:ring-violet-400/20"
        }`}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PARTICIPATION CARD
========================================================= */

function ParticipationCard({
  selected,
  icon,
  title,
  description,
  action,
  onClick,
}: {
  selected: boolean;
  icon: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-6 text-left transition ${
        selected
          ? "border-violet-400/60 bg-violet-400/[0.08] shadow-lg shadow-violet-500/5"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
          selected
            ? "bg-violet-400 text-black"
            : "bg-white/[0.05] text-zinc-400"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <div className="mt-5 text-xs font-medium text-violet-400">
        {action} →
      </div>
    </button>
  );
}

/* =========================================================
   REVIEW SECTION
========================================================= */

function ReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs uppercase tracking-[0.18em] text-violet-400">
          {title}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-zinc-600 transition hover:text-white"
        >
          Edit
        </button>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </div>

      <div className="mt-2 break-words text-sm font-medium leading-6 text-zinc-300">
        {value}
      </div>
    </div>
  );
}