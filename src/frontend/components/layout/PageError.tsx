import { PageShell } from "./PageShell";

export function PageError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : undefined;
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center h-64 text-destructive text-sm">
        {message || "Algo deu errado."}
      </div>
    </PageShell>
  );
}
