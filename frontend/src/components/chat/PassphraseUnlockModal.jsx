import { useState } from "react";
import { KeyIcon, LockIcon, XIcon } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function PassphraseUnlockModal({ isOpen, messageId, onClose, onUnlocked }) {
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async () => {
    if (!passphrase.trim()) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.post(`/messages/${messageId}/unlock`, { passphrase });
      toast.success("Message decrypted!");
      onUnlocked(res.data.decryptedText);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Incorrect 3-word passphrase");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <LockIcon className="size-4 text-accent" /> Unlock Encrypted Message
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-surface text-muted hover:text-foreground">
            <XIcon className="size-4" />
          </button>
        </div>

        <p className="text-xs text-muted">
          This message is protected with a 3-word secret key. Enter the key to decrypt its contents.
        </p>

        <div className="space-y-2">
          <Input
            placeholder="e.g. apple-falcon-sun"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            className="w-full"
          />
        </div>

        <Button
          variant="primary"
          disabled={!passphrase.trim() || isLoading}
          onClick={handleUnlock}
          className="w-full font-semibold"
        >
          <KeyIcon className="size-4 mr-2" /> {isLoading ? "Decrypting..." : "Unlock Message"}
        </Button>
      </div>
    </div>
  );
}
