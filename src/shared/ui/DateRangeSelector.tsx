/* eslint-disable react-refresh/only-export-components */
import { ChevronDown } from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Text from "./Text";

export type DateRangeValue = "Today" | "Week" | "Month" | "Year" | "Custom";

export const DASHBOARD_PERIOD_STORAGE_KEY = "dashboard_period";

type DateRangeContextValue = {
  selectedRange: DateRangeValue;
  setSelectedRange: (value: DateRangeValue) => void;
};

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

function readStoredRange(): DateRangeValue {
  if (typeof window === "undefined") {
    return "Month";
  }

  const storedValue = window.localStorage.getItem(DASHBOARD_PERIOD_STORAGE_KEY);
  switch (storedValue) {
    case "Today":
    case "Week":
    case "Month":
    case "Year":
    case "Custom":
      return storedValue;
    default:
      return "Month";
  }
}

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRange, setSelectedRange] = useState<DateRangeValue>(() => readStoredRange());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DASHBOARD_PERIOD_STORAGE_KEY, selectedRange);
  }, [selectedRange]);

  const value = useMemo(
    () => ({ selectedRange, setSelectedRange }),
    [selectedRange],
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("DateRangeSelector must be used within DateRangeProvider");
  }
  return context;
};

const buildRangeOptions = () => {
  const now = new Date();
  const formatLong = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  const formatShort = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return [
    { value: "Today", label: "Today", range: formatLong(now) },
    { value: "Week", label: "Week", range: `${formatShort(startOfWeek)} - Now` },
    { value: "Month", label: "Month", range: `${formatShort(startOfMonth)} - Now` },
    { value: "Year", label: "Year", range: `${formatShort(startOfYear)} - Now` },
  ] as const;
};

const DateRangeSelector = () => {
  const { selectedRange, setSelectedRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement | null>(null);

  const rangeOptions = useMemo(() => buildRangeOptions(), []);
  const activeRange = rangeOptions.find((option) => option.value === selectedRange);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!rangeRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={rangeRef}
      className="relative z-50"
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-3 rounded-3xl border border-gray-300 bg-white/80 px-4 py-2 text-left shadow-sm transition hover:border-primary/60 hover:bg-white"
      >
        <div className="flex flex-col leading-tight">
          <Text as="span" variant="body" weight="medium" className="text-slate-900">
            {activeRange?.label ?? "Month"}
          </Text>
          <Text as="span" variant="caption" className="text-slate-500">
            {activeRange?.range ?? "Month"}
          </Text>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {rangeOptions.map((option) => {
            const isActive = option.value === selectedRange;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedRange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left transition ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-slate-500">{option.range}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
