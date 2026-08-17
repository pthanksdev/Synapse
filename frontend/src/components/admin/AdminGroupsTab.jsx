import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export function AdminGroupsTab({ groups, handleDisbandGroup }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div key={g._id} className="p-4 rounded-2xl border border-border bg-background flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="size-12 border border-accent">
              <AvatarImage src={g.avatar} />
              <AvatarFallback>{g.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-base">{g.name}</h3>
              <p className="text-xs text-muted">{g.description || "No description"}</p>
              <div className="mt-2 text-[11px] text-accent font-semibold">
                Members: {g.memberIds?.length || 0} users
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => handleDisbandGroup(g._id)}>
            Disband Group
          </Button>
        </div>
      ))}
    </div>
  );
}
