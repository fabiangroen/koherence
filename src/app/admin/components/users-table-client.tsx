"use client";

import React, { useState, useTransition, useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  deleteUserAction,
  setUserRoleAction,
  approveUserAction,
  denyUserAction,
} from "@/app/admin/actions/user-actions";
import { toast } from "sonner";

interface UserRowData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface Props {
  users: UserRowData[];
}

// Small wrapper to avoid repetition
function ActionButton({
  children,
  onClick,
  pending,
  variant = "ghost",
  size = "icon",
  className = "",
  pendingLabel = "...",
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending?: boolean;
  variant?: any;
  size?: any;
  className?: string;
  pendingLabel?: string;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

type ActionKind = "approve" | "deny" | "delete" | "role";

export default function UsersTableClient({ users }: Props) {
  const [pendingUsers, setPendingUsers] = useState(() =>
    users.filter((u) => !u.role),
  );
  const [activeUsers, setActiveUsers] = useState(() =>
    users.filter((u) => u.role),
  );
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    kind: ActionKind;
  } | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: ActionKind;
    user: UserRowData;
  } | null>(null);
  const [, startTransition] = useTransition();

  const form = useCallback(
    async (
      action: (fd: FormData) => Promise<any>,
      id: string,
      extra?: Record<string, string>,
    ) => {
      const fd = new FormData();
      fd.append("id", id);
      if (extra) for (const [k, v] of Object.entries(extra)) fd.append(k, v);
      await action(fd as any);
    },
    [],
  );

  const run = useCallback(
    (
      kind: ActionKind,
      user: UserRowData,
      optimistic: () => void,
      task: () => Promise<void>,
      rollback?: () => void,
    ) => {
      setPendingAction({ id: user.id, kind });
      optimistic();
      startTransition(async () => {
        try {
          await task();
        } catch {
          rollback?.();
        } finally {
          setPendingAction(null);
        }
      });
    },
    [],
  );

  const perform = useCallback(
    (kind: ActionKind, user: UserRowData) => {
      if (kind === "approve") {
        run(
          "approve",
          user,
          () => {
            setPendingUsers((p) => p.filter((u) => u.id !== user.id));
            setActiveUsers((a) => [...a, { ...user, role: "user" }]);
          },
          async () => {
            await form(approveUserAction, user.id);
            toast.success(`Approved ${user.email}`);
          },
          () => {
            setActiveUsers((a) => a.filter((u) => u.id !== user.id));
            setPendingUsers((p) => [...p, user]);
            toast.error(`Failed to approve ${user.email}`);
          },
        );
      } else if (kind === "deny") {
        const snapshot = pendingUsers;
        run(
          "deny",
          user,
          () => setPendingUsers((p) => p.filter((u) => u.id !== user.id)),
          async () => {
            await form(denyUserAction, user.id);
            toast.success(`Denied ${user.email}`);
          },
          () => {
            setPendingUsers(snapshot);
            toast.error(`Failed to deny ${user.email}`);
          },
        );
      } else if (kind === "role") {
        const next = user.role === "admin" ? "user" : "admin";
        const snapshot = activeUsers;
        run(
          "role",
          user,
          () =>
            setActiveUsers((a) =>
              a.map((u) => (u.id === user.id ? { ...u, role: next } : u)),
            ),
          async () => {
            await form(setUserRoleAction, user.id, { role: next });
            toast.success(`Role changed to ${next} for ${user.email}`);
          },
          () => {
            setActiveUsers(snapshot);
            toast.error(`Failed to change role for ${user.email}`);
          },
        );
      } else if (kind === "delete") {
        const isPending = !user.role;
        if (isPending) {
          const snap = pendingUsers;
          run(
            "delete",
            user,
            () => setPendingUsers((p) => p.filter((u) => u.id !== user.id)),
            async () => {
              await form(deleteUserAction, user.id);
              toast.success(`Deleted ${user.email}`);
            },
            () => {
              setPendingUsers(snap);
              toast.error(`Failed to delete ${user.email}`);
            },
          );
        } else {
          const snap = activeUsers;
          run(
            "delete",
            user,
            () => setActiveUsers((a) => a.filter((u) => u.id !== user.id)),
            async () => {
              await form(deleteUserAction, user.id);
              toast.success(`Deleted ${user.email}`);
            },
            () => {
              setActiveUsers(snap);
              toast.error(`Failed to delete ${user.email}`);
            },
          );
        }
      }
    },
    [activeUsers, pendingUsers, form, run],
  );

  const initialsOf = (user: UserRowData) =>
    (user.name || user.email || "?")
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  const isBusy = (user: UserRowData, kind: ActionKind) =>
    pendingAction?.id === user.id && pendingAction.kind === kind;

  const openConfirm = (kind: ActionKind, user: UserRowData) =>
    setConfirm({ kind, user });

  const confirmMeta: Record<
    ActionKind,
    {
      title: string;
      description: (u: UserRowData) => React.ReactNode;
      cta: string;
      destructive?: boolean;
    }
  > = {
    approve: {
      title: "Approve User",
      description: (u) => (
        <>
          Allow <b>{u.email}</b> to access the application.
        </>
      ),
      cta: "Approve",
    },
    deny: {
      title: "Deny User",
      description: (u) => (
        <>
          Remove the pending request for <b>{u.email}</b>.
        </>
      ),
      cta: "Deny",
      destructive: true,
    },
    delete: {
      title: "Delete User",
      description: (u) => (
        <>
          This will permanently delete <b>{u.email}</b>. This action cannot be
          undone.
        </>
      ),
      cta: "Delete",
      destructive: true,
    },
    role: {
      title: "Change Role",
      description: (u) => (
        <>
          Change role for <b>{u.email}</b> from <b>{u.role}</b> to{" "}
          <b>{u.role === "admin" ? "user" : "admin"}</b>.
        </>
      ),
      cta: "Change Role",
      destructive: true,
    },
  };

  const PendingRows = useMemo(
    () =>
      pendingUsers.map((user) => {
        return (
          <TableRow key={user.id}>
            <TableCell>
              <Avatar className="h-8 w-8">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name || user.email} />
                )}
                <AvatarFallback>{initialsOf(user) || "?"}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell className="font-medium">{user.name || "—"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="text-right flex gap-2 justify-end">
              <ActionButton
                pending={isBusy(user, "approve")}
                onClick={() => openConfirm("approve", user)}
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Check className="h-4 w-4" />
              </ActionButton>
              <ActionButton
                pending={isBusy(user, "deny")}
                onClick={() => openConfirm("deny", user)}
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </ActionButton>
            </TableCell>
          </TableRow>
        );
      }),
    [pendingUsers, pendingAction],
  );

  const ActiveRows = useMemo(
    () =>
      activeUsers.map((user) => {
        return (
          <TableRow key={user.id}>
            <TableCell>
              <Avatar className="h-8 w-8">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name || user.email} />
                )}
                <AvatarFallback>{initialsOf(user) || "?"}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell className="font-medium">{user.name || "—"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
            <TableCell className="text-right flex gap-2 justify-end">
              <ActionButton
                pending={isBusy(user, "role")}
                onClick={() => openConfirm("role", user)}
                className="text-primary hover:text-primary"
              >
                <Shield className="h-4 w-4" />
              </ActionButton>
              <ActionButton
                pending={isBusy(user, "delete")}
                onClick={() => openConfirm("delete", user)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </ActionButton>
            </TableCell>
          </TableRow>
        );
      }),
    [activeUsers, pendingAction],
  );

  return (
    <div className="w-full space-y-10">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground mb-2">
          Pending Users
        </h2>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length ? (
                PendingRows
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-sm">
                    No pending users
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground mb-2">
          Users
        </h2>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.length ? (
                ActiveRows
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-sm">
                    No active users
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          {confirm &&
            (() => {
              const meta = confirmMeta[confirm.kind];
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{meta.title}</DialogTitle>
                    <DialogDescription>
                      {meta.description(confirm.user)}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant={meta.destructive ? "destructive" : "default"}
                      disabled={pendingAction?.id === confirm.user.id}
                      aria-busy={pendingAction?.id === confirm.user.id}
                      onClick={() => {
                        perform(confirm.kind, confirm.user);
                        setConfirm(null);
                      }}
                    >
                      {meta.cta}
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
