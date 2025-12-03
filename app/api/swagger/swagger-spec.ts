// Complete Swagger specification for FalkorDB Browser API
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "FalkorDB Browser API",
    version: "1.4.6",
    description: "REST API for FalkorDB Browser - Graph Database Management Interface",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from the login endpoint",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "Authentication and authorization endpoints",
    },
    {
      name: "Graph",
      description: "Graph management and query endpoints",
    },
    // {
    //   name: "Schema",
    //   description: "Schema management endpoints",
    // },
    {
      name: "Configurations",
      description: "Database configuration management endpoints",
    },
    {
      name: "Users",
      description: "User management endpoints",
    },
    {
      name: "Status",
      description: "Health check and status endpoints",
    }
  ],
  paths: {
    "/api/auth/tokens/credentials": {
      post: {
        tags: ["Authentication"],
  summary: "Generate JWT Token with Credentials",
  description: "Authenticate with direct credentials and generate a JWT Personal Access Token (PAT) for external API access, CLI tools, or programmatic access. This endpoint does NOT require an existing session.\n\n**Note:** Optional fields: `name`, `expiresAt`, `ttlSeconds`, `host`, `port`, `tls`, `ca`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: {
                    type: "string",
                    description: "Username for database connection",
                    example: "default"
                  },
                  password: {
                    type: "string",
                    description: "Password for database connection. Can be omitted (or empty) only when using the `default` user on localhost; otherwise a non-empty password is required.",
                    example: ""
                  },
                  name: {
                    type: "string",
                    description: "Token name",
                    example: "API Token"
                  },
                  expiresAt: {
                    type: "string",
                    format: "date-time",
                    description: "Token expiration date in ISO 8601 format",
                    example: null
                  },
                  ttlSeconds: {
                    type: "integer",
                    description: "Time-to-live in seconds (max: 31622400)",
                    example: 31622400
                  },
                  host: {
                    type: "string",
                    description: "FalkorDB host",
                    example: "localhost"
                  },
                  port: {
                    type: "string",
                    description: "FalkorDB port",
                    example: "6379"
                  },
                  tls: {
                    type: "string",
                    description: "Enable TLS connection",
                    example: "false",
                    enum: ["true", "false"]
                  }
                },
                required: ["username", "host", "port", "tls"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Token generated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Token created successfully"
                    },
                    token: {
                      type: "string",
                      description: "JWT authentication token (Personal Access Token)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - Invalid JSON, validation error, expiration date in the past, or invalid TTL value",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Expiration date must be in the future"
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Authentication failed - Invalid credentials or connection failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Invalid credentials or connection failed"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Server configuration error - Missing NEXTAUTH_SECRET",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Server configuration error: NEXTAUTH_SECRET not set"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/tokens": {
      get: {
        tags: ["Authentication"],
        summary: "List JWT tokens",
        description: "Get a list of active JWT tokens. Admins see all tokens, regular users see only their own tokens.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of tokens retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tokens: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          user_id: {
                            type: "string",
                            description: "Hashed user identifier",
                            example: "7262bcaecc2b06ff66e28ede90e6dce39c218685af9272d7a3fbd63ae08d17c2"
                          },
                          token_id: {
                            type: "string",
                            description: "Unique token identifier",
                            example: "1761055513181-215c579b-c6e1-4f10-9b07-aacbf89cda21"
                          },
                          created_at: {
                            type: "string",
                            format: "date-time",
                            description: "Token creation timestamp",
                            example: "2025-10-21T14:05:13.182Z"
                          },
                          expires_at: {
                            type: "string",
                            format: "date-time",
                            description: "Token expiration timestamp",
                            example: "2026-10-21T14:05:13.182Z"
                          },
                          last_used: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            description: "Last time the token was used",
                            example: null
                          },
                          name: {
                            type: "string",
                            description: "Token name/description",
                            example: "API Token"
                          },
                          permissions: {
                            type: "array",
                            items: {
                              type: "string"
                            },
                            description: "User permissions/role",
                            example: ["Admin"]
                          },
                          username: {
                            type: "string",
                            description: "Username associated with the token",
                            example: "adminuser"
                          }
                        }
                      }
                    },
                    count: {
                      type: "number",
                      description: "Total number of tokens returned",
                      example: 8
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Authentication failed - invalid or missing token"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/auth/tokens/{tokenId}": {
      get: {
        tags: ["Authentication"],
        summary: "Get token metadata",
        description: "Get detailed metadata for a specific JWT token by its token ID. Admins can view any token, regular users can only view their own tokens.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "tokenId",
            required: true,
            schema: {
              type: "string"
            },
            description: "Token ID to retrieve",
            example: "1761053108078-554350d7-c965-4ed7-8d32-679b7f705e81"
          }
        ],
        responses: {
          "200": {
            description: "Token metadata retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "object",
                      properties: {
                        user_id: {
                          type: "string",
                          description: "Hashed user identifier",
                          example: "e5d09e7d2141f77f80008ff73f04104b9484f59baa8e19a4ea758495d289fd0f"
                        },
                        token_id: {
                          type: "string",
                          description: "Unique token identifier",
                          example: "1761053108078-554350d7-c965-4ed7-8d32-679b7f705e81"
                        },
                        created_at: {
                          type: "string",
                          format: "date-time",
                          description: "Token creation timestamp",
                          example: "2025-10-21T13:25:08.085Z"
                        },
                        expires_at: {
                          type: "string",
                          format: "date-time",
                          description: "Token expiration timestamp",
                          example: "2026-10-21T13:25:08.085Z"
                        },
                        last_used: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                          description: "Last time the token was used",
                          example: null
                        },
                        name: {
                          type: "string",
                          description: "Token name/description",
                          example: "API Token"
                        },
                        permissions: {
                          type: "array",
                          items: {
                            type: "string"
                          },
                          description: "User permissions/role",
                          example: ["Read-Only"]
                        },
                        username: {
                          type: "string",
                          description: "Username associated with the token",
                          example: "readonlyuser"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Authentication failed - invalid or missing token"
          },
          "403": {
            description: "Forbidden - You can only view your own tokens (unless you are an Admin)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Forbidden: You can only view your own tokens"
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "Token not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Token not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      delete: {
        tags: ["Authentication"],
        summary: "Revoke token by ID",
        description: "Revoke a specific JWT token by its token ID. Once revoked, the token cannot be used for authentication. Admins can revoke any token, regular users can only revoke their own tokens.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "tokenId",
            required: true,
            schema: {
              type: "string"
            },
            description: "Token ID to revoke",
            example: "1761053108078-554350d7-c965-4ed7-8d32-679b7f705e81"
          }
        ],
        responses: {
          "200": {
            description: "Token revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Token revoked successfully"
                    },
                    tokenId: {
                      type: "string",
                      description: "ID of the revoked token",
                      example: "1761053108078-554350d7-c965-4ed7-8d32-679b7f705e81"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - Token is already revoked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Token is already revoked"
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Authentication failed - invalid or missing token"
          },
          "403": {
            description: "Forbidden - You can only revoke your own tokens (unless you are an Admin)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Forbidden: You can only revoke your own tokens"
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "Token not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Token not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/status": {
      get: {
        tags: ["Status"],
        summary: "Check FalkorDB connection status",
        description: "Returns the current connection status to the FalkorDB database",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Database is online and accessible",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "online"
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "Database is offline or not accessible"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/graph": {
      get: {
        tags: ["Graph"],
        summary: "List all graphs",
        description: "Get a list of all graphs in the FalkorDB instance",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of graphs retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    opts: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Array of graph names"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/graph/{graph}": {
      get: {
        tags: ["Graph"],
        summary: "Execute graph query",
        description: "Execute a Cypher query on the specified graph (Server-Sent Events)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name to query",
            example: "social_network"
          },
          {
            in: "query",
            name: "query",
            required: true,
            schema: {
              type: "string"
            },
            description: "Cypher query to execute",
            example: "MATCH (n) RETURN n LIMIT 10"
          },
          {
            in: "query",
            name: "timeout",
            required: true,
            schema: {
              type: "number"
            },
            description: "Query timeout in milliseconds",
            example: 30000
          }
        ],
        responses: {
          "200": {
            description: "Query executed successfully (Server-Sent Events stream)"
          }
        }
      },
      post: {
        tags: ["Graph"],
        summary: "Create or verify a graph",
        description: "Create a new graph or verify that a graph exists",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name to create or verify"
          }
        ],
        responses: {
          "200": {
            description: "Graph created or verified successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Graph created successfully"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      patch: {
        tags: ["Graph"],
        summary: "Rename/change graph name",
        description: "Rename an existing graph to a new name",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "New graph name"
          },
          {
            in: "query",
            name: "sourceName",
            required: true,
            schema: {
              type: "string"
            },
            description: "Current graph name to rename"
          }
        ],
        responses: {
          "200": {
            description: "Graph renamed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      description: "Rename operation result"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - graph already exists or missing sourceName"
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      delete: {
        tags: ["Graph"],
        summary: "Delete a graph",
        description: "Delete a graph from the FalkorDB instance",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name to delete"
          }
        ],
        responses: {
          "200": {
            description: "Graph deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "graph_name graph deleted"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/graph/{graph}/explain": {
      get: {
        tags: ["Graph"],
        summary: "Get query execution plan",
        description: "Get the execution plan for a Cypher query without executing it",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "query",
            name: "query",
            required: true,
            schema: {
              type: "string"
            },
            description: "Cypher query to explain"
          }
        ],
        responses: {
          "200": {
            description: "Query execution plan returned successfully"
          }
        }
      }
    },
    "/api/graph/{graph}/profile": {
      get: {
        tags: ["Graph"],
        summary: "Profile query execution",
        description: "Get detailed profiling information for a Cypher query",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "query",
            name: "query",
            required: true,
            schema: {
              type: "string"
            },
            description: "Cypher query to profile"
          }
        ],
        responses: {
          "200": {
            description: "Query profiling information returned successfully"
          }
        }
      }
    },
    "/api/graph/{graph}/info": {
      get: {
        tags: ["Graph"],
        summary: "Get graph information",
        description: "Get specific information about a graph (functions, property keys, labels, or relationship types)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "query",
            name: "type",
            required: true,
            schema: {
              type: "string",
              enum: ["(function)", "(property key)", "(label)", "(relationship type)"]
            },
            description: "Type of information to retrieve",
            example: "(label)"
          }
        ],
        responses: {
          "200": {
            description: "Graph information retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      description: "Query result containing the requested information"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - missing or invalid type parameter"
          }
        }
      }
    },
    "/api/graph/{graph}/count": {
      get: {
        tags: ["Graph"],
        summary: "Get graph element counts",
        description: "Get the count of nodes and relationships in a graph",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          }
        ],
        responses: {
          "200": {
            description: "Element counts retrieved successfully"
          }
        }
      }
    },
    "/api/graph/{graph}/export": {
      get: {
        tags: ["Graph"],
        summary: "Export graph data",
        description: "Export graph data in various formats",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          }
        ],
        responses: {
          "200": {
            description: "Graph data exported successfully"
          }
        }
      }
    },
    "/api/graph/{graph}/duplicate": {
      patch: {
        tags: ["Graph"],
        summary: "Duplicate a graph",
        description: "Create a copy of an existing graph with a new name",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "New graph name for the duplicate"
          },
          {
            in: "query",
            name: "sourceName",
            required: true,
            schema: {
              type: "string"
            },
            description: "Source graph name to duplicate from"
          }
        ],
        responses: {
          "200": {
            description: "Graph duplicated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      description: "Duplication operation result"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - missing sourceName parameter"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/graph/{graph}/{element}": {
      get: {
        tags: ["Graph"],
        summary: "Get node information",
        description: "Get detailed information about a specific node",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "path",
            name: "element",
            required: true,
            schema: {
              type: "string"
            },
            description: "Element ID"
          }
        ],
        responses: {
          "200": {
            description: "Node information retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      description: "Query result with node neighbors and relationships"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      delete: {
        tags: ["Graph"],
        summary: "Delete node or relationship",
        description: "Delete a node or relationship from the graph",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "path",
            name: "element",
            required: true,
            schema: {
              type: "string"
            },
            description: "Element ID (node or relationship)"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {
                    type: "boolean",
                    description: "true to delete a node, false to delete a relationship",
                    example: true
                  }
                },
                required: ["type"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Node or relationship deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Node deleted successfully"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - missing type parameter"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/graph/{graph}/{element}/label": {
      post: {
        tags: ["Graph"],
        summary: "Add node label",
        description: "Add a label to a specific node",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "path",
            name: "element",
            required: true,
            schema: {
              type: "string"
            },
            description: "Element ID"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    description: "Label to add",
                    example: "your_label"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Label added successfully"
          }
        }
      },
      delete: {
        tags: ["Graph"],
        summary: "Remove node label",
        description: "Remove a label from a specific node",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "path",
            name: "element",
            required: true,
            schema: {
              type: "string"
            },
            description: "Element ID"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    description: "Label to remove",
                    example: "your_label"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Label removed successfully"
          }
        }
      }
    },
    "/api/graph/{graph}/{element}/{key}": {
      post: {
        tags: ["Graph"],
        summary: "Set node/relationship property",
        description: "Set a property value on a node or relationship. IMPORTANT - Use type=true for nodes, type=false for relationships.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "path",
            name: "element",
            required: true,
            schema: {
              type: "string"
            },
            description: "Element ID (node or relationship)"
          },
          {
            in: "path",
            name: "key",
            required: true,
            schema: {
              type: "string"
            },
            description: "Property key name"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  value: {
                    description: "Property value to set",
                    example: "your_property_value"
                  },
                  type: {
                    type: "boolean",
                    description: "REQUIRED: Set to true for nodes, false for relationships",
                    example: true
                  }
                },
                required: ["value", "type"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Property set successfully"
          }
        }
      },
      delete: {
        tags: ["Graph"],
        summary: "Remove node/relationship property",
        description: "Remove a property from a node or relationship. IMPORTANT - Use type=true for nodes, type=false for relationships.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "graph",
            required: true,
            schema: {
              type: "string"
            },
            description: "Graph name"
          },
          {
            in: "path",
            name: "element",
            required: true,
            schema: {
              type: "string"
            },
            description: "Element ID (node or relationship)"
          },
          {
            in: "path",
            name: "key",
            required: true,
            schema: {
              type: "string"
            },
            description: "Property key name"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {
                    type: "boolean",
                    description: "REQUIRED: Set to true for nodes, false for relationships",
                    example: true
                  }
                },
                required: ["type"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Property removed successfully"
          }
        }
      }
    },
    "/api/graph/config": {
      get: {
        tags: ["Configurations"],
        summary: "Get all configuration values",
        description: "Get all FalkorDB configuration parameters and their values",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Configuration values retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    configs: {
                      type: "object",
                      description: "Configuration parameters and their values"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/graph/config/{config}": {
      get: {
        tags: ["Configurations"],
        summary: "Get specific configuration value",
        description: "Get the value of a specific configuration parameter",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "config",
            required: true,
            schema: {
              type: "string"
            },
            description: "Configuration parameter name",
            example: "MAX_INFO_QUERIES"
          }
        ],
        responses: {
          "200": {
            description: "Configuration value retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    config: {
                      description: "Configuration parameter value"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      post: {
        tags: ["Configurations"],
        summary: "Set configuration value",
        description: "Set the value of a specific configuration parameter",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "config",
            required: true,
            schema: {
              type: "string"
            },
            description: "Configuration parameter name",
            example: "MAX_INFO_QUERIES"
          },
          {
            in: "query",
            name: "value",
            required: true,
            schema: {
              type: "string"
            },
            description: "Configuration value to set (numeric values will be parsed as integers except for CMD_INFO)",
            example: "700"
          }
        ],
        responses: {
          "200": {
            description: "Configuration value set successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    config: {
                      description: "Result of configuration update"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - missing value or invalid value"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    // "/api/schema": {
    //   get: {
    //     tags: ["Schema"],
    //     summary: "List all schemas",
    //     description: "Get a list of all schemas in the FalkorDB instance",
    //     security: [{ bearerAuth: [] }],
    //     responses: {
    //       "200": {
    //         description: "List of schemas retrieved successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}": {
    //   get: {
    //     tags: ["Schema"],
    //     summary: "Get schema information",
    //     description: "Get detailed information about a specific schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       }
    //     ],
    //     responses: {
    //       "200": {
    //         description: "Schema information retrieved successfully"
    //       }
    //     }
    //   },
    //   post: {
    //     tags: ["Schema"],
    //     summary: "Create new schema",
    //     description: "Create a new schema with the specified name",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name to create"
    //       }
    //     ],
    //     responses: {
    //       "201": {
    //         description: "Schema created successfully"
    //       }
    //     }
    //   },
    //   delete: {
    //     tags: ["Schema"],
    //     summary: "Delete schema",
    //     description: "Delete a schema and all its data permanently",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name to delete"
    //       }
    //     ],
    //     responses: {
    //       "200": {
    //         description: "Schema deleted successfully"
    //       }
    //     }
    //   },
    //   patch: {
    //     tags: ["Schema"],
    //     summary: "Rename schema",
    //     description: "Rename an existing schema to a new name",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "New schema name"
    //       },
    //       {
    //         in: "query",
    //         name: "sourceName",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Current schema name to rename"
    //       }
    //     ],
    //     responses: {
    //       "200": {
    //         description: "Schema renamed successfully",
    //         content: {
    //           "application/json": {
    //             schema: {
    //               type: "object",
    //               properties: {
    //                 data: {
    //                   description: "Rename operation result"
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       },
    //       "400": {
    //         description: "Bad request - schema already exists or missing sourceName"
    //       },
    //       "500": {
    //         description: "Internal server error"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/count": {
    //   get: {
    //     tags: ["Schema"],
    //     summary: "Get schema element counts",
    //     description: "Get the count of nodes and relationships in a schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       }
    //     ],
    //     responses: {
    //       "200": {
    //         description: "Schema element counts retrieved successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/duplicate": {
    //   patch: {
    //     tags: ["Schema"],
    //     summary: "Duplicate schema",
    //     description: "Create a copy of an existing schema with a new name, preserving all data and structure",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "New schema name for the duplicate"
    //       },
    //       {
    //         in: "query",
    //         name: "sourceName",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Source schema name to duplicate from"
    //       }
    //     ],
    //     responses: {
    //       "200": {
    //         description: "Schema duplicated successfully",
    //         content: {
    //           "application/json": {
    //             schema: {
    //               type: "object",
    //               properties: {
    //                 result: {
    //                   description: "Duplication operation result"
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       },
    //       "400": {
    //         description: "Bad request - missing sourceName parameter"
    //       },
    //       "500": {
    //         description: "Internal server error"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/new": {
    //   post: {
    //     tags: ["Schema"],
    //     summary: "Create node or relationship in schema (Backend Endpoint)",
    //     description: "The actual backend endpoint for creating nodes and relationships. Use type=true for nodes, type=false for relationships. The label parameter is where you specify the labels to add to the node or relationship type.",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 description: "true for node creation, false for relationship creation",
    //                 example: true
    //               },
    //               label: {
    //                 type: "array",
    //                 items: {
    //                   type: "string"
    //                 },
    //                 description: "For nodes: Labels to add to the node (multiple labels supported, e.g., ['Person', 'User']). For relationships: Relationship type (only first label used, e.g., ['KNOWS']).",
    //                 example: ["Person", "User"]
    //               },
    //               attributes: {
    //                 type: "array",
    //                 items: {
    //                   type: "array",
    //                   items: {
    //                     anyOf: [
    //                       { type: "string" },
    //                       { 
    //                         type: "array",
    //                         items: { type: "string" }
    //                       }
    //                     ]
    //                   },
    //                   minItems: 2,
    //                   maxItems: 2
    //                 },
    //                 description: "Attribute definitions: [[key, [type, default, unique, required]], ...]. Example: [[\"name\", [\"STRING\", \"\", \"false\", \"true\"]], [\"age\", [\"INTEGER\", \"0\", \"false\", \"false\"]]]",
    //                 example: [
    //                   ["name", ["STRING", "", "false", "true"]],
    //                   ["age", ["INTEGER", "0", "false", "false"]]
    //                 ]
    //               },
    //               selectedNodes: {
    //                 type: "array",
    //                 items: {
    //                   type: "object",
    //                   properties: {
    //                     id: { type: "number" }
    //                   }
    //                 },
    //                 minItems: 2,
    //                 maxItems: 2,
    //                 description: "Required for relationship creation only. Source and target nodes for the relationship.",
    //                 example: [{"id": 1}, {"id": 2}]
    //               }
    //             },
    //             required: ["type", "label", "attributes"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Node or relationship created successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/nodes": {
    //   post: {
    //     tags: ["Schema"],
    //     summary: "Create node in schema",
    //     description: "Create a new node in the specified schema. Multiple labels are supported and will be joined with colons (e.g., :Person:User). This endpoint actually maps to /api/schema/{schema}/new in the backend with type=true.",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [true],
    //                 description: "Must be true for node creation",
    //                 example: true
    //               },
    //               label: {
    //                 type: "array",
    //                 items: {
    //                   type: "string"
    //                 },
    //                 description: "Labels for the node (multiple labels supported)",
    //                 example: ["Person", "User"]
    //               },
    //               attributes: {
    //                 type: "array",
    //                 items: {
    //                   type: "array",
    //                   items: {
    //                     anyOf: [
    //                       { type: "string" },
    //                       { 
    //                         type: "array",
    //                         items: { type: "string" }
    //                       }
    //                     ]
    //                   },
    //                   minItems: 2,
    //                   maxItems: 2
    //                 },
    //                 description: "Attribute definitions: [[key, [type, default, unique, required]], ...]. Example: [[\"name\", [\"STRING\", \"\", \"false\", \"true\"]], [\"age\", [\"INTEGER\", \"0\", \"false\", \"false\"]]]",
    //                 example: [
    //                   ["name", ["STRING", "", "false", "true"]],
    //                   ["age", ["INTEGER", "0", "false", "false"]]
    //                 ]
    //               }
    //             },
    //             required: ["type", "label", "attributes"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Node created successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/relationships": {
    //   post: {
    //     tags: ["Schema"],
    //     summary: "Create relationship in schema",
    //     description: "Create a new relationship between two nodes in the specified schema. Only the first label in the array is used as the relationship type. This endpoint actually maps to /api/schema/{schema}/new in the backend with type=false.",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [false],
    //                 description: "Must be false for relationship creation",
    //                 example: false
    //               },
    //               label: {
    //                 type: "array",
    //                 items: {
    //                   type: "string"
    //                 },
    //                 description: "Relationship type (only first label used)",
    //                 example: ["KNOWS"]
    //               },
    //               attributes: {
    //                 type: "array",
    //                 items: {
    //                   type: "array",
    //                   items: {
    //                     anyOf: [
    //                       { type: "string" },
    //                       { 
    //                         type: "array",
    //                         items: { type: "string" }
    //                       }
    //                     ]
    //                   },
    //                   minItems: 2,
    //                   maxItems: 2
    //                 },
    //                 description: "Attribute definitions: [[key, [type, default, unique, required]], ...]. Example: [[\"since\", [\"STRING\", \"2024\", \"false\", \"false\"]]]",
    //                 example: [
    //                   ["since", ["STRING", "2024", "false", "false"]]
    //                 ]
    //               },
    //               selectedNodes: {
    //                 type: "array",
    //                 items: {
    //                   type: "object",
    //                   properties: {
    //                     id: { type: "number" }
    //                   }
    //                 },
    //                 minItems: 2,
    //                 maxItems: 2,
    //                 description: "Source and target nodes for the relationship",
    //                 example: [{"id": 1}, {"id": 2}]
    //               }
    //             },
    //             required: ["type", "label", "attributes", "selectedNodes"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Relationship created successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/{element}": {
    //   delete: {
    //     tags: ["Schema"],
    //     summary: "Delete element from schema",
    //     description: "Delete a specific element from the schema by ID. Set type=true for node deletion.",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       },
    //       {
    //         in: "path",
    //         name: "element",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Element ID to delete"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [true],
    //                 description: "Must be true for node deletion",
    //                 example: true
    //               }
    //             },
    //             required: ["type"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Element deleted successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/{relationshipId}": {
    //   delete: {
    //     tags: ["Schema"],
    //     summary: "Delete relationship from schema",
    //     description: "Delete a specific relationship from the schema by ID. Set type=false for relationship deletion.",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       },
    //       {
    //         in: "path",
    //         name: "relationshipId",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Relationship ID to delete"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [false],
    //                 description: "Must be false for relationship deletion",
    //                 example: false
    //               }
    //             },
    //             required: ["type"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Relationship deleted successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/{element}/label": {
    //   post: {
    //     tags: ["Schema"],
    //     summary: "Add label to element",
    //     description: "Add a new label to an existing element in the schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       },
    //       {
    //         in: "path",
    //         name: "element",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Element ID"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               label: {
    //                 type: "string",
    //                 description: "Label to add to the element",
    //                 example: "your_label"
    //               }
    //             },
    //             required: ["label"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Label added successfully"
    //       }
    //     }
    //   },
    //   delete: {
    //     tags: ["Schema"],
    //     summary: "Remove label from element",
    //     description: "Remove a specific label from an existing element in the schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name"
    //       },
    //       {
    //         in: "path",
    //         name: "element",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Element ID"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               label: {
    //                 type: "string",
    //                 description: "Label to remove from the element",
    //                 example: "your_label"
    //               }
    //             },
    //             required: ["label"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Label removed successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/{element}/{key}": {
    //   patch: {
    //     tags: ["Schema"],
    //     summary: "Add/Update attribute on element",
    //     description: "Add a new attribute or update an existing attribute on an element in the schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name",
    //         example: "test"
    //       },
    //       {
    //         in: "path",
    //         name: "element",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Element ID",
    //         example: "2"
    //       },
    //       {
    //         in: "path",
    //         name: "key",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Attribute key to add/update",
    //         example: "attribute_key"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [true],
    //                 description: "Must be true for node attributes",
    //                 example: true
    //               },
    //               attribute: {
    //                 type: "array",
    //                 items: {
    //                   type: "string"
    //                 },
    //                 description: "Attribute configuration [type, default, unique, required]",
    //                 example: ["STRING", "your_description", "false", "true"]
    //               }
    //             },
    //             required: ["type", "attribute"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Attribute added/updated successfully"
    //       }
    //     }
    //   },
    //   delete: {
    //     tags: ["Schema"],
    //     summary: "Remove attribute from element",
    //     description: "Remove a specific attribute from an element in the schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name",
    //         example: "test"
    //       },
    //       {
    //         in: "path",
    //         name: "element",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Element ID",
    //         example: "2"
    //       },
    //       {
    //         in: "path",
    //         name: "key",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Attribute key to remove",
    //         example: "attribute_key"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [true],
    //                 description: "Must be true for node attributes",
    //                 example: true
    //               }
    //             },
    //             required: ["type"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Attribute removed successfully"
    //       }
    //     }
    //   }
    // },
    // "/api/schema/{schema}/{relationshipId}/{key}": {
    //   patch: {
    //     tags: ["Schema"],
    //     summary: "Add/Update attribute to relationship",
    //     description: "Add a new attribute or update an existing attribute on a relationship in the schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name",
    //         example: "test"
    //       },
    //       {
    //         in: "path",
    //         name: "relationshipId",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Relationship ID",
    //         example: "1"
    //       },
    //       {
    //         in: "path",
    //         name: "key",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Attribute key to add/update",
    //         example: "since"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [false],
    //                 description: "Must be false for relationship attributes",
    //                 example: false
    //               },
    //               attribute: {
    //                 type: "array",
    //                 items: {
    //                   type: "string"
    //                 },
    //                 description: "Attribute configuration [type, default, unique, required]",
    //                 example: ["STRING", "2024", "false", "false"]
    //               }
    //             },
    //             required: ["type", "attribute"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Attribute added/updated successfully"
    //       }
    //     }
    //   },
    //   delete: {
    //     tags: ["Schema"],
    //     summary: "Remove attribute from relationship",
    //     description: "Remove a specific attribute from a relationship in the schema",
    //     security: [{ bearerAuth: [] }],
    //     parameters: [
    //       {
    //         in: "path",
    //         name: "schema",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Schema name",
    //         example: "test"
    //       },
    //       {
    //         in: "path",
    //         name: "relationshipId",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Relationship ID",
    //         example: "1"
    //       },
    //       {
    //         in: "path",
    //         name: "key",
    //         required: true,
    //         schema: {
    //           type: "string"
    //         },
    //         description: "Attribute key to remove",
    //         example: "since"
    //       }
    //     ],
    //     requestBody: {
    //       required: true,
    //       content: {
    //         "application/json": {
    //           schema: {
    //             type: "object",
    //             properties: {
    //               type: {
    //                 type: "boolean",
    //                 enum: [false],
    //                 description: "Must be false for relationship attributes",
    //                 example: false
    //               }
    //             },
    //             required: ["type"]
    //           }
    //         }
    //       }
    //     },
    //     responses: {
    //       "200": {
    //         description: "Attribute removed successfully"
    //       }
    //     }
    //   }
    // },
    "/api/user": {
      get: {
        tags: ["Users"],
        summary: "List all users",
        description: "Get a list of all FalkorDB users",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of users retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          username: {
                            type: "string",
                            example: "john_doe"
                          },
                          role: {
                            type: "string",
                            enum: ["Admin", "Read-Write", "Read-Only"],
                            example: "Read-Write"
                          },
                          selected: {
                            type: "boolean",
                            example: false
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      post: {
        tags: ["Users"],
        summary: "Create new user",
        description: "Create a new FalkorDB user with specified username, password, and role",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: {
                    type: "string",
                    description: "Username for the new user",
                    example: "new_user"
                  },
                  password: {
                    type: "string",
                    description: "Password for the new user",
                    example: "secure_password"
                  },
                  role: {
                    type: "string",
                    enum: ["Admin", "Read-Write", "Read-Only"],
                    description: "Role to assign to the user",
                    example: "Read-Write"
                  }
                },
                required: ["username", "password", "role"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Success"
                    }
                  }
                }
              }
            },
            headers: {
              location: {
                description: "Location of the created user resource",
                schema: {
                  type: "string",
                  example: "/api/db/user/new_user"
                }
              }
            }
          },
          "400": {
            description: "Bad request - missing parameters"
          },
          "409": {
            description: "User already exists"
          },
          "500": {
            description: "Internal server error"
          }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Delete multiple users",
        description: "Delete multiple FalkorDB users by providing an array of usernames",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  users: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        username: {
                          type: "string",
                          description: "Username of the user to delete"
                        }
                      }
                    },
                    description: "Array of user objects to delete",
                    example: [
                      { username: "user_1741261105156" },
                      { username: "another_user" }
                    ]
                  }
                },
                required: ["users"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Users deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Users deleted"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request"
          },
          "500": {
            description: "Internal server error"
          }
        }
      }
    },
    "/api/user/{user}": {
      patch: {
        tags: ["Users"],
        summary: "Update user role",
        description: "Update the role of a FalkorDB user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "user",
            required: true,
            schema: {
              type: "string"
            },
            description: "Username to update"
          },
          {
            in: "query",
            name: "role",
            required: true,
            schema: {
              type: "string",
              enum: ["Admin", "Read-Write", "Read-Only"]
            },
            description: "New role for the user"
          }
        ],
        responses: {
          "200": {
            description: "User role updated successfully"
          }
        }
      }
    }
  }
};

export default swaggerSpec;
