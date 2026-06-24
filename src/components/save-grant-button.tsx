import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSavedGrants, toggleSavedGrant } from "@/lib/saved-grants.functions";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { pendoTrack } from "@/lib/pendo";

export function SaveGrantButton({ grantId, variant = "outline" }: { grantId: string; variant?: "outline" | "ghost" }) {
  const listFn = useServerFn(listSavedGrants);
  const toggleFn = useServerFn(toggleSavedGrant);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["saved-grants"], queryFn: () => listFn() });
  const isSaved = data.some((r: any) => r.grant_id === grantId);
  const mut = useMutation({
    mutationFn: () => toggleFn({ data: { grant_id: grantId } }),
    onSuccess: () => {
      pendoTrack("grant_save_toggled", {
        grant_id: grantId,
        action: isSaved ? "unsaved" : "saved",
      });
      qc.invalidateQueries({ queryKey: ["saved-grants"] });
    },
  });
  return (
    <Button
      size="sm"
      variant={variant}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        mut.mutate();
      }}
      disabled={mut.isPending}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="mr-2 h-4 w-4" /> Saved
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" /> Save
        </>
      )}
    </Button>
  );
}