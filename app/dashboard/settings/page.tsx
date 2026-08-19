"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  User,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [announcementNotifications, setAnnouncementNotifications] =
    useState(true);
  const [teamNotifications, setTeamNotifications] = useState(true);
  const [submissionNotifications, setSubmissionNotifications] =
    useState(true);

  const [appearance, setAppearance] = useState<
    "dark" | "light" | "system"
  >("dark");

  const [saved, setSaved] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  function handleSave() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Background />

      <div className="relative mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                <Settings size={12} />
                Account Settings
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Manage your account preferences, notifications,
                security and participant experience.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.04] hover:text-white sm:self-auto"
            >
              Back to Dashboard
              <ChevronRight size={14} />
            </Link>
          </div>
        </header>

        {/* =================================================
            ACCOUNT OVERVIEW
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
          <div className="relative p-6 sm:p-7">
            <div className="absolute right-[-100px] top-[-150px] h-[300px] w-[300px] rounded-full bg-violet-500/[0.07] blur-[100px]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-lg font-bold text-violet-300 ring-1 ring-violet-400/10">
                AP
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    Aman Pathak
                  </h2>

                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-emerald-400">
                    Registered
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} />
                    aman@example.com
                  </span>

                  <span>IGN26-00482</span>
                </div>
              </div>

              <Link
                href="/dashboard/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-violet-400/25 hover:text-white"
              >
                <User size={14} />
                Edit Profile
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            SETTINGS GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">
            {/* NOTIFICATIONS */}

            <SettingsCard
              icon={<Bell size={17} />}
              eyebrow="Preferences"
              title="Notifications"
              description="Choose which updates you want to receive."
            >
              <div className="mt-6 divide-y divide-white/[0.06]">
                <SettingRow
                  icon={<Mail size={16} />}
                  title="Email notifications"
                  description="Receive important account and event emails."
                >
                  <Toggle
                    enabled={emailNotifications}
                    onChange={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                  />
                </SettingRow>

                <SettingRow
                  icon={<Bell size={16} />}
                  title="Announcements"
                  description="Get notified about important hackathon updates."
                >
                  <Toggle
                    enabled={announcementNotifications}
                    onChange={() =>
                      setAnnouncementNotifications(
                        !announcementNotifications
                      )
                    }
                  />
                </SettingRow>

                <SettingRow
                  icon={<User size={16} />}
                  title="Team activity"
                  description="Receive updates when your team changes."
                >
                  <Toggle
                    enabled={teamNotifications}
                    onChange={() =>
                      setTeamNotifications(!teamNotifications)
                    }
                  />
                </SettingRow>

                <SettingRow
                  icon={<Check size={16} />}
                  title="Submission updates"
                  description="Get notified about project submission status."
                >
                  <Toggle
                    enabled={submissionNotifications}
                    onChange={() =>
                      setSubmissionNotifications(
                        !submissionNotifications
                      )
                    }
                  />
                </SettingRow>
              </div>
            </SettingsCard>

            {/* APPEARANCE */}

            <SettingsCard
              icon={<Monitor size={17} />}
              eyebrow="Interface"
              title="Appearance"
              description="Customize how the participant portal looks."
            >
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <AppearanceOption
                  icon={<Moon size={18} />}
                  title="Dark"
                  description="Recommended"
                  active={appearance === "dark"}
                  onClick={() => setAppearance("dark")}
                />

                <AppearanceOption
                  icon={<Sun size={18} />}
                  title="Light"
                  description="Bright interface"
                  active={appearance === "light"}
                  onClick={() => setAppearance("light")}
                />

                <AppearanceOption
                  icon={<Monitor size={18} />}
                  title="System"
                  description="Use device setting"
                  active={appearance === "system"}
                  onClick={() => setAppearance("system")}
                />
              </div>
            </SettingsCard>

            {/* SECURITY */}

            <SettingsCard
              icon={<ShieldCheck size={17} />}
              eyebrow="Security"
              title="Account security"
              description="Keep your participant account protected."
            >
              <div className="mt-6 space-y-3">
                <SecurityRow
                  icon={<KeyRound size={17} />}
                  title="Password"
                  description="Change your account password."
                  action={
                    <button
                      type="button"
                      onClick={() => setPasswordModal(true)}
                      className="rounded-xl border border-white/10 px-3.5 py-2 text-[10px] font-medium text-zinc-400 transition hover:border-violet-400/25 hover:text-white"
                    >
                      Change
                    </button>
                  }
                />

                <SecurityRow
                  icon={<Lock size={17} />}
                  title="Two-factor authentication"
                  description="Add another layer of protection to your account."
                  action={
                    <span className="rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-600">
                      Coming Soon
                    </span>
                  }
                />

                <SecurityRow
                  icon={<Smartphone size={17} />}
                  title="Active sessions"
                  description="Manage devices currently signed into your account."
                  action={
                    <button
                      type="button"
                      className="rounded-xl border border-white/10 px-3.5 py-2 text-[10px] font-medium text-zinc-400 transition hover:border-violet-400/25 hover:text-white"
                    >
                      Manage
                    </button>
                  }
                />
              </div>
            </SettingsCard>

            {/* DANGER ZONE */}

            <div className="rounded-3xl border border-red-400/10 bg-red-400/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-red-400">
                <Trash2 size={14} />
                Danger Zone
              </div>

              <h2 className="mt-3 text-lg font-semibold">
                Account actions
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-700">
                These actions can affect your participant account.
                Please proceed carefully.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setLogoutModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-500 transition hover:border-white/20 hover:text-white"
                >
                  <LogOut size={14} />
                  Sign out
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-400/[0.03] px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-400/[0.07]"
                >
                  <Trash2 size={14} />
                  Delete account
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <aside className="space-y-6">
            {/* SAVE CARD */}

            <div className="sticky top-24 rounded-3xl border border-violet-400/10 bg-violet-400/[0.035] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                <Save size={18} />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Save your changes
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Your preferences are currently stored locally in
                this interface. Supabase persistence can be connected
                later.
              </p>

              <button
                type="button"
                onClick={handleSave}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
              >
                {saved ? (
                  <>
                    <Check size={15} />
                    Changes Saved
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* ACCOUNT STATUS */}

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                Account Status
              </div>

              <div className="mt-5 space-y-4">
                <StatusItem
                  label="Registration"
                  value="Confirmed"
                  success
                />

                <StatusItem
                  label="Profile"
                  value="85% Complete"
                />

                <StatusItem
                  label="Team"
                  value="Team Vector"
                />

                <StatusItem
                  label="Account"
                  value="Active"
                  success
                />
              </div>
            </div>

            {/* HELP */}

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
                <ShieldCheck size={17} />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Need help?
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-700">
                If you have any issue with your participant account,
                contact the HackIGNISIA organizing team.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1 text-[10px] font-medium text-violet-400 hover:text-violet-300"
              >
                Contact support
                <ChevronRight size={12} />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          PASSWORD MODAL
      ===================================================== */}

      {passwordModal && (
        <Modal
          title="Change password"
          description="Create a strong password for your participant account."
          onClose={() => setPasswordModal(false)}
        >
          <PasswordForm
            onCancel={() => setPasswordModal(false)}
            onSuccess={() => setPasswordModal(false)}
          />
        </Modal>
      )}

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {logoutModal && (
        <Modal
          title="Sign out?"
          description="You will need to sign in again to access your participant dashboard."
          onClose={() => setLogoutModal(false)}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setLogoutModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setLogoutModal(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-xs font-semibold text-black hover:bg-violet-300"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <Modal
          title="Delete account?"
          description="This is a placeholder action for now. Account deletion will be connected to Supabase after the authentication layer is completed."
          onClose={() => setDeleteModal(false)}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteModal(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setDeleteModal(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/90 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500"
            >
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>
        </Modal>
      )}
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

      <div className="absolute bottom-[-250px] left-[-200px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[130px]" />

      <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.02] blur-[140px]" />
    </div>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
          {icon}
        </div>

        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
            {eyebrow}
          </div>

          <h2 className="mt-1.5 text-lg font-semibold">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-700">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  icon,
  title,
  description,
  children,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.035] text-zinc-600">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium text-zinc-300">
            {title}
          </div>

          <p className="mt-1 text-[10px] leading-5 text-zinc-700">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        enabled
          ? "border-violet-400/30 bg-violet-400"
          : "border-white/10 bg-white/[0.05]"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition ${
          enabled
            ? "left-[22px] bg-black"
            : "left-[3px] bg-zinc-500"
        }`}
      />
    </button>
  );
}

/* =========================================================
   APPEARANCE OPTION
========================================================= */

function AppearanceOption({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        active
          ? "border-violet-400/30 bg-violet-400/[0.06]"
          : "border-white/[0.07] bg-black/20 hover:border-white/[0.14]"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-400 text-black">
          <Check size={11} />
        </span>
      )}

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active
            ? "bg-violet-400/10 text-violet-400"
            : "bg-white/[0.04] text-zinc-600"
        }`}
      >
        {icon}
      </div>

      <div className="mt-4 text-xs font-semibold">
        {title}
      </div>

      <div className="mt-1 text-[9px] text-zinc-700">
        {description}
      </div>
    </button>
  );
}

/* =========================================================
   SECURITY ROW
========================================================= */

function SecurityRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.035] text-zinc-600">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium text-zinc-300">
            {title}
          </div>

          <div className="mt-1 text-[10px] leading-5 text-zinc-700">
            {description}
          </div>
        </div>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   STATUS ITEM
========================================================= */

function StatusItem({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-zinc-700">
        {label}
      </span>

      <span
        className={`flex items-center gap-1.5 text-[10px] font-medium ${
          success ? "text-emerald-400" : "text-zinc-400"
        }`}
      >
        {success && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}

        {value}
      </span>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between border-b border-white/[0.07] p-5">
          <div>
            <h2 className="text-base font-semibold">
              {title}
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-zinc-600">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   PASSWORD FORM
========================================================= */

function PasswordForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const valid =
    password.length >= 8 &&
    confirm.length >= 8 &&
    password === confirm;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (valid) {
          onSuccess();
        }
      }}
      className="space-y-4"
    >
      <PasswordInput
        label="New password"
        value={password}
        onChange={setPassword}
        visible={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />

      <PasswordInput
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        visible={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
      />

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="text-[10px] leading-5 text-zinc-700">
          Password must contain at least 8 characters.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!valid}
          className="rounded-xl bg-violet-400 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Update Password
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 pr-11 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/30"
          placeholder="Enter password"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}