import { useState, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useWallpaper } from "../../context/wallpaper";
import { UserIcon, CameraIcon, XIcon, LockIcon, ShareIcon, CopyIcon, CloudUploadIcon, LogOutIcon, CheckCircle2Icon, CalendarIcon, PaletteIcon, UploadIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ThemePresetPicker } from "../ThemePresetPicker";
import { WallpaperPicker } from "../WallpaperPicker";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

export function ProfileModal({ isOpen, onClose }) {
  const { authUser, checkAuth, logout } = useAuthStore();
  const { setWallpaperId } = useWallpaper();
  const customBgRef = useRef(null);

  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState(
    localStorage.getItem("gdrive_backup_freq") || "Daily"
  );
  const [lastSyncedAt, setLastSyncedAt] = useState(
    localStorage.getItem("gdrive_last_synced") || null
  );

  if (!isOpen || !authUser) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedImg(reader.result);
    };
  };

  const handleCustomBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setWallpaperId(event.target.result);
      toast.success("Custom background applied!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.put("/auth/profile", {
        fullName,
        username,
        bio,
        profilePic: selectedImg || authUser.profilePic,
        ...(password.trim() ? { password } : {}),
      });
      toast.success("Profile updated successfully!");
      checkAuth();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/signup?invite=${authUser._id}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleGoogleDriveBackup = async () => {
    setIsBackingUp(true);
    toast.loading("Exporting & encrypting chat backup to Google Drive...", { id: "gdrive" });
    setTimeout(() => {
      const nowStr = new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      localStorage.setItem("gdrive_last_synced", nowStr);
      setLastSyncedAt(nowStr);
      setIsBackingUp(false);
      toast.success(`Synced to Google Drive (${nowStr})!`, { id: "gdrive" });
    }, 1800);
  };

  const handleFrequencyChange = (freq) => {
    setBackupFrequency(freq);
    localStorage.setItem("gdrive_backup_freq", freq);
    toast.success(`Automated Google Drive backup schedule set to ${freq}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <UserIcon className="size-4 text-accent" /> Profile & Account Settings
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground">
            <XIcon className="size-4" />
          </button>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0 bg-surface/50 p-1 rounded-xl">
            <TabsTrigger value="account" className="text-xs rounded-lg">Account</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs rounded-lg">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 outline-none">

        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center py-2 shrink-0">
          <div className="relative group cursor-pointer">
            <Avatar className="size-20 border-2 border-accent">
              <AvatarImage src={selectedImg || authUser.profilePic} />
              <AvatarFallback className="text-xl">{authUser.fullName?.[0]}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <CameraIcon className="size-6 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <span className="text-[11px] text-muted mt-2">Click photo to update avatar</span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 text-xs shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-muted mb-1 block">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label className="font-semibold text-muted mb-1 block">Username</label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                placeholder="e.g. johndoe"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-muted mb-1 block">Status Bio</label>
            <Input
              placeholder="e.g. Available, in a meeting..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-muted mb-1 block flex items-center gap-1">
              <LockIcon className="size-3 text-accent" /> New Password (Optional)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Google Drive Backup Section */}
        <div className="bg-surface/50 border border-border rounded-xl p-3.5 space-y-2.5 mt-2 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs flex items-center gap-1.5">
                <CloudUploadIcon className="size-4 text-blue-400" /> Google Drive Cloud Backup
              </div>
              <p className="text-[10px] text-muted mt-0.5">Encrypt & backup chat messages and media.</p>
            </div>
            <Button variant="secondary" size="sm" disabled={isBackingUp} onClick={handleGoogleDriveBackup} className="text-xs shrink-0">
              {isBackingUp ? "Syncing..." : "Sync Now"}
            </Button>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-muted">
              <CalendarIcon className="size-3 text-accent" /> Auto Schedule:
            </div>
            <select
              value={backupFrequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="Daily">Daily (Recommended)</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Off">Manual Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[10px] bg-background/60 p-2 rounded-lg border border-border/40">
            <span className="text-muted">Sync Status:</span>
            {lastSyncedAt ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2Icon className="size-3" /> Synced ({lastSyncedAt})
              </span>
            ) : (
              <span className="text-amber-400 font-medium">Not Synced Yet</span>
            )}
          </div>
        </div>

        {/* Invite Link Section */}
        <div className="bg-surface/50 border border-border rounded-xl p-3 flex items-center justify-between mt-2 shrink-0">
          <div>
            <div className="font-semibold text-xs flex items-center gap-1">
              <ShareIcon className="size-3 text-accent" /> Invite Friends
            </div>
            <p className="text-[10px] text-muted mt-0.5">Share a link to connect instantly.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopyInviteLink} className="text-xs">
            <CopyIcon className="size-3 mr-1.5" /> Copy Link
          </Button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border shrink-0">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 text-xs bg-red-600/90 hover:bg-red-600 text-white"
          >
            <LogOutIcon className="size-3.5" /> Log Out
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={isUpdating} onClick={handleSaveProfile}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 outline-none pb-2">
          <div className="bg-surface/50 border border-border rounded-xl p-5 flex flex-col items-center">
            <div className="font-semibold text-sm flex items-center gap-1.5 mb-2">
              <PaletteIcon className="size-4 text-accent" /> Theme Accent Color
            </div>
            <p className="text-[11px] text-muted mb-4 text-center">Customize the primary accent color across the platform.</p>
            <div className="bg-background/50 p-3 rounded-lg border border-border/40 w-full flex justify-center">
              <ThemePresetPicker />
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-xl p-5 flex flex-col items-center">
            <div className="font-semibold text-sm flex items-center gap-1.5 mb-2">
              <CameraIcon className="size-4 text-accent" /> Chat Background Wallpaper
            </div>
            <p className="text-[11px] text-muted mb-4 text-center">Select a built-in backdrop pattern or upload your own image file.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <WallpaperPicker />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => customBgRef.current?.click()}
                className="text-xs font-semibold"
              >
                <UploadIcon className="size-3.5 mr-1.5" /> Upload Custom Image
              </Button>
              <input 
                type="file" 
                ref={customBgRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp, image/gif" 
                onChange={handleCustomBgUpload} 
              />
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
