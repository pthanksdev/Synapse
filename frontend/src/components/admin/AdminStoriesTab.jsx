import { Button } from "../ui/button";

export function AdminStoriesTab({ stories, handleDeleteStory }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {stories.map((s) => (
        <div key={s._id} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-border group bg-black">
          {s.type === "text" ? (
            <div className={`size-full bg-gradient-to-br ${s.bgColor || "from-indigo-600 via-purple-600 to-pink-600"} flex items-center justify-center p-3 text-center`}>
              <p className="text-white text-xs font-bold line-clamp-4 drop-shadow">{s.text}</p>
            </div>
          ) : (
            <img src={s.mediaUrl} alt="" className="size-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-2 flex flex-col justify-between">
            <span className="text-[10px] text-white font-bold">{s.userId?.fullName}</span>
            <Button
              variant="destructive"
              size="sm"
              className="w-full text-xs h-7"
              onClick={() => handleDeleteStory(s._id)}
            >
              Delete Story
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
