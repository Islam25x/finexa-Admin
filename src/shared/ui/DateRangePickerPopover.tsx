import { CalendarDays, ChevronDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Button from "./Button";
import { cn } from "./index";

interface DateRangePickerPopoverProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateRangeDisplay(from: Date, to: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(from) + " - " + new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(to);
}

export default function DateRangePickerPopover({
  from,
  to,
  onChange,
}: DateRangePickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState(formatDateForInput(from));
  const [tempTo, setTempTo] = useState(formatDateForInput(to));
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleApply = () => {
    try {
      const newFrom = new Date(tempFrom);
      const newTo = new Date(tempTo);

      if (!isNaN(newFrom.getTime()) && !isNaN(newTo.getTime())) {
        onChange(newFrom, newTo);
        setIsOpen(false);
      }
    } catch {
      // Silently fail if dates are invalid
    }
  };

  const handleCancel = () => {
    setTempFrom(formatDateForInput(from));
    setTempTo(formatDateForInput(to));
    setIsOpen(false);
  };

  return (
    <div ref={popoverRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "inline-flex w-fit items-center gap-3.5 rounded-lg border border-border bg-surface px-[18px] py-3 font-semibold text-text-primary transition hover:border-primary/60 hover:bg-surface/80",
          isOpen && "border-primary/60 bg-surface/80"
        )}
      >
        <CalendarDays size={22} className="text-primary" />
        <span>{formatDateRangeDisplay(from, to)}</span>
        <ChevronDown
          size={18}
          className={`text-primary transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-3 rounded-lg border border-border bg-surface p-4 shadow-lg"
          role="dialog"
          aria-label="Date range picker"
        >
          <div className="space-y-4 min-w-[320px]">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                From
              </label>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                To
              </label>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleApply}
                className="flex-1"
              >
                Apply
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
