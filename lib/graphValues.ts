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

/** Anything that can sit on the right-hand side of a `SET n.key = …`. */
export type PropertyValue =
  | string
  | number
  | boolean
  | GeoPoint
  | PropertyValue[];

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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;
// ISO 8601 duration: at least one component, time components after the `T`.
const DURATION_PATTERN =
  /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;

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

      return { value: parsed as PropertyValue[] };
    }
    case "date":
    case "time":
    case "datetime":
    case "duration": {
      const text = String(raw).trim();
      const patterns: Record<string, RegExp> = {
        date: DATE_PATTERN,
        time: TIME_PATTERN,
        datetime: DATETIME_PATTERN,
        duration: DURATION_PATTERN,
      };

      if (!patterns[type].test(text)) {
        return { error: `Expected the format ${VALUE_PLACEHOLDERS[type]}` };
      }

      return { value: text };
    }
    default:
      return { value: String(raw) };
  }
}
