/**
 * The property value types FalkorDB can persist, and the plumbing to move them
 * between a text field and the database.
 *
 * `null`, maps and graph entities are deliberately missing: FalkorDB refuses to
 * store any of them as a property value.
 */

export const VALUE_TYPES = [
  "string",
  "integer",
  "float",
  "boolean",
  "array",
  "vector",
  "point",
  "date",
  "time",
  "datetime",
  "duration",
] as const;

export type ValueType = (typeof VALUE_TYPES)[number];

/** A geospatial point, in the shape the client hands back. */
export type GeoPoint = { latitude: number; longitude: number };

/** The values FalkorDB stores as-is. */
export type ScalarValue = string | number | boolean;

/**
 * A list FalkorDB can persist. Lists nest as deep as they like, but they hold
 * scalars only — a point inside a list is not storable, so it stays out of the
 * type as well.
 */
export type ValueArray = (ScalarValue | ValueArray)[];

/** Anything that can sit on the right-hand side of a `SET n.key = …`. */
export type PropertyValue = ScalarValue | GeoPoint | ValueArray;

/**
 * How each type is written. Everything travels as a query parameter; the types
 * a parameter cannot express on its own are wrapped in the function that
 * builds them.
 */
export const VALUE_EXPRESSIONS: Record<ValueType, string> = {
  string: "$value",
  integer: "toInteger($value)",
  float: "toFloat($value)",
  boolean: "$value",
  array: "$value",
  vector: "vecf32($value)",
  point: "point($value)",
  date: "date($value)",
  time: "localtime($value)",
  datetime: "localdatetime($value)",
  duration: "duration($value)",
};

/** The format hint shown while editing a value of each type. */
export const VALUE_PLACEHOLDERS: Partial<Record<ValueType, string>> = {
  integer: "42",
  float: "3.14",
  array: '[1, "two", true]',
  vector: "[0.1, 0.2, 0.3]",
  point: '{ "latitude": 32.07, "longitude": 34.79 }',
  date: "2025-09-15",
  time: "07:00:00",
  datetime: "2025-06-29T13:45:00",
  duration: "P3DT12H",
};

// Digit counts alone would let `2025-13-45` or `25:61` through to FalkorDB,
// where the failure surfaces as a raw Cypher error instead of the format hint.
const DATE_BODY = String.raw`\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])`;
const TIME_BODY = String.raw`([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?`;
const DATE_PATTERN = new RegExp(`^${DATE_BODY}$`);
const TIME_PATTERN = new RegExp(`^${TIME_BODY}$`);
const DATETIME_PATTERN = new RegExp(`^${DATE_BODY}T${TIME_BODY}$`);
// ISO 8601 duration: at least one component, time components after the `T`.
const DURATION_PATTERN =
  /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;

/**
 * The text FalkorDB accepts for each temporal type. The editor and the request
 * schema that guards the route both read them from here, so what the editor
 * lets through is exactly what the server takes.
 */
export const VALUE_PATTERNS = {
  date: DATE_PATTERN,
  time: TIME_PATTERN,
  datetime: DATETIME_PATTERN,
  duration: DURATION_PATTERN,
} as const;

export type TemporalType = keyof typeof VALUE_PATTERNS;

/** What a shape-valid date that names a day the month never had is told. */
export const CALENDAR_DATE_ERROR = "That day does not exist in that month";

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * The regex bounds the day to 1–31, which still lets `2025-02-31` — and
 * `2025-02-29`, a leap day in a year that has none — through to FalkorDB. This
 * bounds it to the month it actually sits in. Only meaningful once the shape
 * has already matched.
 */
export const isCalendarDate = (type: TemporalType, text: string): boolean => {
  if (type !== "date" && type !== "datetime") return true;

  const [year, month, day] = text.slice(0, 10).split("-").map(Number);
  const lastDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];

  return day <= lastDay;
};

export const isGeoPoint = (value: unknown): value is GeoPoint =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  typeof (value as GeoPoint).latitude === "number" &&
  typeof (value as GeoPoint).longitude === "number";

/**
 * The type to preselect when an existing value is edited. A vector arrives as a
 * plain array of numbers, so it reads back as `array` — the picker is the only
 * place that tells the two apart.
 */
export function inferValueType(value: unknown): ValueType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "float";
  if (Array.isArray(value)) return "array";
  if (isGeoPoint(value)) return "point";
  return "string";
}

/**
 * What an editor of this type starts from. Everything but a boolean is edited
 * as text, so everything but a boolean starts empty.
 */
export function getDefaultValue(type: ValueType): PropertyValue {
  return type === "boolean" ? false : "";
}

/** Renders a value for display — and, for the text types, for editing. */
export function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type ParseResult = { value: PropertyValue } | { error: string };

const isPrimitive = (value: unknown): boolean =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean";

/**
 * FalkorDB nests arrays as deep as it likes, and so does the request schema
 * that guards the route — the two have to agree, or the editor would accept a
 * value the server rejects.
 */
const isStorableArray = (value: unknown): boolean =>
  Array.isArray(value) && value.every((item) => isPrimitive(item) || isStorableArray(item));

const parseJson = (raw: string): { parsed: unknown } | { error: string } => {
  try {
    return { parsed: JSON.parse(raw) };
  } catch {
    return { error: "Value is not valid JSON" };
  }
};

/**
 * Turns what the editor holds into the value sent to the database, or explains
 * why it cannot. The temporal types stay strings: FalkorDB builds them from the
 * ISO text itself.
 */
export function parseValue(type: ValueType, raw: PropertyValue): ParseResult {
  switch (type) {
    case "boolean":
      return { value: typeof raw === "boolean" ? raw : raw === "true" };
    case "integer":
    case "float": {
      // `Number("")` is 0, so an empty field would silently save a value.
      const text = typeof raw === "number" ? String(raw) : String(raw).trim();
      const num = text === "" ? NaN : Number(text);

      if (!Number.isFinite(num)) return { error: "Value has to be a number" };
      if (type === "integer" && !Number.isInteger(num)) return { error: "Value has to be a whole number" };

      return { value: num };
    }
    case "array":
    case "vector":
    case "point": {
      const result = parseJson(String(raw).trim());

      if ("error" in result) return result;

      const { parsed } = result;

      if (type === "point") {
        if (!isGeoPoint(parsed)) return { error: "A point needs a numeric latitude and longitude" };
        return { value: { latitude: parsed.latitude, longitude: parsed.longitude } };
      }

      if (!Array.isArray(parsed)) return { error: `A ${type} has to be a list` };

      if (type === "vector") {
        if (!parsed.every((item) => typeof item === "number" && Number.isFinite(item))) {
          return { error: "A vector holds numbers only" };
        }
      } else if (!isStorableArray(parsed)) {
        return { error: "An array holds strings, numbers, booleans or arrays of them" };
      }

      return { value: parsed as ValueArray };
    }
    case "date":
    case "time":
    case "datetime":
    case "duration": {
      const text = String(raw).trim();

      if (!VALUE_PATTERNS[type].test(text)) {
        return { error: `Expected the format ${VALUE_PLACEHOLDERS[type]}` };
      }

      if (!isCalendarDate(type, text)) return { error: CALENDAR_DATE_ERROR };

      return { value: text };
    }
    default:
      return { value: String(raw) };
  }
}
