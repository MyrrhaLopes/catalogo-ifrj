import { Loader2 } from "lucide-react";
import { PageShell } from "./PageShell";

export function PageLoading() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center h-64 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    </PageShell>
  );
}
