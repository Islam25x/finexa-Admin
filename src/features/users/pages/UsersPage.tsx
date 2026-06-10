import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import AdminLayout from "../../../shared/layout/AdminLayout";
import { Button, Input, PageHeader, cn } from "../../../shared/ui";
import { useUserAction, useUserDetail, useUsers } from "../hooks/useUsers";
import type { AdminUser, UserAction, UsersListParams } from "../types/users.types";
import { ActionMenuPortal } from "../components/ActionMenuPortal";
import { ActionReasonModal } from "../components/ActionReasonModal";

const pageSize = 10;
const panelClass = "rounded-lg border border-border bg-surface shadow-md";
const emptyClass = "p-6 text-text-secondary";
const tableCellClass = "whitespace-nowrap border-b border-border px-[18px] py-4 text-left text-sm text-text-primary";
const tableHeadClass = "whitespace-nowrap border-b border-border px-[18px] py-4 text-left text-xs font-semibold uppercase text-text-secondary";
const statusClasses: Record<AdminUser["status"], string> = {
  active: "bg-primary/10 text-primary",
  inactive: "bg-text-muted/10 text-text-secondary",
  locked: "bg-text-muted/10 text-text-primary",
};

function UserDrawer({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useUserDetail(userId);

  if (!userId) return null;

  return (
    <>
      <button
        className="fixed inset-0 z-40 bg-text-primary/30"
        aria-label="Close user details"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[430px] border-l border-border bg-surface p-6 shadow-md"
        aria-label="User details"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">User Details</h2>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            aria-label="Close user details"
          >
            <X size={20} />
          </Button>
        </div>
        {isLoading ? (
          <p className={emptyClass}>Loading user details...</p>
        ) : null}
        {isError ? <p className={emptyClass}>Unable to load user details.</p> : null}
        {data ? (
          <div className="mt-6 grid gap-3.5">
            {[
              ["Name", data.name],
              ["Email", data.email],
              ["Role", data.role],
              ["Status", data.status],
              ["Created At", data.createdAt],
              ["Last Login", data.lastLoginAt],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-border p-3.5" key={label}>
                <span className="block text-xs text-text-secondary">{label}</span>
                <strong className="mt-1.5 block font-semibold text-text-primary">
                  {value}
                </strong>
              </div>
            ))}
          </div>
        ) : null}
      </aside>
    </>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<UserAction | null>(null);
  const [modalUserId, setModalUserId] = useState<string | null>(null);

  const params = useMemo<UsersListParams>(
    () => ({
      search,
      createdFrom,
      createdTo,
      page,
      pageSize,
    }),
    [createdFrom, createdTo, page, search]
  );

  const { data, isLoading, isError, refetch } = useUsers(params);
  const mutation = useUserAction();
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / (data?.pageSize ?? pageSize))
);

  const handleDrawerOpen = (userId: string) => {
    setOpenMenuUserId(null);
    setSelectedUserId(userId);
  };

  const handleDrawerClose = () => {
    setSelectedUserId(null);
  };

  const handleActionSelect = (action: UserAction, userId: string) => {
    setOpenMenuUserId(null);
    setModalUserId(userId);
    setModalAction(action);
  };

  const handleModalSubmit = (reason: string) => {
    if (!modalUserId || !modalAction) return;

    mutation.mutate(
      { id: modalUserId, action: modalAction, reason },
      {
        onSuccess: () => {
          setModalAction(null);
          setModalUserId(null);
        },
      }
    );
  };

  const handleModalClose = () => {
    setModalAction(null);
    setModalUserId(null);
  };

  return (
    <AdminLayout>
      <div className="grid gap-[18px]">
        <PageHeader
          title="Users"
          subtitle="Search and manage Finexa user accounts."
        />

        <section
          className={cn(
            panelClass,
            "grid gap-3.5 p-[18px] md:grid-cols-[minmax(220px,1fr)_190px_190px] md:items-end"
          )}
          aria-label="User filters"
        >
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-text-secondary"
            />
            <Input
              value={search}
              placeholder="Search users"
              inputClassName="pl-[42px]"
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
            />
          </div>
          <Input
            type="date"
            label="Created From"
            value={createdFrom}
            onChange={(event) => {
              setCreatedFrom(event.currentTarget.value);
              setPage(1);
              setOpenMenuUserId(null);
            }}
          />
          <Input
            type="date"
            label="Created To"
            value={createdTo}
            onChange={(event) => {
              setCreatedTo(event.currentTarget.value);
              setPage(1);
              setOpenMenuUserId(null);
            }}
          />
        </section>

        <section className={cn(panelClass, "overflow-hidden")}>
          {isLoading ? <p className={emptyClass}>Loading users...</p> : null}
          {isError ? (
            <div className={emptyClass}>
              <p>Unable to load users.</p>
              <Button type="button" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : null}
          {data && data.users.length === 0 ? (
            <p className={emptyClass}>No users match these filters.</p>
          ) : null}
          {data && data.users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={tableHeadClass}>User</th>
                    <th className={tableHeadClass}>Role</th>
                    <th className={tableHeadClass}>Status</th>
                    <th className={tableHeadClass}>Created</th>
                    <th className={tableHeadClass}>Last Login</th>
                    <th className={tableHeadClass} aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td className={tableCellClass}>
                        <button
                          type="button"
                          className="flex items-center gap-3 border-0 bg-transparent p-0 text-left"
                          onClick={() => handleDrawerOpen(user.id)}
                        >
                          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <strong className="font-semibold text-text-primary">
                              {user.name}
                            </strong>
                            <br />
                            {user.email}
                          </span>
                        </button>
                      </td>
                      <td className={tableCellClass}>{user.role}</td>
                      <td className={tableCellClass}>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            statusClasses[user.status]
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={tableCellClass}>{user.createdAt}</td>
                      <td className={tableCellClass}>{user.lastLoginAt}</td>
                      <td className={tableCellClass}>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDrawerOpen(user.id)}
                          >
                            Details
                          </Button>
                          <ActionMenuPortal
                            user={user}
                            isLoading={mutation.isPending}
                            isOpen={openMenuUserId === user.id}
                            onActionSelect={(action) =>
                              handleActionSelect(action, user.id)
                            }
                            onOpen={() => setOpenMenuUserId(user.id)}
                            onClose={() => setOpenMenuUserId(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 px-[18px] py-4 text-text-secondary">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        <UserDrawer userId={selectedUserId} onClose={handleDrawerClose} />
        <ActionReasonModal
          open={!!modalAction && !selectedUserId}
          action={modalAction}
          isLoading={mutation.isPending}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
        />
      </div>
    </AdminLayout>
  );
}
