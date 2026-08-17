import { CheckCircleIcon } from "lucide-react";
import { Button } from "../ui/button";

export function AdminReportsTab({ reports, handleToggleSuspend, handleResolveReport }) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <CheckCircleIcon className="size-10 text-emerald-500 mx-auto opacity-80" />
        <p className="text-sm font-medium">No active chat violation reports!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report._id}
          className="flex items-center justify-between p-4 rounded-xl border border-border bg-background text-xs"
        >
          <div>
            <span className="font-bold text-red-400">Violation Report: </span>
            <span className="text-foreground">{report.reportReason}</span>
            <p className="text-muted mt-1 italic">"{report.text}"</p>
          </div>
          <div className="space-x-2">
            <Button variant="destructive" size="sm" onClick={() => handleToggleSuspend(report.senderId?._id)}>
              Suspend Sender
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleResolveReport(report._id)}>
              Dismiss Report
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
