import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Clock, ArrowRight, X } from "lucide-react";
import { cn } from "@/frontend/shared/utils";
import usePostTask from "@/frontend/hooks/usePostTask";
import { Popover, PopoverContent, PopoverTrigger } from "@/frontend/components/ui/popover";
import { DateTimePicker, formatDateLabel } from "@/frontend/components/task/DateTimePicker";

function StaticCheckbox() {
  return (
    <div className="w-5 h-5 shrink-0 rounded-sm border-2 border-neutral-300 bg-white" />
  );
}

export function NewTaskFormBar() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewingDescription, setIsPreviewingDescription] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [dueTimeStart, setDueTimeStart] = useState<string | undefined>(undefined);
  const [dueTimeEnd, setDueTimeEnd] = useState<string | undefined>(undefined);
  const [prazoOpen, setPrazoOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const { mutate } = usePostTask();

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => descriptionRef.current?.focus(), 0);
      }
    },
    [],
  );

  const handleDescriptionBlur = useCallback(() => {
    if (description.trim()) setIsPreviewingDescription(true);
  }, [description]);

  const handleDescriptionFocus = useCallback(() => {
    setIsPreviewingDescription(false);
  }, []);

  const handleDescriptionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Backspace" && description === "") {
        setIsExpanded(false);
        setIsPreviewingDescription(false);
        setTimeout(() => titleRef.current?.focus(), 0);
      }
    },
    [description],
  );

  const buildDateWithTime = useCallback(
    (base: Date, time: string | undefined): Date => {
      const d = new Date(base);
      if (time) {
        const [h, m] = time.split(":").map(Number);
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(0, 0, 0, 0);
      }
      return d;
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;
    const dueDateStart = dueDate ? buildDateWithTime(dueDate, dueTimeStart) : undefined;
    const dueDateEnd = dueDate && dueTimeEnd ? buildDateWithTime(dueDate, dueTimeEnd) : undefined;
    mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDateStart,
      dueDateEnd,
      status: "to-do",
    });
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setDueTimeStart(undefined);
    setDueTimeEnd(undefined);
    setIsExpanded(false);
    setIsPreviewingDescription(false);
    titleRef.current?.focus();
  }, [title, description, dueDate, dueTimeStart, dueTimeEnd, buildDateWithTime, mutate]);

  const clearPrazo = useCallback(() => {
    setDueDate(undefined);
    setDueTimeStart(undefined);
    setDueTimeEnd(undefined);
  }, []);

  const prazoLabel = dueDate ? formatDateLabel(dueDate, dueTimeStart) : "Definir prazo";
  const hasPrazo = !!dueDate;

  const PrazoButton = (
    <Popover open={prazoOpen} onOpenChange={setPrazoOpen}>
      <div className="inline-flex items-center">
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors",
              hasPrazo
                ? "rounded-l rounded-r-none border-neutral-600 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border-r-0"
                : "rounded border-neutral-300 text-neutral-500 bg-white hover:bg-neutral-50",
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {prazoLabel}
          </button>
        </PopoverTrigger>
        {hasPrazo && (
          <button
            type="button"
            onClick={clearPrazo}
            className="inline-flex items-center h-[30px] px-1.5 border border-neutral-600 rounded-r text-neutral-400 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-3" align="start">
        <DateTimePicker
          date={dueDate}
          timeStart={dueTimeStart}
          timeEnd={dueTimeEnd}
          onDateChange={setDueDate}
          onTimeStartChange={setDueTimeStart}
          onTimeEndChange={setDueTimeEnd}
        />
      </PopoverContent>
    </Popover>
  );

  if (isExpanded) {
    return (
      <div className="w-full rounded-2xl border border-neutral-300 bg-white shadow-sm">
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          <StaticCheckbox />
          <div className="flex-1 min-w-0">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nova tarefa"
              className="w-full text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
            />
            <div className="mt-2 min-h-[80px]">
              {isPreviewingDescription ? (
                <div
                  className="text-sm text-neutral-600 cursor-text prose prose-sm max-w-none"
                  onClick={handleDescriptionFocus}
                >
                  <ReactMarkdown>{description}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  onKeyDown={handleDescriptionKeyDown}
                  placeholder="Pesquisar a respeito"
                  rows={3}
                  className="w-full text-sm text-neutral-500 placeholder:text-neutral-400 outline-none bg-transparent resize-none"
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-1 border-t border-neutral-100">
          {PrazoButton}
          <button
            type="button"
            onClick={handleSubmit}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              title.trim()
                ? "bg-neutral-900 text-white hover:bg-neutral-700"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed",
            )}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-full border border-neutral-300 bg-white shadow-sm flex items-center px-3 py-2 gap-2">
      <StaticCheckbox />
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Nova tarefa"
        className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent min-w-0"
      />
      {PrazoButton}
      <span className="hidden md:block shrink-0 text-xs text-neutral-400 whitespace-nowrap px-2">
        Shift + Enter para adicionar descrição
      </span>
      <button
        type="button"
        onClick={handleSubmit}
        className={cn(
          "flex shrink-0 h-8 w-8 items-center justify-center rounded-full transition-colors",
          title.trim()
            ? "bg-neutral-900 text-white hover:bg-neutral-700"
            : "bg-neutral-200 text-neutral-400 cursor-not-allowed",
        )}
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
