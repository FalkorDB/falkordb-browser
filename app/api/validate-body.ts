import { z } from "zod";

export const createUser = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Invalid Username",
    })
    .min(1, "Username cannot be empty"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Invalid Password",
    })
    .min(1, "Password cannot be empty"),
  role: z
    .string({
      required_error: "Role is required",
      invalid_type_error: "Invalid Role",
    })
    .min(1, "Role cannot be empty"),
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

export const updateUserRole = z.object({
  role: z
    .string({
      required_error: "Role is required",
      invalid_type_error: "Invalid Role",
    })
    .min(1, "Role cannot be empty"),
});

// Schema (graph schema) schemas
export const renameSchema = z.object({
  sourceName: z
    .string({
      required_error: "Source name is required",
      invalid_type_error: "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const duplicateSchema = z.object({
  sourceName: z
    .string({
      required_error: "Source name is required",
      invalid_type_error: "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const createSchemaElement = z.object({
  type: z.boolean(),
  label: z.array(z.string()).optional(),
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
      required_error: "Label is required",
      invalid_type_error: "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const removeSchemaElementLabel = z.object({
  label: z
    .string({
      required_error: "Label is required",
      invalid_type_error: "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const updateSchemaElementAttribute = z.object({
  type: z.boolean(),
  attribute: z.any(),
});

export const deleteSchemaElementAttribute = z.object({
  type: z.boolean(),
});

// Graph schemas
export const renameGraph = z.object({
  sourceName: z
    .string({
      required_error: "Source name is required",
      invalid_type_error: "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const duplicateGraph = z.object({
  sourceName: z
    .string({
      required_error: "Source name is required",
      invalid_type_error: "Invalid Source name",
    })
    .min(1, "Source name cannot be empty"),
});

export const createGraphElement = z.object({
  type: z.boolean(),
  label: z.array(z.string()).optional(),
  attributes: z.array(z.tuple([z.string().min(1, "Attribute name cannot be empty"), z.union([z.string().min(1, "Attribute value cannot be empty"), z.number(), z.boolean()])])),
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
      required_error: "Label is required",
      invalid_type_error: "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const removeGraphElementLabel = z.object({
  label: z
    .string({
      required_error: "Label is required",
      invalid_type_error: "Invalid Label",
    })
    .min(1, "Label cannot be empty"),
});

export const updateGraphElementAttribute = z.object({
  type: z.boolean(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const deleteGraphElementAttribute = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
});

// Graph config schemas
export const updateGraphConfig = z.object({
  value: z
    .string({
      required_error: "Value is required",
      invalid_type_error: "Invalid Value",
    })
    .min(1, "Value cannot be empty"),
});

// Chat schemas
export const chatRequest = z.object({
  messages: z
    .array(z.any(), {
      required_error: "Messages are required",
      invalid_type_error: "Invalid Messages",
    })
    .min(1, "Messages are required"),
  graphName: z
    .string({
      required_error: "Graph name is required",
      invalid_type_error: "Invalid Graph name",
    })
    .min(1, "Graph name cannot be empty"),
  key: z
    .string({
      invalid_type_error: "Invalid API key",
    })
    .min(1, "API key cannot be empty")
    .optional(),
  model: z
    .string({
      invalid_type_error: "Invalid Model",
    })
    .min(1, "Model cannot be empty")
    .optional(),
});

// Auth schemas
export const login = z.object({
  username: z
    .string({
      invalid_type_error: "Invalid Username",
    })
    .min(1, "Username cannot be empty")
    .optional(),
  password: z
    .string({
      invalid_type_error: "Invalid Password",
    })
    .min(1, "Password cannot be empty")
    .optional(),
  host: z
    .string({
      invalid_type_error: "Invalid Host",
    })
    .min(1, "Host cannot be empty")
    .default("localhost"),
  port: z
    .string({
      invalid_type_error: "Invalid Port",
    })
    .min(1, "Port cannot be empty")
    .default("6379"),
  tls: z
    .string({
      invalid_type_error: "Invalid TLS value",
    })
    .min(1, "TLS value cannot be empty")
    .default("false"),
  ca: z
    .string({
      invalid_type_error: "Invalid CA certificate",
    })
    .min(1, "CA certificate cannot be empty")
    .optional(),
});

export const revokeToken = z.object({
  token: z
    .string({
      required_error: "Token is required",
      invalid_type_error: "Invalid Token",
    })
    .min(1, "Token cannot be empty"),
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
      const errorMessage = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "Validation failed" };
  }
}
