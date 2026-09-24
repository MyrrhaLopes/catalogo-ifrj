import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, type DayButtonProps } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/frontend/shared/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarDayButton({ modifiers, day: _day, className: _cls, ...props }: DayButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "h-8 w-8 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-300",
        modifiers.selected
          ? "bg-neutral-900 text-white hover:bg-neutral-700"
          : modifiers.today
            ? "font-semibold bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            : modifiers.outside || modifiers.disabled
              ? "text-neutral-300 cursor-default"
              : "text-neutral-700 hover:bg-neutral-100",
      )}
    />
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-3",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center h-7",
        caption_label: "text-sm font-medium capitalize",
        nav: "absolute inset-x-0 top-0 flex justify-between",
        button_previous:
          "h-7 w-7 rounded border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-colors",
        button_next:
          "h-7 w-7 rounded border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-8 h-7 flex items-center justify-center text-[0.75rem] text-neutral-400 font-normal",
        week: "flex mt-1",
        day: "p-0",
        day_button: "",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        DayButton: CalendarDayButton,
        Chevron: ({ orientation }: { orientation?: "left" | "right" | "up" | "down" }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="h-4 w-4 text-neutral-600" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-neutral-600" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
