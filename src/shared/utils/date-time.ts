const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DATE_TIME_WITHOUT_ZONE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

const HAS_EXPLICIT_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:\d{2})$/i;

export const CAIRO_TIME_ZONE = "Africa/Cairo";

type CairoDateTimeParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

function buildUtcDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
): Date | null {
  const candidate = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds,
      milliseconds,
    ),
  );

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day ||
    candidate.getUTCHours() !== hours ||
    candidate.getUTCMinutes() !== minutes ||
    candidate.getUTCSeconds() !== seconds ||
    candidate.getUTCMilliseconds() !== milliseconds
  ) {
    return null;
  }

  return candidate;
}

function buildLocalDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
): Date | null {
  const candidate = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds,
    milliseconds,
  );

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day ||
    candidate.getHours() !== hours ||
    candidate.getMinutes() !== minutes ||
    candidate.getSeconds() !== seconds ||
    candidate.getMilliseconds() !== milliseconds
  ) {
    return null;
  }

  return candidate;
}

function padNumber(value: number): string {
  return `${value}`.padStart(2, "0");
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

function parseDateParts(
  value: string,
  pattern: RegExp,
): RegExpMatchArray | null {
  return value.match(pattern);
}

export function isDateOnlyValue(value: string): boolean {
  return DATE_ONLY_PATTERN.test(value.trim());
}

export function hasExplicitTimezone(value: string): boolean {
  return HAS_EXPLICIT_TIMEZONE_PATTERN.test(value.trim());
}

function getCairoPartsFormatter(): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat("en-US-u-nu-latn", {
    timeZone: CAIRO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

function getCairoDateTimeParts(date: Date): CairoDateTimeParts {
  const parts = getCairoPartsFormatter().formatToParts(date);
  const lookup = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: lookup.get("year") ?? "0000",
    month: lookup.get("month") ?? "00",
    day: lookup.get("day") ?? "00",
    hour: lookup.get("hour") ?? "00",
    minute: lookup.get("minute") ?? "00",
    second: lookup.get("second") ?? "00",
  };
}

export function parseBackendTimestamp(
  value?: string | null,
): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const dateOnlyMatch = parseDateParts(
    normalizedValue,
    DATE_ONLY_PATTERN,
  );

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return buildUtcDate(
      Number(year),
      Number(month),
      Number(day),
    );
  }

  const noZoneDateTimeMatch = parseDateParts(
    normalizedValue,
    DATE_TIME_WITHOUT_ZONE_PATTERN,
  );

  if (
    noZoneDateTimeMatch &&
    !HAS_EXPLICIT_TIMEZONE_PATTERN.test(normalizedValue)
  ) {
    const [
      ,
      year,
      month,
      day,
      hours,
      minutes,
      seconds = "0",
      milliseconds = "0",
    ] = noZoneDateTimeMatch;

    return buildUtcDate(
      Number(year),
      Number(month),
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
      Number(milliseconds.padEnd(3, "0")),
    );
  }

  const parsed = new Date(normalizedValue);

  if (!isValidDate(parsed)) {
    return null;
  }

  return parsed;
}

export function parseLocalDateTimeInput(
  value?: string | null,
): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const dateOnlyMatch = parseDateParts(
    normalizedValue,
    DATE_ONLY_PATTERN,
  );

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return buildLocalDate(
      Number(year),
      Number(month),
      Number(day),
    );
  }

  const localDateTimeMatch = parseDateParts(
    normalizedValue,
    DATE_TIME_WITHOUT_ZONE_PATTERN,
  );

  if (localDateTimeMatch) {
    const [
      ,
      year,
      month,
      day,
      hours,
      minutes,
      seconds = "0",
      milliseconds = "0",
    ] = localDateTimeMatch;

    return buildLocalDate(
      Number(year),
      Number(month),
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
      Number(milliseconds.padEnd(3, "0")),
    );
  }

  const parsed = new Date(normalizedValue);

  if (!isValidDate(parsed)) {
    return null;
  }

  return parsed;
}

export function formatDateForDateTimeLocal(
  date: Date,
): string {
  return `${date.getFullYear()}-${padNumber(
    date.getMonth() + 1,
  )}-${padNumber(date.getDate())}T${padNumber(
    date.getHours(),
  )}:${padNumber(date.getMinutes())}`;
}

export function formatNowForDateTimeLocal(): string {
  return formatDateForDateTimeLocal(new Date());
}

export function normalizeLocalDateTimeInputToUtcTimestamp(
  value?: string | null,
): string | null {
  const parsedDate = parseLocalDateTimeInput(value);

  if (!parsedDate) {
    return null;
  }

  return parsedDate.toISOString();
}

export function formatBackendTimestampForDateTimeInput(
  value?: string | null,
): string {
  const parsedDate = parseBackendTimestamp(value);

  if (!parsedDate) {
    return formatNowForDateTimeLocal();
  }

  const parts = getCairoDateTimeParts(parsedDate);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatBackendTimestampForDateTimeLocalInput(
  value?: string | null,
): string {
  return formatBackendTimestampForDateTimeInput(value);
}

export function getCairoMonthKey(
  value?: string | null,
): string {
  const parsed = parseBackendTimestamp(value);

  if (!parsed) {
    return "";
  }

  const parts = getCairoDateTimeParts(parsed);
  return `${parts.year}-${parts.month}`;
}

export function toMonthKeyFromBackendTimestamp(
  value?: string | null,
): string {
  return getCairoMonthKey(value);
}

export function formatBackendTimestampForDisplay(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsed = parseBackendTimestamp(value);

  if (!parsed) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(parsed);
}
