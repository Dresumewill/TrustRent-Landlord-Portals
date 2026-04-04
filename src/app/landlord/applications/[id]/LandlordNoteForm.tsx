"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveLandlordNote } from "@/app/actions/applications";

export function LandlordNoteForm({
  applicationId,
  initialNote,
}: {
  applicationId: string;
  initialNote: string | null;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");

    const result = await saveLandlordNote(applicationId, note);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-2">
      <textarea
        rows={3}
        placeholder="Add a private note about this applicant (only you can see this)…"
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false); }}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {saved && <p className="text-xs text-emerald-600 font-medium">✓ Note saved.</p>}
      <div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={loading}
        >
          {loading ? "Saving…" : "Save Note"}
        </Button>
      </div>
    </form>
  );
}
