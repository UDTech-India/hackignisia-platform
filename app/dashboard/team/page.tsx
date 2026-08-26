"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Crown,
  LogOut,
  Mail,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  initials: string;
  isLeader?: boolean;
  status: "accepted" | "pending";
};

type Request = {
  id: number;
  name: string;
  email: string;
  initials: string;
};

/* =========================================================
   INITIAL MOCK DATA
   Replace with Supabase data later.
========================================================= */

const initialMembers: Member[] = [
  {
    id: 1,
    name: "Aman Pathak",
    email: "aman@example.com",
    role: "Team Leader",
    initials: "AP",
    isLeader: true,
    status: "accepted",
  },
  {
    id: 2,
    name: "Anusha Anu Prasad",
    email: "anusha@example.com",
    role: "Backend & Architecture",
    initials: "AA",
    status: "accepted",
  },
  {
    id: 3,
    name: "Team Member",
    email: "member@example.com",
    role: "Frontend Developer",
    initials: "TM",
    status: "accepted",
  },
  {
    id: 4,
    name: "Team Member",
    email: "member2@example.com",
    role: "AI / ML Developer",
    initials: "TM",
    status: "accepted",
  },
];

const initialRequests: Request[] = [
  {
    id: 101,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    initials: "RS",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function TeamDashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [team, setTeam] = useState<{ id: string; name: string; code: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [myMemberStatus, setMyMemberStatus] = useState<"accepted" | "pending" | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  const maxMembers = 5;
  const acceptedMembers = members.filter((member) => member.status === "accepted");
  const isLeader = members.some((m) => m.id.toString() === userId && m.isLeader);
  const supabase = createClient();

  useEffect(() => {
    async function loadTeam() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("profile_completed")
          .eq("id", user.id)
          .single();
        
        if (profileData && profileData.profile_completed === false) {
          router.push("/dashboard/profile");
          return;
        }

        // Fetch user's team membership
        const { data: myMember } = await supabase
          .from("team_members")
          .select("team_id, status")
          .eq("profile_id", user.id)
          .single();

        if (myMember && myMember.team_id) {
          setMyMemberStatus(myMember.status as "accepted" | "pending");
          // Fetch team details
          const { data: teamData } = await supabase
            .from("teams")
            .select("*")
            .eq("id", myMember.team_id)
            .single();

          if (teamData) {
            setTeam({ id: teamData.id, name: teamData.name, code: teamData.team_code });

            // Fetch all members
            const { data: allMembers } = await supabase
              .from("team_members")
              .select(`
                profile_id,
                is_leader,
                status,
                profiles (
                  full_name,
                  email
                )
              `)
              .eq("team_id", teamData.id);

            if (allMembers) {
              const mappedMembers = allMembers.map((m: any) => ({
                  id: m.profile_id,
                  name: m.profiles?.full_name || "Unknown User",
                  email: m.profiles?.email || "",
                  role: m.status === 'pending' ? 'Pending Request' : (m.is_leader ? "Team Leader" : "Team Member"),
                  initials: (m.profiles?.full_name || "Un").substring(0, 2).toUpperCase(),
                  isLeader: m.is_leader,
                  status: m.status,
                }));
              setMembers(mappedMembers);

              const mappedRequests = allMembers
                .filter((m: any) => m.status === 'pending')
                .map((m: any) => ({
                  id: m.profile_id,
                  name: m.profiles?.full_name || "Unknown User",
                  email: m.profiles?.email || "",
                  initials: (m.profiles?.full_name || "Un").substring(0, 2).toUpperCase(),
                }));
              setRequests(mappedRequests);
            }
          }
        }
      } catch (err) {
        console.error("Error loading team data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const copyTeamCode = async () => {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.code);
    } catch {}
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !team) return;

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team_invite",
          email: inviteEmail,
          data: {
            teamName: team.name,
            teamCode: team.code,
            inviterName: "Your teammate",
          },
        }),
      });

      if (res.ok) {
        alert(`Invite sent successfully to ${inviteEmail}!`);
      } else {
        const err = await res.json();
        alert(`Failed to send invite: ${err.error}`);
      }
    } catch (e: any) {
      alert(`Error sending invite: ${e.message}`);
    }

    setInviteEmail("");
    setShowInvite(false);
  };

  const acceptRequest = async (request: Request) => {
    if (!team) return;
    if (acceptedMembers.length >= maxMembers) {
      alert("Team is full.");
      return;
    }
    const { error } = await supabase
      .from("team_members")
      .update({ status: "accepted" })
      .eq("team_id", team.id)
      .eq("profile_id", request.id);
    
    if (!error) {
      // Notify the accepted member
      await supabase.from("notifications").insert({
        profile_id: request.id,
        message: `Your request to join ${team.name} was accepted!`,
      });
      window.location.reload();
    }
  };

  const rejectRequest = async (requestId: number | string) => {
    if (!team) return;
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", team.id)
      .eq("profile_id", requestId);
    if (!error) {
      setRequests(current => current.filter(r => r.id.toString() !== requestId.toString()));
    }
  };

  const removeMember = async (memberId: number | string) => {
    if (!team) return;
    const confirmed = window.confirm("Remove this member?");
    if (!confirmed) return;
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", team.id)
      .eq("profile_id", memberId);
    if (!error) {
      setMembers(current => current.filter(m => m.id.toString() !== memberId.toString()));
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || !userId) return;
    
    // Check if user already in team
    if (team) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("is_active", true)
      .single();
      
    if (eventError || !eventData) {
      throw new Error("Could not find an active event to register the team under.");
    }

    const { data: newTeam, error } = await supabase
      .from("teams")
      .insert({
        name: newTeamName,
        team_code: code,
        created_by: userId,
        max_members: maxMembers,
        event_id: eventData.id
      })
      .select()
      .single();

    if (!error && newTeam) {
      // Add creator as the accepted team leader
      await supabase.from("team_members").insert({
        team_id: newTeam.id,
        profile_id: userId,
        status: "accepted",
        is_leader: true,
      });
      window.location.reload();
    } else {
      throw new Error("SUPABASE ERROR DETAILS: " + JSON.stringify(error, null, 2));
    }

    setNewTeamName("");
    setShowCreate(false);
  };

  const joinTeam = async () => {
    if (teamCode.trim().length !== 6 || !userId) {
      alert("Please enter a valid 6-character team code.");
      return;
    }

    // Use the RPC to look up the team — direct table query is blocked by RLS for regular users
    const { data: targetTeamRows, error: searchError } = await supabase
      .rpc("get_team_by_code", {
        p_team_code: teamCode.toUpperCase(),
      });



    const targetTeam = Array.isArray(targetTeamRows) ? targetTeamRows[0] : targetTeamRows;

    if (searchError || !targetTeam) {
      alert("Invalid team code. Error: " + (searchError?.message ?? "Team not found"));
      return;
    }

    const { error } = await supabase
      .from("team_members")
      .insert({
        team_id: (targetTeam as { id: string }).id,
        profile_id: userId,
        status: "pending",
        is_leader: false
      });

    if (!error) {
      // Fetch leader and notify
      const { data: leaderId } = await supabase.rpc("get_team_leader", {
        p_team_id: (targetTeam as { id: string }).id
      });
      if (leaderId) {
        // Find my name
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
        const myName = profile?.full_name || "Someone";
        
        await supabase.from("notifications").insert({
          profile_id: leaderId,
          message: `${myName} requested to join your team.`,
        });
      }

      alert("Join request sent! The team leader will approve your request.");
    } else {
      alert("Error sending join request. You might already be in a team or have a pending request.");
    }

    setTeamCode("");
    setShowJoin(false);
  };

  const transferLeadership = async (newLeaderId: string) => {
    if (!team) return;
    const { error } = await supabase.rpc('transfer_team_leadership', {
      p_team_id: team.id,
      p_new_leader_id: newLeaderId
    });
    if (!error) {
      window.location.reload();
    } else {
      alert(error.message);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team || !userId) return;
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", team.id)
      .eq("profile_id", userId);
    
    if (!error) {
      window.location.reload();
    }
  };

  const handleDeleteTeam = async () => {
    if (!team || !userId) return;
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id);
    
    if (!error) {
      window.location.reload();
    } else {
      alert("Error deleting team: " + error.message);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Background />

      <div className="relative">
        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-500 transition hover:text-white"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-700">
                  Participant Portal
                </div>

                <div className="mt-1 text-sm font-semibold">
                  My Team
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="hidden text-xs text-zinc-600 transition hover:text-white sm:block"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        {myMemberStatus === "pending" && team ? (
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-10 lg:py-32">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
              <span className="h-4 w-4 rounded-full bg-amber-400" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Request Pending
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
              Your request to join <strong className="text-white">{team.name}</strong> has been sent to the team leader. You will be able to access the team workspace once they approve your request.
            </p>

            <button
              type="button"
              onClick={handleLeaveTeam}
              className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08]"
            >
              Cancel Request
            </button>
          </div>
        ) : (
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-400/[0.09] via-white/[0.025] to-transparent p-6 sm:p-8">
            <div className="absolute right-[-100px] top-[-120px] h-[300px] w-[300px] rounded-full bg-violet-500/[0.08] blur-[100px]" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-violet-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  Team Workspace
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {team ? team.name : "Your Team"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  Manage your team members, invitations and
                  leadership from one place.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoin(true)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-violet-400/30 hover:text-white"
                >
                  Join Team
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="rounded-xl bg-violet-400 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-300"
                >
                  Create Team
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              TEAM CODE + STATS
          ================================================= */}

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
            {/* TEAM CODE */}

            <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-zinc-700">
                    Team Code
                  </div>

                  <div className="mt-2 font-mono text-2xl font-bold tracking-[0.18em] text-violet-300">
                    {team ? team.code : "------"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyTeamCode}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-500 transition hover:text-white"
                  title="Copy team code"
                >
                  <Copy size={16} />
                </button>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-zinc-700">
                Share this code with participants who want to
                join your team.
              </p>
            </div>

            {/* MEMBERS */}

            <StatCard
              icon={<Users size={18} />}
              label="Members"
              value={`${acceptedMembers.length}/${maxMembers}`}
              description="Team capacity"
            />

            {/* STATUS */}

            <StatCard
              icon={<Shield size={18} />}
              label="Status"
              value="Active"
              description="Team is registered"
              success
            />
          </section>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
            {/* =================================================
                MEMBERS
            ================================================= */}

            <DashboardCard>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <SectionHeading
                  icon={<Users size={16} />}
                  eyebrow="Members"
                  title="Team members"
                  description="Everyone currently registered with your team."
                />

                <button
                  type="button"
                  onClick={() => setShowInvite(true)}
                  disabled={
                    acceptedMembers.length >= maxMembers
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <UserPlus size={14} />
                  Invite
                </button>
              </div>

              <div className="mt-7 space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 transition hover:border-white/[0.12]"
                  >
                    <Avatar initials={member.initials} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-300">
                          {member.name}
                        </span>

                        {member.isLeader && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-violet-400/10 px-2 py-1 text-[8px] font-medium uppercase tracking-wider text-violet-400">
                            <Crown size={9} />
                            Leader
                          </span>
                        )}
                      </div>

                      <div className="mt-1 truncate text-[10px] text-zinc-700">
                        {member.email}
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <div className="text-[10px] text-zinc-500">
                        {member.role}
                      </div>

                      {member.status === "accepted" ? (
                        <div className="mt-1 flex items-center justify-end gap-1.5 text-[9px] text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Accepted
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center justify-end gap-1.5 text-[9px] text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Pending
                        </div>
                      )}
                    </div>

                    <div className="w-9 h-9 shrink-0 flex items-center justify-end">
                      {isLeader && !member.isLeader && (
                        <button
                          type="button"
                          onClick={() =>
                            removeMember(member.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 opacity-0 transition hover:bg-red-400/10 hover:text-red-400 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CAPACITY */}

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-700">
                    Team capacity
                  </span>

                  <span className="text-xs font-medium text-zinc-400">
                    {acceptedMembers.length} / {maxMembers}
                  </span>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {Array.from({
                    length: maxMembers,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full ${
                        index < acceptedMembers.length
                          ? "bg-violet-400"
                          : "bg-white/[0.07]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </DashboardCard>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="space-y-6">
              {/* JOIN REQUESTS */}
              {isLeader && (
              <DashboardCard>
                <SectionHeading
                  icon={<Mail size={16} />}
                  eyebrow="Requests"
                  title="Join requests"
                  description="Participants asking to join your team."
                />

                <div className="mt-6 space-y-3">
                  {requests.length === 0 ? (
                    <EmptyState
                      icon={<Mail size={17} />}
                      title="No pending requests"
                      description="New join requests will appear here."
                    />
                  ) : (
                    requests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={request.initials}
                            small
                          />

                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium text-zinc-300">
                              {request.name}
                            </div>

                            <div className="mt-1 truncate text-[9px] text-zinc-700">
                              {request.email}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              acceptRequest(request)
                            }
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400/10 py-2 text-[10px] font-medium text-emerald-400 transition hover:bg-emerald-400/15"
                          >
                            <Check size={13} />
                            Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              rejectRequest(request.id)
                            }
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-red-400/10 py-2 text-[10px] font-medium text-red-400 transition hover:bg-red-400/15"
                          >
                            <X size={13} />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DashboardCard>
              )}

              {/* LEADERSHIP */}

              <DashboardCard>
                <SectionHeading
                  icon={<Crown size={16} />}
                  eyebrow="Leadership"
                  title="Team leader"
                  description="Leadership controls for your team."
                />

                <div className="mt-6 rounded-2xl border border-violet-400/10 bg-violet-400/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={members.find((m) => m.isLeader)?.initials || "??"} small />

                    <div>
                      <div className="text-xs font-medium text-zinc-300">
                        {members.find((m) => m.isLeader)?.name || "Unknown"}
                      </div>

                      <div className="mt-1 text-[9px] text-violet-400">
                        Current Team Leader
                      </div>
                    </div>
                  </div>
                </div>
                {isLeader && members.filter(m => !m.isLeader && m.status === 'accepted').length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTransfer(true)}
                  className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-xs text-zinc-600 transition hover:border-white/[0.12] hover:text-zinc-300"
                >
                  Transfer leadership
                  <ChevronRight size={14} />
                </button>
                )}
              </DashboardCard>

              {/* LEAVE TEAM */}

              <div className="rounded-3xl border border-red-400/10 bg-red-400/[0.025] p-5">
                <div className="flex items-center gap-2 text-red-400">
                  <LogOut size={15} />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
                    Danger Zone
                  </span>
                </div>

                <p className="mt-3 text-[10px] leading-5 text-zinc-700">
                  {isLeader 
                    ? "Deleting the team will permanently remove it and all its members."
                    : "Leaving a team will remove you from its participant group."}
                </p>

                {isLeader ? (
                  <button
                    type="button"
                    onClick={() => setShowDelete(true)}
                    className="mt-4 w-full rounded-xl border border-red-400/15 px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-400/10"
                  >
                    Delete Team
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLeave(true)}
                    className="mt-4 w-full rounded-xl border border-red-400/15 px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-400/10"
                  >
                    Leave Team
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="mt-10 border-t border-white/[0.06] pt-6">
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
                  href="/rules"
                  className="transition hover:text-zinc-400"
                >
                  Rules
                </Link>

                <Link
                  href="/contact"
                  className="transition hover:text-zinc-400"
                >
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
        )}
      </div>

      {/* =====================================================
          INVITE MODAL
      ===================================================== */}

      {showInvite && (
        <Modal
          title="Invite participant"
          description="Send an invitation to a participant to join your team."
          onClose={() => setShowInvite(false)}
        >
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-600">
              Email address
            </label>

            <input
              value={inviteEmail}
              onChange={(event) =>
                setInviteEmail(event.target.value)
              }
              placeholder="participant@example.com"
              type="email"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
            />

            <button
              type="button"
              onClick={sendInvite}
              className="mt-4 w-full rounded-xl bg-violet-400 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
            >
              Send Invitation
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          JOIN TEAM MODAL
      ===================================================== */}

      {showJoin && (
        <Modal
          title="Join a team"
          description="Enter the 6-character team code shared by the team leader."
          onClose={() => setShowJoin(false)}
        >
          <label className="text-[10px] uppercase tracking-wider text-zinc-600">
            Team code
          </label>

          <input
            value={teamCode}
            onChange={(event) =>
              setTeamCode(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 6)
              )
            }
            placeholder="VX7K29"
            maxLength={6}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center font-mono text-xl font-bold tracking-[0.2em] text-white outline-none transition placeholder:text-zinc-800 focus:border-violet-400/40"
          />

          <button
            type="button"
            onClick={joinTeam}
            className="mt-4 w-full rounded-xl bg-violet-400 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
          >
            Send Join Request
          </button>
        </Modal>
      )}

      {/* =====================================================
          CREATE TEAM MODAL
      ===================================================== */}

      {showCreate && (
        <Modal
          title="Create a new team"
          description="Create a team for HackIGNISIA 2026."
          onClose={() => setShowCreate(false)}
        >
          <label className="text-[10px] uppercase tracking-wider text-zinc-600">
            Team name
          </label>

          <input
            value={newTeamName}
            onChange={(event) =>
              setNewTeamName(event.target.value)
            }
            placeholder="Enter team name"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
          />

          <button
            type="button"
            onClick={createTeam}
            className="mt-4 w-full rounded-xl bg-violet-400 py-3 text-xs font-semibold text-black transition hover:bg-violet-300"
          >
            Create Team
          </button>
        </Modal>
      )}

      {/* =====================================================
          TRANSFER LEADERSHIP MODAL
      ===================================================== */}

      {showTransfer && (
        <Modal
          title="Transfer Leadership"
          description="Select a team member to become the new team leader. This action cannot be undone."
          onClose={() => setShowTransfer(false)}
        >
          <div className="space-y-2">
            {members
              .filter(m => !m.isLeader && m.status === 'accepted')
              .map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    setShowTransfer(false);
                    transferLeadership(member.id.toString());
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3 text-left transition hover:border-violet-400/30 hover:bg-violet-400/[0.04]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-zinc-300">
                    {member.initials}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-200">{member.name}</div>
                    <div className="mt-0.5 text-[10px] text-zinc-600">{member.email}</div>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-zinc-700" />
                </button>
              ))}
          </div>
        </Modal>
      )}

      {/* =====================================================
          LEAVE MODAL
      ===================================================== */}

      {showLeave && (
        <Modal
          title="Leave Team?"
          description={`Are you sure you want to leave ${team?.name}?`}
          onClose={() => setShowLeave(false)}
        >
          <button
            type="button"
            onClick={() => {
              setShowLeave(false);
              handleLeaveTeam();
            }}
            className="mt-4 w-full rounded-xl bg-red-400 py-3 text-xs font-semibold text-black transition hover:bg-red-300"
          >
            Confirm
          </button>
        </Modal>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDelete && (
        <Modal
          title="Delete Team?"
          description={`Are you sure you want to permanently delete ${team?.name}? This action cannot be undone and will remove all members.`}
          onClose={() => setShowDelete(false)}
        >
          <button
            type="button"
            onClick={() => {
              setShowDelete(false);
              handleDeleteTeam();
            }}
            className="mt-4 w-full rounded-xl bg-red-400 py-3 text-xs font-semibold text-black transition hover:bg-red-300"
          >
            Confirm Delete
          </button>
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

      <div className="absolute bottom-[-300px] left-[-200px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[130px]" />

      <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.02] blur-[140px]" />
    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      {children}
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-400/10">
          {icon}
        </span>

        {eyebrow}
      </div>

      <h2 className="mt-3 text-lg font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-700">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  success,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.12]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500">
          {icon}
        </div>

        {success && (
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        )}
      </div>

      <div className="mt-5 text-[9px] uppercase tracking-[0.16em] text-zinc-700">
        {label}
      </div>

      <div className="mt-1 text-lg font-semibold">
        {value}
      </div>

      <div className="mt-1 text-[10px] text-zinc-700">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  initials,
  small = false,
}: {
  initials: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-violet-400/10 font-semibold text-violet-300 ${
        small
          ? "h-9 w-9 text-[10px]"
          : "h-11 w-11 text-xs"
      }`}
    >
      {initials}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-700">
        {icon}
      </div>

      <div className="mt-3 text-xs font-medium text-zinc-500">
        {title}
      </div>

      <p className="mt-1 text-[10px] leading-5 text-zinc-700">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {title}
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}