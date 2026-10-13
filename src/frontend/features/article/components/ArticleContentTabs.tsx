import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArticleSectionRenderer } from "./ArticleSectionRenderer";

type Tab = "article" | "attributes";

type Props = {
  hasLeft: boolean;
  hasCenter: boolean;
  hasRight: boolean;
};

export function ArticleContentTabs({ hasLeft, hasCenter, hasRight }: Props) {
  const [tab, setTab] = useState<Tab>("article");
  const showTabs = hasCenter && hasRight;

  return (
    <>
      {hasLeft && (
        <aside className="hidden lg:block lg:sticky lg:top-6 lg:w-44 lg:shrink-0 lg:self-start tv:w-56">
          <ArticleSectionRenderer sectionKey="left" />
        </aside>
      )}

      <div className="flex min-w-0 flex-col gap-4 lg:flex-1 lg:flex-row lg:items-start lg:gap-10">
        {showTabs && (
          <div className="flex gap-2 lg:hidden">
            <TabButton active={tab === "article"} onClick={() => setTab("article")}>
              Artigo
            </TabButton>
            <TabButton active={tab === "attributes"} onClick={() => setTab("attributes")}>
              Atributos
            </TabButton>
          </div>
        )}

        {hasCenter && (
          <article className={cn("min-w-0 lg:flex-1", showTabs && tab !== "article" && "hidden lg:block")}>
            {hasLeft && (
              <div className="mb-4 lg:hidden">
                <ArticleSectionRenderer sectionKey="left" />
              </div>
            )}
            <ArticleSectionRenderer sectionKey="center" />
          </article>
        )}

        {hasRight && (
          <aside
            className={cn(
              "lg:sticky lg:top-6 lg:w-52 lg:shrink-0 lg:self-start tv:w-64",
              showTabs && tab !== "attributes" && "hidden lg:block",
            )}
          >
            <ArticleSectionRenderer sectionKey="right" />
          </aside>
        )}
      </div>
    </>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-green-600 bg-green-50 text-green-700"
          : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300",
      )}
    >
      {children}
    </button>
  );
}
