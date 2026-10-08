import { PageShell } from "./PageShell";

export function PageError({ error }: { error: Error }) {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center h-64 text-destructive text-sm">
        {error.message || "Algo deu errado."}
      </div>
    </PageShell>
  );
}
