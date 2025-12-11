export interface Token {
  token_hash: string;
  token_id: string;
  user_id: string;
  username: string;
  name: string;
  role: string;
  host: string;
  port: number;
  created_at: string;
  expires_at: string | null;
  last_used: string | null;
}

export interface ListTokensResponse {
  tokens: Token[];
  count: number;
  role: string;
}

export interface TokenDetailsResponse {
  token_id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
}
