"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { useToast } from "@/modules/shared/components/Toast";
import {
  useBanUserForNote,
  useRevokeNoteSessions,
  useRevokeSession,
  useSecurityProfile,
  useSecuritySignals,
  useSecuritySummary,
  useUnbanUserForNote,
} from "@/modules/security/hooks";
import type { SecuritySignal } from "@/modules/security/types";
import { FormInput, FormTextarea } from "@/modules/shared/components/FormField";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSecurityPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canWrite = hasPermission(user, "notes.write");

  const [noteId, setNoteId] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [signalType, setSignalType] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [banNoteId, setBanNoteId] = React.useState("");
  const [banReason, setBanReason] = React.useState("");
  const [revokeNoteId, setRevokeNoteId] = React.useState("");

  const query = {
    noteId: noteId || undefined,
    userId: userId || undefined,
    signalType: signalType || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize,
  };

  const { data: signalsData, isLoading, error } = useSecuritySignals(query);
  const { data: summary } = useSecuritySummary({ from, to, limit: 5 });
  const { data: profile, isLoading: profileLoading } = useSecurityProfile(
    selectedUserId || undefined,
    25
  );

  const revokeSession = useRevokeSession(selectedUserId || undefined, query);
  const revokeNoteSessions = useRevokeNoteSessions(query);
  const banUser = useBanUserForNote(selectedUserId || undefined, query);
  const unbanUser = useUnbanUserForNote(selectedUserId || undefined, query);

  const columns = React.useMemo<DataTableColumn<SecuritySignal>[]>(
    () => [
      {
        key: "signalType",
        header: "Signal",
        render: (signal) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{signal.signalType}</p>
            <p className="text-xs text-muted-foreground">{formatDate(signal.createdAt)}</p>
          </div>
        ),
      },
      {
        key: "user",
        header: "User",
        render: (signal) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {signal.user?.fullName || signal.user?.email || signal.userId || "-"}
            </p>
            <p className="text-xs text-muted-foreground">{signal.user?.email || "-"}</p>
          </div>
        ),
      },
      {
        key: "note",
        header: "Note",
        render: (signal) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {signal.note?.title || signal.noteId}
            </p>
            <p className="text-xs text-muted-foreground">
              {signal.note?.subjectId || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (signal) => (
          <Button
            variant="ghost"
            size="sm"
            disabled={!signal.userId}
            onClick={() => {
              if (!signal.userId) return;
              setSelectedUserId(signal.userId);
              setProfileOpen(true);
            }}
          >
            View Profile
          </Button>
        ),
      },
    ],
    []
  );

  const handleRevokeNoteSessions = async () => {
    if (!revokeNoteId) return;
    try {
      await revokeNoteSessions.mutateAsync(revokeNoteId);
      toast({ title: "Sessions revoked" });
      setRevokeNoteId("");
    } catch (err) {
      toast({
        title: "Revoke failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to revoke sessions.",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async () => {
    if (!selectedUserId || !banNoteId) return;
    try {
      await banUser.mutateAsync({
        noteId: banNoteId,
        targetUserId: selectedUserId,
        reason: banReason || undefined,
      });
      toast({ title: "User banned for note" });
      setBanNoteId("");
      setBanReason("");
    } catch (err) {
      toast({
        title: "Ban failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to ban user.",
        variant: "destructive",
      });
    }
  };

  return (
    <RequirePerm perm="security.read">
      <div className="space-y-6">
        <PageHeader
          title="Security"
          description="Review note access signals and take action."
        />
        <p className="text-sm text-muted-foreground">
          Tip: copy Note IDs from the Notes page and User IDs from the Users page.
          Leave filters empty to see everything.
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Signals
            </p>
            <p className="mt-2 text-2xl font-semibold">{summary?.total ?? "-"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Top Signal Types
            </p>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              {summary?.byType?.length ? (
                summary.byType.map((item) => (
                  <div key={item.signalType} className="flex justify-between">
                    <span>{item.signalType}</span>
                    <span className="text-foreground">{item.count}</span>
                  </div>
                ))
              ) : (
                <p>No signals in range.</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Top Users
            </p>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              {summary?.topUsers?.length ? (
                summary.topUsers.map((item) => (
                  <div key={item.userId || String(item.count)} className="flex justify-between">
                    <span>{item.user?.email || item.userId || "-"}</span>
                    <span className="text-foreground">{item.count}</span>
                  </div>
                ))
              ) : (
                <p>No users in range.</p>
              )}
            </div>
          </div>
        </div>

        <FiltersBar
          filters={
            <>
              <Input
                placeholder="Note ID (from Notes table)"
                value={noteId}
                onChange={(event) => {
                  setNoteId(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                placeholder="User ID (from Users table)"
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  setPage(1);
                }}
              />
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={signalType}
                onChange={(event) => {
                  setSignalType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All signals</option>
                <option value="RANGE_SCRAPE">Range scrape</option>
                <option value="TOKEN_REUSE">Token reuse</option>
                <option value="RATE_LIMIT">Rate limit</option>
                <option value="SUSPICIOUS_DEVICE">Suspicious device</option>
              </select>
              <Input
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
              <Input
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </>
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setNoteId("");
                setUserId("");
                setSignalType("");
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        <DataTable
          columns={columns}
          rows={signalsData?.data ?? []}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : error
                ? "Unable to load signals."
                : null
          }
          emptyLabel="No security signals found."
          pagination={
            signalsData && signalsData.total > signalsData.pageSize
              ? {
                  page: signalsData.page,
                  pageSize: signalsData.pageSize,
                  total: signalsData.total,
                  onPageChange: (nextPage) => setPage(nextPage),
                }
              : undefined
          }
        />
      </div>

      <Modal
        open={profileOpen}
        onOpenChange={(open) => {
          if (!open) {
            setProfileOpen(false);
            setSelectedUserId(null);
          }
        }}
        title="User Security Profile"
        description="Active sessions, bans, and recent signals."
        className="max-w-4xl"
      >
        {profileLoading ? (
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        ) : profile ? (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">User</p>
                <p className="font-medium">
                  {profile.user.fullName || profile.user.email || profile.user.id}
                </p>
                <p className="text-xs text-muted-foreground">{profile.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Signals</p>
                <p className="font-medium">{profile.summary.totalSignals}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
                <p className="font-medium">{profile.summary.activeSessions}</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Active Sessions</p>
                {profile.activeSessions.length ? (
                  profile.activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-border bg-card px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {session.note?.title || session.noteId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last seen {formatDate(session.lastSeenAt)}
                          </p>
                        </div>
                        {canWrite ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => revokeSession.mutateAsync(session.id)}
                          >
                            Revoke
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No active sessions.</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Active Bans</p>
                {profile.activeBans.length ? (
                  profile.activeBans.map((ban) => (
                    <div
                      key={ban.id}
                      className="rounded-xl border border-border bg-card px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {ban.note?.title || ban.noteId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ban.reason || "No reason"}
                          </p>
                        </div>
                        {canWrite ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              unbanUser.mutateAsync({
                                noteId: ban.noteId,
                                targetUserId: ban.userId,
                              })
                            }
                          >
                            Unban
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No active bans.</p>
                )}
              </div>
            </div>

            {canWrite ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold">Revoke Note Sessions</p>
                  <FormInput
                    label="Note ID"
                    placeholder="Paste note ID"
                    description="Revokes all active sessions for this note."
                    value={revokeNoteId}
                    onChange={(event) => setRevokeNoteId(event.target.value)}
                  />
                  <Button size="sm" variant="secondary" onClick={handleRevokeNoteSessions}>
                    Revoke Sessions
                  </Button>
                </div>
                <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold">Ban User for Note</p>
                  <FormInput
                    label="Note ID"
                    placeholder="Paste note ID"
                    description="Prevents this user from accessing the note."
                    value={banNoteId}
                    onChange={(event) => setBanNoteId(event.target.value)}
                  />
                  <FormTextarea
                    label="Reason"
                    placeholder="Optional reason"
                    value={banReason}
                    onChange={(event) => setBanReason(event.target.value)}
                  />
                  <Button size="sm" variant="destructive" onClick={handleBanUser}>
                    Ban User
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No profile data.</p>
        )}
      </Modal>
    </RequirePerm>
  );
}
