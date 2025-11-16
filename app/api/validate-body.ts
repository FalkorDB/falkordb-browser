import { z } from "zod";

export const createUser = z.object({
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Invalid Username",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Invalid Password",
  }),
  role: z.string({
    required_error: "Role is required",
    invalid_type_error: "Invalid Role",
  }),
});

export const deleteUsers = z.object({
  users: z
    .array(
      z.object({
        username: z.string(),
        role: z.string().optional(),
        selected: z.boolean().optional(),
      })
    )
    .min(1, "At least one user is required"),
});

export const updateUserRole = z.object({
  role: z.string({
    required_error: "Role is required",
    invalid_type_error: "Invalid Role",
  }),
});

// Schema (graph schema) schemas
export const renameSchema = z.object({
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name",
  }),
});

export const duplicateSchema = z.object({
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name",
  }),
});

export const createSchemaElement = z.object({
  type: z.boolean(),
  label: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.array(z.string())),
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
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label",
  }),
});

export const removeSchemaElementLabel = z.object({
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label",
  }),
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
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name",
  }),
});

export const duplicateGraph = z.object({
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name",
  }),
});

export const createGraphElement = z.object({
  type: z.boolean(),
  label: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.string()),
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
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label",
  }),
});

export const removeGraphElementLabel = z.object({
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label",
  }),
});

export const updateGraphElementAttribute = z.object({
  type: z.boolean(),
  value: z.any(),
});

export const deleteGraphElementAttribute = z.object({
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type",
  }),
});

// Graph config schemas
export const updateGraphConfig = z.object({
  value: z.string({
    required_error: "Value is required",
    invalid_type_error: "Invalid Value",
  }),
});

// Chat schemas
export const chatRequest = z.object({
  messages: z
    .array(z.any(), {
      required_error: "Messages are required",
      invalid_type_error: "Invalid Messages",
    })
    .min(1, "Messages are required"),
  graphName: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name",
  }),
  key: z
    .string({
      invalid_type_error: "Invalid API key",
    })
    .optional(),
  model: z
    .string({
      invalid_type_error: "Invalid Model",
    })
    .optional(),
});

// Auth schemas
export const login = z.object({
  username: z
    .string({
      invalid_type_error: "Invalid Username",
    })
    .optional(),
  password: z
    .string({
      invalid_type_error: "Invalid Password",
    })
    .optional(),
  host: z
    .string({
      invalid_type_error: "Invalid Host",
    })
    .default("localhost"),
  port: z
    .string({
      invalid_type_error: "Invalid Port",
    })
    .default("6379"),
  tls: z
    .string({
      invalid_type_error: "Invalid TLS value",
    })
    .default("false"),
  ca: z
    .string({
      invalid_type_error: "Invalid CA certificate",
    })
    .optional(),
});

export const revokeToken = z.object({
  token: z.string({
    required_error: "Token is required",
    invalid_type_error: "Invalid Token",
  }),
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

