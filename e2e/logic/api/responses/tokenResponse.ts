export interface Token {
  token_id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
}

export interface ListTokensResponse {
  tokens: Token[];
}

export interface TokenDetailsResponse {
  token_id: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
}
