import { z } from "zod";

// User schemas
export const createUserSchema = z.object({
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Invalid Username"
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Invalid Password"
  }),
  role: z.string({
    required_error: "Role is required",
    invalid_type_error: "Invalid Role"
  }),
});

export const deleteUsersSchema = z.object({
  users: z.array(z.object({
    username: z.string(),
    role: z.string().optional(),
    selected: z.boolean().optional(),
  })).min(1, "At least one user is required"),
});

export const updateUserRoleSchema = z.object({
  user: z.string({
    required_error: "Username is required",
    invalid_type_error: "Invalid Username"
  }),
  role: z.string({
    required_error: "Role is required",
    invalid_type_error: "Invalid Role"
  }),
});

// Schema (graph schema) schemas
export const createSchemaSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
});

export const deleteSchemaSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
});

export const renameSchemaSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name"
  }),
});

export const duplicateSchemaSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name"
  }),
});

// Schema node schemas
export const createSchemaNodeSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  type: z.boolean(),
  label: z.array(z.string()),
  attributes: z.record(z.string(), z.array(z.string())),
  selectedNodes: z.array(z.object({
    id: z.number(),
  })).optional(),
});

export const deleteSchemaNodeSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  type: z.boolean(),
});

export const addSchemaNodeLabelSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label"
  }),
});

export const removeSchemaNodeLabelSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label"
  }),
});

export const updateSchemaNodeAttributeSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  key: z.string({
    required_error: "Key is required",
    invalid_type_error: "Invalid Key"
  }),
  type: z.boolean(),
  attribute: z.any(),
});

export const deleteSchemaNodeAttributeSchema = z.object({
  schema: z.string({
    required_error: "Schema name is required",
    invalid_type_error: "Invalid Schema name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  key: z.string({
    required_error: "Key is required",
    invalid_type_error: "Invalid Key"
  }),
  type: z.boolean(),
});

// Graph schemas
export const createGraphSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
});

export const deleteGraphSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
});

export const renameGraphSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name"
  }),
});

export const duplicateGraphSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  sourceName: z.string({
    required_error: "Source name is required",
    invalid_type_error: "Invalid Source name"
  }),
});

// Graph node schemas
export const deleteGraphNodeSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  type: z.boolean(),
});

export const addGraphNodeLabelSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label"
  }),
});

export const removeGraphNodeLabelSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  label: z.string({
    required_error: "Label is required",
    invalid_type_error: "Invalid Label"
  }),
});

export const updateGraphNodeAttributeSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  key: z.string({
    required_error: "Key is required",
    invalid_type_error: "Invalid Key"
  }),
  type: z.boolean(),
  value: z.any(),
});

export const deleteGraphNodeAttributeSchema = z.object({
  graph: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  node: z.string({
    required_error: "Node ID is required",
    invalid_type_error: "Invalid Node ID"
  }),
  key: z.string({
    required_error: "Key is required",
    invalid_type_error: "Invalid Key"
  }),
  type: z.boolean({
    required_error: "Type is required",
    invalid_type_error: "Invalid Type"
  }),
});

// Graph config schemas
export const updateGraphConfigSchema = z.object({
  config: z.string({
    required_error: "Config name is required",
    invalid_type_error: "Invalid Config name"
  }),
  value: z.string({
    required_error: "Value is required",
    invalid_type_error: "Invalid Value"
  }),
});

// Chat schemas
export const chatRequestSchema = z.object({
  messages: z.array(z.any(), {
    required_error: "Messages are required",
    invalid_type_error: "Invalid Messages"
  }).min(1, "Messages are required"),
  graphName: z.string({
    required_error: "Graph name is required",
    invalid_type_error: "Invalid Graph name"
  }),
  key: z.string({
    invalid_type_error: "Invalid API key"
  }).optional(),
  model: z.string({
    invalid_type_error: "Invalid Model"
  }).optional(),
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string({
    invalid_type_error: "Invalid Username"
  }).optional(),
  password: z.string({
    invalid_type_error: "Invalid Password"
  }).optional(),
  host: z.string({
    invalid_type_error: "Invalid Host"
  }).default("localhost"),
  port: z.string({
    invalid_type_error: "Invalid Port"
  }).default("6379"),
  tls: z.string({
    invalid_type_error: "Invalid TLS value"
  }).default("false"),
  ca: z.string({
    invalid_type_error: "Invalid CA certificate"
  }).optional(),
});

export const revokeTokenSchema = z.object({
  token: z.string({
    required_error: "Token is required",
    invalid_type_error: "Invalid Token"
  }),
});

// Validation helper function
export function validateRequest<T extends z.ZodTypeAny>(
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

