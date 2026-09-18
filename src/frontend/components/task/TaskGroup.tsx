import { useRef, useState, useEffect } from "react";
import { TaskCard } from "@/frontend/components/task/TaskCard";
import { cn } from "@/frontend/shared/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  dueDateStart?: string | null;
  dueDateEnd?: string | null;
}

interface TaskGroupProps {
  label: string;
  tasks?: Task[];
  showSeeMore?: boolean;
  variant?: "grid" | "time";
  columns?: { time: string; tasks: Task[] }[];
}

const CARD_COLUMN_WIDTH = 208; // w-52, shared between grid and time columns
const SECTION_CONTENT_HEIGHT = 288; // matches design reference

function GridTaskGroup({ label, tasks, showSeeMore }: { label: string; tasks: Task[]; showSeeMore?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [maskLeft, setMaskLeft] = useState(false);
  const [maskRight, setMaskRight] = useState(false);

  const checkMasks = () => {
    const el = scrollRef.current;
    if (!el) return;
    setMaskLeft(el.scrollLeft > 8);
    setMaskRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    checkMasks();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkMasks);
    window.addEventListener("resize", checkMasks);
    return () => {
      el?.removeEventListener("scroll", checkMasks);
      window.removeEventListener("resize", checkMasks);
    };
  }, [tasks]);

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-baseline gap-2 px-4 py-3 border-b border-neutral-100">
        <h2 className="text-2xl font-bold text-neutral-900">{label}</h2>
        <span className="text-sm text-neutral-500">{tasks.length} tarefas</span>
        {showSeeMore && (
          <button type="button" className="ml-1 text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700">
            Ver mais
          </button>
        )}
      </div>

      <div className="relative py-3 px-4">
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-10 z-10 pointer-events-none transition-opacity duration-200 bg-gradient-to-r from-white to-transparent",
            maskLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-10 z-10 pointer-events-none transition-opacity duration-200 bg-gradient-to-l from-white to-transparent",
            maskRight ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* flex-direction: column + flex-wrap: wrap fills tasks downward first,
              then overflows into new columns to the right when height is exceeded */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              alignContent: "flex-start",
              height: `${SECTION_CONTENT_HEIGHT}px`,
              gap: "8px",
            }}
          >
            {tasks.map((task) => (
              <div key={task.id} style={{ width: `${CARD_COLUMN_WIDTH}px`, flexShrink: 0 }}>
                <TaskCard
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  completed={task.completed}
                  dueDateStart={task.dueDateStart}
                  dueDateEnd={task.dueDateEnd}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeColumn({ col, isFirst }: { col: { time: string; tasks: Task[] }; isFirst: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [maskBottom, setMaskBottom] = useState(false);

  const checkMask = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight + 2;
    const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 8;
    setMaskBottom(isScrollable && !atBottom);
  };

  useEffect(() => {
    checkMask();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkMask);
    window.addEventListener("resize", checkMask);
    return () => {
      el?.removeEventListener("scroll", checkMask);
      window.removeEventListener("resize", checkMask);
    };
  }, [col.tasks]);

  return (
    <div
      className={cn(
        "shrink-0 border-r border-neutral-200",
        isFirst && "border-l border-neutral-200",
      )}
      style={{ width: `${CARD_COLUMN_WIDTH}px` }}
    >
      <div className="py-2 px-3 text-center text-sm font-semibold text-neutral-700 border-b border-neutral-200">
        {col.time}
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-y-auto"
          style={{
            minHeight: `${SECTION_CONTENT_HEIGHT}px`,
            maxHeight: `${SECTION_CONTENT_HEIGHT}px`,
            scrollbarWidth: "none",
          }}
        >
          <div className="flex flex-col gap-2 p-3 pb-10">
            {col.tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                completed={task.completed}
                dueDateStart={task.dueDateStart}
                dueDateEnd={task.dueDateEnd}
              />
            ))}
          </div>
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-14 pointer-events-none transition-opacity duration-200 bg-gradient-to-t from-white to-transparent",
            maskBottom ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}

function TimeColumnGroup({ label, columns = [], showSeeMore }: Omit<TaskGroupProps, "variant">) {
  const scrollXRef = useRef<HTMLDivElement>(null);
  const [maskLeft, setMaskLeft] = useState(false);
  const [maskRight, setMaskRight] = useState(false);

  const checkMasks = () => {
    const el = scrollXRef.current;
    if (!el) return;
    setMaskLeft(el.scrollLeft > 8);
    setMaskRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    checkMasks();
    const el = scrollXRef.current;
    el?.addEventListener("scroll", checkMasks);
    window.addEventListener("resize", checkMasks);
    return () => {
      el?.removeEventListener("scroll", checkMasks);
      window.removeEventListener("resize", checkMasks);
    };
  }, [columns]);

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-baseline gap-2 px-4 py-3 border-b border-neutral-100">
        <h2 className="text-2xl font-bold text-neutral-900">{label}</h2>
        <span className="text-sm text-neutral-500">{totalTasks} tarefas</span>
        {showSeeMore && (
          <button type="button" className="ml-1 text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-700">
            Ver mais
          </button>
        )}
      </div>

      <div className="relative">
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-12 z-10 pointer-events-none transition-opacity duration-200 bg-gradient-to-r from-white to-transparent",
            maskLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-12 z-10 pointer-events-none transition-opacity duration-200 bg-gradient-to-l from-white to-transparent",
            maskRight ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollXRef}
          className="overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex min-w-fit">
            {columns.map((col, colIdx) => (
              <TimeColumn key={col.time} col={col} isFirst={colIdx === 0} />
            ))}
            <div style={{ width: `${CARD_COLUMN_WIDTH}px` }} className="shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TaskGroup(props: TaskGroupProps) {
  if (props.variant === "time") {
    return <TimeColumnGroup {...props} />;
  }
  return <GridTaskGroup {...props} tasks={props.tasks ?? []} />;
}
