import { ActivityIcon, BanIcon, FilmIcon, MessageSquareIcon, ShieldAlertIcon, UsersIcon } from "lucide-react";

export function AdminOverviewTab({ stats, logs }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <UsersIcon className="size-4 text-blue-500" /> Users
          </div>
          <p className="text-2xl font-black">{stats.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <MessageSquareIcon className="size-4 text-green-500" /> Messages
          </div>
          <p className="text-2xl font-black">{stats.totalMessages}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <UsersIcon className="size-4 text-purple-500" /> Groups
          </div>
          <p className="text-2xl font-black">{stats.totalGroups}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <FilmIcon className="size-4 text-pink-500" /> 24h Stories
          </div>
          <p className="text-2xl font-black">{stats.totalStories}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <ShieldAlertIcon className="size-4 text-red-500" /> Reports
          </div>
          <p className="text-2xl font-black text-red-500">{stats.activeReports}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <BanIcon className="size-4 text-amber-500" /> Suspended
          </div>
          <p className="text-2xl font-black">{stats.suspendedUsers}</p>
        </div>
      </div>

      {/* Audit Logs Trail */}
      <div className="rounded-2xl border border-border bg-surface/20 p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <ActivityIcon className="size-4 text-accent" /> Security Audit Log Stream (MongoDB Archive)
        </h2>
        <div className="max-h-64 overflow-y-auto space-y-1.5 text-xs font-mono">
          {logs.length === 0 ? (
            <p className="text-muted py-4 text-center font-sans">No security events logged yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="p-2 rounded-lg border border-border/50 bg-background flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-accent">[{log.action}]</span>{" "}
                  <span className="text-foreground">{log.details}</span>
                </div>
                <span className="text-[10px] text-muted">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
