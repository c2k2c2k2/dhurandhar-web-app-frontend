"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { RequirePerm } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import {
  useAccessPermissions,
  useAccessRoles,
  useCreateAccessRole,
  useDeleteAccessRole,
  useUpdateAccessRole,
} from "@/modules/access-control/hooks";
import type { AccessRole } from "@/modules/access-control/types";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/modules/shared/components/DataTable";
import { FormInput, FormTextarea } from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";

function sortKeys(keys: string[]) {
  return [...keys].sort((left, right) => left.localeCompare(right));
}

export default function AccessControlPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canRead = hasPermission(user, "rbac.read");
  const canManage = hasPermission(user, "rbac.manage");

  const permissionsQuery = useAccessPermissions(canRead);
  const rolesQuery = useAccessRoles(canRead);
  const createRole = useCreateAccessRole();
  const updateRole = useUpdateAccessRole();
  const deleteRole = useDeleteAccessRole();

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<"create" | "edit">("create");
  const [editingRole, setEditingRole] = React.useState<AccessRole | null>(null);
  const [name, setName] = React.useState("");
  const [key, setKey] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [permissionKeys, setPermissionKeys] = React.useState<string[]>([]);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<AccessRole | null>(null);

  const permissionOptions = React.useMemo(
    () =>
      (permissionsQuery.data ?? []).map((permission) => ({
        id: permission.key,
        label: permission.key,
      })),
    [permissionsQuery.data]
  );

  const resetEditor = React.useCallback(() => {
    setName("");
    setKey("");
    setDescription("");
    setPermissionKeys([]);
    setEditingRole(null);
    setEditorMode("create");
  }, []);

  const openCreate = () => {
    resetEditor();
    setEditorMode("create");
    setEditorOpen(true);
  };

  const openEdit = (role: AccessRole) => {
    setEditorMode("edit");
    setEditingRole(role);
    setName(role.name ?? "");
    setKey(role.key ?? "");
    setDescription(role.description ?? "");
    setPermissionKeys(sortKeys(role.permissionKeys ?? []));
    setEditorOpen(true);
  };

  const submitEditor = async () => {
    if (!name.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a role name.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      key: editorMode === "create" && key.trim() ? key.trim() : undefined,
      description: description.trim() || undefined,
      permissionKeys: sortKeys(permissionKeys),
    };

    try {
      if (editorMode === "create") {
        await createRole.mutateAsync(payload);
        toast({ title: "Role created" });
      } else if (editingRole) {
        await updateRole.mutateAsync({ roleId: editingRole.id, payload });
        toast({ title: "Role updated" });
      }

      setEditorOpen(false);
      resetEditor();
    } catch (error) {
      toast({
        title: "Unable to save role",
        description:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole.mutateAsync(deleteTarget.id);
      toast({ title: "Role deleted" });
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to delete role.",
        variant: "destructive",
      });
    }
  };

  const columns = React.useMemo<DataTableColumn<AccessRole>[]>(
    () => [
      {
        key: "name",
        header: "Role",
        render: (role) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{role.name}</p>
              {role.isSystem ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  System
                </span>
              ) : null}
            </div>
            {role.description ? (
              <p className="text-xs text-muted-foreground">{role.description}</p>
            ) : null}
          </div>
        ),
      },
      {
        key: "key",
        header: "Key",
        render: (role) => <span className="text-xs font-mono">{role.key}</span>,
      },
      {
        key: "permissions",
        header: "Permissions",
        render: (role) => (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {role.permissionKeys.length} permission(s)
            </p>
            <div className="flex max-w-md flex-wrap gap-1">
              {role.permissionKeys.slice(0, 4).map((permission) => (
                <span
                  key={`${role.id}-${permission}`}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground"
                >
                  {permission}
                </span>
              ))}
              {role.permissionKeys.length > 4 ? (
                <span className="text-[11px] text-muted-foreground">
                  +{role.permissionKeys.length - 4} more
                </span>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        key: "users",
        header: "Users",
        render: (role) => role.userCount ?? 0,
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (role) =>
          canManage ? (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={Boolean(role.isSystem)}
                onClick={() => openEdit(role)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={Boolean(role.isSystem) || (role.userCount ?? 0) > 0}
                onClick={() => {
                  setDeleteTarget(role);
                  setDeleteOpen(true);
                }}
              >
                Delete
              </Button>
            </div>
          ) : null,
      },
    ],
    [canManage]
  );

  return (
    <RequirePerm perm="rbac.read">
      <div className="space-y-6">
        <PageHeader
          title="Access Control"
          description="Create dynamic admin roles and control each role's permission scope."
          actions={
            canManage ? (
              <Button variant="cta" onClick={openCreate}>
                Create Role
              </Button>
            ) : null
          }
        />

        <DataTable
          columns={columns}
          rows={rolesQuery.data ?? []}
          loading={rolesQuery.isLoading}
          error={
            rolesQuery.error &&
            typeof rolesQuery.error === "object" &&
            "message" in rolesQuery.error
              ? String(rolesQuery.error.message)
              : rolesQuery.error
                ? "Unable to load roles."
                : null
          }
          emptyLabel="No roles found."
        />
      </div>

      <Modal
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            resetEditor();
          }
        }}
        title={editorMode === "create" ? "Create Role" : "Edit Role"}
        description="Choose a role name and permission set for this operator group."
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FormInput
              label="Role Name"
              placeholder="Content Operator"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <FormInput
              label="Role Key"
              placeholder="CONTENT_OPERATOR"
              value={key}
              disabled={editorMode === "edit"}
              onChange={(event) => setKey(event.target.value)}
              description={
                editorMode === "create"
                  ? "Optional. If empty, key is generated from role name."
                  : "Role key cannot be changed."
              }
            />
          </div>

          <FormTextarea
            label="Description"
            placeholder="Describe what this role can manage."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <MultiSelectField
            label="Permissions"
            description="Select all actions this role should be allowed to perform."
            items={permissionOptions}
            value={permissionKeys}
            onChange={(next) => setPermissionKeys(sortKeys(next))}
            loading={permissionsQuery.isLoading}
            loadingLabel="Loading permission catalog..."
            emptyLabel="No permissions available."
            modalTitle="Select Permissions"
            modalDescription="Search and choose permission keys for this role."
            searchPlaceholder="Search permission key"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditorOpen(false);
                resetEditor();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={submitEditor}
              disabled={createRole.isPending || updateRole.isPending}
            >
              {editorMode === "create" ? "Create Role" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Role"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This cannot be undone.`
            : "Delete this role?"
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </RequirePerm>
  );
}
