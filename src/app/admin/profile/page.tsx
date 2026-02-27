"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/AuthProvider";
import { normalizeIndianPhone } from "@/lib/phone";
import { getMyProfile, updateMyProfile } from "@/modules/account/api";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useToast } from "@/modules/shared/components/Toast";

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return fallback;
}

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

export default function AdminProfilePage() {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["admin", "profile", "me"],
    queryFn: getMyProfile,
  });

  const updateProfile = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "profile", "me"], updated);
    },
  });

  React.useEffect(() => {
    if (!profileQuery.data || isDirty) {
      return;
    }
    setFullName(profileQuery.data.fullName ?? "");
    setPhone(profileQuery.data.phone ?? "");
  }, [isDirty, profileQuery.data]);

  const handleReset = () => {
    setFullName(profileQuery.data?.fullName ?? "");
    setPhone(profileQuery.data?.phone ?? "");
    setProfileError(null);
    setIsDirty(false);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const profile = profileQuery.data;
    if (!profile) {
      return;
    }

    setProfileError(null);

    const nextFullName = fullName.trim();
    const currentFullName = (profile.fullName ?? "").trim();
    const inputPhone = phone.trim();
    const currentPhone = (profile.phone ?? "").trim();

    let normalizedPhone: string | undefined;
    if (inputPhone) {
      normalizedPhone = normalizeIndianPhone(inputPhone) ?? undefined;
      if (!normalizedPhone) {
        setProfileError("Enter a valid Indian mobile number.");
        return;
      }
    } else if (currentPhone) {
      normalizedPhone = currentPhone;
    }

    const payload: { fullName?: string; phone?: string } = {};
    if (nextFullName && nextFullName !== currentFullName) {
      payload.fullName = nextFullName;
    }
    if (normalizedPhone && normalizedPhone !== currentPhone) {
      payload.phone = normalizedPhone;
    }

    if (!payload.fullName && !payload.phone) {
      setIsDirty(false);
      toast({
        title: "No changes",
        description: "Profile details are already up to date.",
      });
      return;
    }

    try {
      const updated = await updateProfile.mutateAsync(payload);
      setFullName(updated.fullName ?? "");
      setPhone(updated.phone ?? "");
      setIsDirty(false);
      await refreshUser();
      toast({ title: "Profile updated" });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update profile.");
      setProfileError(message);
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (profileQuery.error || !profileQuery.data) {
    return (
      <ErrorState
        description={getErrorMessage(
          profileQuery.error,
          "Unable to load profile."
        )}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your account details used across the admin console."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
          <CardDescription>
            Phone numbers must be valid Indian mobile numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full name</label>
                <Input
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile number</label>
                <Input
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {profileError ? (
              <p className="text-sm text-destructive">{profileError}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={updateProfile.isPending || !isDirty}
              >
                Reset
              </Button>
            </div>
          </form>

          <div className="grid gap-3 rounded-2xl border border-border bg-muted/30 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Account type
              </p>
              <p className="text-sm font-medium">{profile.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="text-sm font-medium">{profile.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Joined
              </p>
              <p className="text-sm font-medium">{formatDate(profile.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Last login
              </p>
              <p className="text-sm font-medium">
                {formatDate(profile.lastLoginAt)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Last active
              </p>
              <p className="text-sm font-medium">
                {formatDate(profile.lastActiveAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
