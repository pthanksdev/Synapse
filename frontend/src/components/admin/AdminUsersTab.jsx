import { BanIcon, CheckCircleIcon, SearchIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AdminUsersTab({
  users,
  userSearch,
  setUserSearch,
  handleToggleRole,
  handleToggleSuspend,
  handleDeleteUser,
}) {
  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted" />
          <Input
            placeholder="Search user name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface/20 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-surface/60 font-semibold text-muted uppercase">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-surface/40 transition">
                <td className="p-3 flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarImage src={u.profilePic} />
                    <AvatarFallback>{u.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">{u.fullName}</span>
                </td>
                <td className="p-3 text-muted">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.role === "admin"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                        : "bg-surface text-muted"
                    }`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  {u.isSuspended ? (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <BanIcon className="size-3" /> Suspended
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircleIcon className="size-3" /> Active
                    </span>
                  )}
                </td>
                <td className="p-3 text-right space-x-1.5">
                  <Button variant="outline" size="sm" onClick={() => handleToggleRole(u._id)}>
                    <ShieldCheckIcon className="size-3 mr-1" /> {u.role === "admin" ? "Demote" : "Promote"}
                  </Button>
                  <Button
                    variant={u.isSuspended ? "default" : "destructive"}
                    size="sm"
                    onClick={() => handleToggleSuspend(u._id)}
                  >
                    <BanIcon className="size-3 mr-1" /> {u.isSuspended ? "Unsuspend" : "Suspend"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteUser(u._id)}>
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
