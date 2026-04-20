import { z } from "zod";

export const createUser = z.object({
  username: z
    .string({
      error: (issue) => issue.input === undefined ? "Username is required" : "Invalid Username",
    })
    .min(1, "Username cannot be empty"),
  password: z
    .string({
      error: (issue) => issue.input === undefined ? "Password is required" : "Invalid Password",
    })
    .min(1, "Password cannot be empty"),
  role: z
    .string({
      error: (issue) => issue.input === undefined ? "Role is required" : "Invalid Role",
    })
    .min(1, "Role cannot be empty"),
  keys: z
    .string()
    .optional()
    .default("*"),
});

export const deleteUsers = z.object({
  users: z
    .array(
      z.object({
        username: z.string().min(1, "Username cannot be empty"),
      })
    )
    .min(1, "At least one user is required"),
});

export const updateUser = z.object({
  role: z
    .string({
      error: (issue) => issue.input === undefined ? "Role is required" : "Invalid Role",
    })
    .min(1, "Role cannot be empty"),
  keys: z
    .string()
    .optional(),
  password: z
    .string()
    .optional(),
});

// Schema (graph schema) schemas
export const renameSchema = z.object({
  sourceName: z
    .string({
      error: (issue) => issue.input === undefined ? "Source name is required" : "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const duplicateSchema = z.object({
  sourceName: z
    .string({
      error: (issue) => issue.input === undefined ? "Source name is required" : "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const createSchemaElement = z.object({
  type: z.boolean(),
  label: z.array(z.string()),
  attributes: z.array(
    z.tuple([
      z.string().min(1, "Attribute name cannot be empty"),
      z.array(z.string().min(1, "Attribute values cannot be empty")),
    ])
  ),
  selectedNodes: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export const deleteSchemaElement = z.object({
  type: z.boolean(),
});

export const addSchemaElementLabel = z.object({
  label: z
    .string({
      error: (issue) => issue.input === undefined ? "Label is required" : "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const removeSchemaElementLabel = z.object({
  label: z
    .string({
      error: (issue) => issue.input === undefined ? "Label is required" : "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const updateSchemaElementAttribute = z.object({
  type: z.boolean(),
  attribute: z.array(z.string().min(1, "Attribute value cannot be empty")),
});

export const deleteSchemaElementAttribute = z.object({
  type: z.boolean(),
});

// Graph schemas
export const renameGraph = z.object({
  sourceName: z
    .string({
      error: (issue) => issue.input === undefined ? "Source name is required" : "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const duplicateGraph = z.object({
  sourceName: z
    .string({
      error: (issue) => issue.input === undefined ? "Source name is required" : "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const createGraphElement = z.object({
  type: z.boolean(),
  label: z.array(z.string()),
  attributes: z.array(
    z.tuple([
      z.string().min(1, "Attribute name cannot be empty"),
      z.union([
        z.string().min(1, "Attribute value cannot be empty"),
        z.number(),
        z.boolean(),
      ]),
    ])
  ),
  selectedNodes: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export const deleteGraphElement = z.object({
  type: z.boolean(),
});

export const addGraphElementLabel = z.object({
  label: z
    .string({
      error: (issue) => issue.input === undefined ? "Label is required" : "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const removeGraphElementLabel = z.object({
  label: z
    .string({
      error: (issue) => issue.input === undefined ? "Label is required" : "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const updateGraphElementAttribute = z.object({
  type: z.boolean(),
  value: z.union([
    z.string().min(1, "Attribute value cannot be empty"),
    z.number(),
    z.boolean(),
  ]),
});

export const deleteGraphElementAttribute = z.object({
  type: z.boolean({
    error: (issue) => issue.input === undefined ? "Type is required" : "Invalid Type",
  }),
});

// UDF schemas
export const loadUdf = z.object({
  code: z
    .string({
      error: (issue) => issue.input === undefined ? "Code is required" : "Invalid Code",
    })
    .min(1, "Code cannot be empty"),
  replace: z
    .boolean({
      error: "Invalid Replace value",
    })
    .optional()
    .default(false),
});

export const deleteUdf = z.object({
  name: z
    .string({
      error: (issue) => issue.input === undefined ? "Name is required" : "Invalid Name",
    })
    .min(1, "Name cannot be empty"),
});

// Graph config schemas
export const updateGraphConfig = z.object({
  value: z
    .string({
      error: (issue) => issue.input === undefined ? "Value is required" : "Invalid Value",
    })
    .min(1, "Value cannot be empty"),
});

// Chat schemas
const chatMessage = z.object({
  role: z.string().min(1),
  content: z.string(),
});

export const chatRequest = z.object({
  messages: z
    .array(chatMessage, {
      error: (issue) => issue.input === undefined ? "Messages are required" : "Invalid Messages",
    })
    .min(1, "Messages are required"),
  graphName: z
    .string({
      error: (issue) => issue.input === undefined ? "Graph name is required" : "Invalid Graph name",
    })
    .min(1, "Graph name cannot be empty"),
  key: z
    .string({
      error: (issue) => issue.input === undefined ? "API key is required" : "Invalid API key",
    })
    .min(1, "API key cannot be empty"),
  model: z
    .string({
      error: (issue) => issue.input === undefined ? "Model is required" : "Invalid Model",
    })
    .min(1, "Model cannot be empty"),
  cypherOnly: z
    .boolean({
      error: "Invalid Cypher Only value",
    })
    .optional()
    .default(false),
});

// Auth schemas
export const login = z.object({
  username: z
    .string({
      error: "Invalid Username",
    })
    .min(1, "Username cannot be empty")
    .optional(),
  password: z
    .string({
      error: "Invalid Password",
    })
    .min(1, "Password cannot be empty")
    .optional(),
  host: z
    .string({
      error: "Invalid Host",
    })
    .min(1, "Host cannot be empty")
    .default("localhost"),
  port: z
    .string({
      error: "Invalid Port",
    })
    .min(1, "Port cannot be empty")
    .default("6379"),
  tls: z
    .string({
      error: "Invalid TLS value",
    })
    .min(1, "TLS value cannot be empty")
    .default("false"),
  ca: z
    .string({
      error: "Invalid CA certificate",
    })
    .min(1, "CA certificate cannot be empty")
    .optional(),
  name: z
    .string({
      error: "Invalid token name",
    })
    .optional(),
  expiresAt: z
    .string({
      error: "Invalid expiration date",
    })
    .nullable()
    .optional(),
  ttlSeconds: z
    .number({
      error: "Invalid TTL value",
    })
    .optional(),
});

export const revokeToken = z.object({
  token: z
    .string({
      error: (issue) => issue.input === undefined ? "Token is required" : "Invalid Token",
    })
    .min(1, "Token cannot be empty"),
});

export const validateUrl = z.object({
  url: z
    .string({
      error: (issue) => issue.input === undefined ? "URL is required" : "Invalid URL",
    })
    .min(1, "URL cannot be empty"),
});

// Validation helper function
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.output<T> } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "Validation failed" };
  }
}
