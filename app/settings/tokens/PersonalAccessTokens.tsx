"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Input from "@/app/components/ui/Input";
import { IndicatorContext } from "@/app/components/provider";
import { securedFetch } from "@/lib/utils";
import { Copy, Plus, Trash2 } from "lucide-react";

interface Token {
  token_id: string;
  name: string;
  created_at: string;
  last_used: string | null;
  expires_at: string | null;
  role?: string;
  username: string;
}

interface GeneratedToken {
  token: string;
  name: string;
  expiresIn: string;
  customExpirationDate?: string;
}

export default function PersonalAccessTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [generatedToken, setGeneratedToken] = useState<GeneratedToken | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  
  // Form state
  const [tokenName, setTokenName] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");
  const [customExpirationDate, setCustomExpirationDate] = useState("");
  
  const { toast } = useToast();
  const { setIndicator } = useContext(IndicatorContext);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    const result = await securedFetch("/api/auth/tokens", {
      method: "GET",
    }, toast, setIndicator);

    if (result.ok) {
      const data = await result.json();
      setTokens(data.tokens || []);
      setUserRole(data.role || "");
    }
    setLoading(false);
  }, [toast, setIndicator]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const generateToken = async () => {
    if (!tokenName.trim()) {
      toast({
        title: "Error",
        description: "Token name is required",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Calculate expiration date based on selection
      let expiresAt: string | null = null;
      let ttlSeconds: number | undefined;
      
      switch (expiresIn) {
        case "30d":
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          ttlSeconds = 30 * 24 * 60 * 60;
          break;
        case "60d":
          expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
          ttlSeconds = 60 * 24 * 60 * 60;
          break;
        case "90d":
          expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
          ttlSeconds = 90 * 24 * 60 * 60;
          break;
        case "custom": {
          if (!customExpirationDate) {
            toast({
              title: "Error",
              description: "Please select a custom expiration date",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
          const customDate = new Date(customExpirationDate);
          // Set to end of day (23:59:59) for better UX
          customDate.setHours(23, 59, 59, 999);
          const now = new Date();
          
          if (customDate <= now) {
            toast({
              title: "Error",
              description: "Expiration date must be in the future",
              variant: "destructive",
            });
            setIsGenerating(false);
            return;
          }
          
          expiresAt = customDate.toISOString();
          ttlSeconds = Math.floor((customDate.getTime() - now.getTime()) / 1000);
          break;
        }
        case "never":
        default:
          expiresAt = null;
          ttlSeconds = undefined;
          break;
      }
      
      const result = await securedFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tokenName,
          expiresAt,
          ...(ttlSeconds !== undefined ? { ttlSeconds } : {}),
        }),
      }, toast, setIndicator);

      if (result.ok) {
        const data = await result.json();
        setGeneratedToken({
          token: data.token,
          name: tokenName,
          expiresIn,
          customExpirationDate: expiresIn === "custom" ? customExpirationDate : undefined,
        });
        
        // Reset form
        setTokenName("");
        setExpiresIn("never");
        setCustomExpirationDate("");
        setGenerateDialogOpen(false);
        
        // Refresh token list
        await fetchTokens();
        
        toast({
          title: "Success",
          description: "Personal access token generated successfully",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    setIsRevoking(true);
    try {
      const result = await securedFetch("/api/auth/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token_id: tokenId,
        }),
      }, toast, setIndicator);

      if (result.ok) {
        setTokens(prev => prev.filter(t => t.token_id !== tokenId));
        setDeleteDialogOpen(false);
        setSelectedToken(null);
        
        toast({
          title: "Success",
          description: "Token revoked successfully",
        });
      }
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Token copied to clipboard",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getExpirationLabel = (expires: string, customDate?: string) => {
    switch (expires) {
      case "30d": return "30 days";
      case "60d": return "60 days";
      case "90d": return "90 days";
      case "custom": 
        return customDate 
          ? new Date(customDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : "Custom";
      case "never": return "No expiration";
      default: return expires;
    }
  };

  return (
    <div className="space-y-6 h-full overflow-auto">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personal Access Tokens</h2>
          <p className="text-muted-foreground">
            Generate tokens to authenticate with the FalkorDB API without using your password.
          </p>
        </div>
        <Button onClick={() => setGenerateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate new token
        </Button>
      </div>

      {/* One-time token display */}
      {generatedToken && (
        <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-2xl">✅</div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-green-900 dark:text-green-100">
                    Your personal access token has been generated!
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    Make sure to copy your token now. <strong>You won&apos;t be able to see it again!</strong>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Your new token:
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedToken.token}
                    readOnly
                    className="font-mono text-sm bg-white dark:bg-gray-900 border-green-300 dark:border-green-700"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedToken.token)}
                    className="border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 rounded-md bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-xs text-muted-foreground">Token Name</p>
                  <p className="font-medium text-sm">{generatedToken.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiration</p>
                  <p className="font-medium text-sm">{getExpirationLabel(generatedToken.expiresIn, generatedToken.customExpirationDate)}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setGeneratedToken(null)}
                  className="text-green-900 hover:text-green-950 dark:text-green-100 dark:hover:text-green-50"
                >
                  I&apos;ve saved my token, dismiss this message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tokens list */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Active Tokens</CardTitle>
          <CardDescription>
            Tokens you&apos;ve generated that can be used to access the API
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto max-h-96">
          {loading && (
            <p className="text-center text-muted-foreground py-8">Loading tokens...</p>
          )}
          {!loading && tokens.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No active tokens. Generate one to get started.
            </p>
          )}
          {!loading && tokens.length > 0 && (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {userRole === "Admin" && <TableHead>Username</TableHead>}
                    {userRole === "Admin" && <TableHead>Role</TableHead>}
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.token_id}>
                      <TableCell className="font-medium">{token.name}</TableCell>
                      {userRole === "Admin" && (
                        <TableCell>{token.username || "default"}</TableCell>
                      )}
                      {userRole === "Admin" && (
                        <TableCell>{token.role || "N/A"}</TableCell>
                      )}
                      <TableCell>{formatDate(token.created_at)}</TableCell>
                      <TableCell>{formatDate(token.last_used)}</TableCell>
                      <TableCell>
                        {token.expires_at ? formatDate(token.expires_at) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedToken(token);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate token dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Generate Personal Access Token</DialogTitle>
            <DialogDescription className="text-base">
              Create a new token to authenticate with the FalkorDB API. This token will have the same permissions as your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="token-name" className="text-base font-semibold flex items-center gap-1">
                Token name 
                <span className="text-destructive text-lg">*</span>
              </Label>
              <Input
                id="token-name"
                placeholder=""
                value={tokenName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenName(e.target.value)}
                disabled={isGenerating}
                className="text-base h-10 w-full max-w-2xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGenerating) {
                    generateToken();
                  }
                }}
              />
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-0.5">💡</span>
                <span>Choose a descriptive name to help you identify where this token is being used</span>
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="expiration" className="text-base font-semibold">
                Expiration
              </Label>
              <Select value={expiresIn} onValueChange={setExpiresIn} disabled={isGenerating}>
                <SelectTrigger id="expiration" className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">
                    <div className="flex items-center gap-2">
                      <span>30 days</span>
                      <span className="text-xs text-muted-foreground">
                        - {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="60d">
                    <div className="flex items-center gap-2">
                      <span>60 days</span>
                      <span className="text-xs text-muted-foreground">
                        - {new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="90d">
                    <div className="flex items-center gap-2">
                      <span>90 days</span>
                      <span className="text-xs text-muted-foreground">
                        - {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <span>Custom</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="never">
                    <div className="flex items-center gap-2">
                      <span>No expiration</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {expiresIn === "custom" && (
                <div className="space-y-3 mt-4">
                  <Label htmlFor="custom-date" className="text-sm p-2">
                    Select expiration date
                  </Label>
                  <Input
                    id="custom-date"
                    type="date"
                    value={customExpirationDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomExpirationDate(e.target.value)}
                    disabled={isGenerating}
                    min={new Date().toISOString().slice(0, 10)}
                    className="text-base h-10"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-0.5">🔒</span>
                <span>For security, we recommend setting an expiration date for your tokens</span>
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <span className="mt-0.5 text-base">⚠️</span>
                <span>
                  <strong>Important:</strong> You&apos;ll only be able to see this token once. Make sure to copy it and store it securely before closing this dialog.
                </span>
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setGenerateDialogOpen(false);
                setTokenName("");
                setExpiresIn("never");
                setCustomExpirationDate("");
              }}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={generateToken}
              disabled={isGenerating || !tokenName.trim()}
            >
              {isGenerating ? "Generating..." : "Generate token"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Token</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the token &quot;{selectedToken?.name}&quot;? 
              This action cannot be undone and any applications using this token will no longer be able to access the API.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isRevoking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedToken && revokeToken(selectedToken.token_id)}
              disabled={isRevoking}
            >
              {isRevoking ? "Revoking..." : "Revoke token"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
