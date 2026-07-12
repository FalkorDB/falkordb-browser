"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AiFixContext, BrowserSettingsContext } from "./provider";
import { detectProviderFromModel, getProviderDisplayName } from "@/lib/ai-provider-utils";
import { useToast } from "@/components/ui/use-toast";
import ToastButton from "./ToastButton";
import Button from "./ui/Button";

// Always shown when there is a failed query in the toast. On click:
//   - If AI is not configured → shows a "Go to Settings" toast (same pattern as Chat).
//   - If AI is configured but the query has since been edited → no-op (button won't reach here).
//   - If everything is ready → triggers the fix flow via AiFixContext.
export default function AiFixButton({ currentQuery }: { currentQuery: string }) {
    const { aiFixSupported, lastFailure, requestAiFix, result } = useContext(AiFixContext);
    const { settings: { chatSettings: { model, chatApiKeys, selectedChatApiKeyId, secretKey, chatModelSource } } } = useContext(BrowserSettingsContext);
    const { toast } = useToast();
    const router = useRouter();

    // Only hide when there is no active failure for this query (i.e. the user hasn't run a
    // failing query yet, or has since run a different one).
    if (!lastFailure || lastFailure.query.trim() !== currentQuery.trim()) return null;

    const loading = result.status === "loading";

    const handleClick = () => {
        if (aiFixSupported) {
            requestAiFix(lastFailure.query, lastFailure.errorMessage);
            return;
        }

        const goToSettings = (
            <ToastButton
                label="Go to Settings"
                showUndo={false}
                onClick={() => router.push("/settings")}
            />
        );

        if (!model) {
            toast({
                title: "No model selected",
                description: "Please select a model in the settings before using Fix with AI",
                variant: "destructive",
                action: goToSettings,
            });
            return;
        }

        if (chatModelSource === "api-key") {
            // Check provider support first so unsupported providers (e.g. Anthropic, Gemini)
            // get the correct "Provider not supported" message even when no key is configured.
            const provider = detectProviderFromModel(model);
            const supportedApiKeyProviders: ReturnType<typeof detectProviderFromModel>[] = ["openai", "groq", "xai"];
            if (!supportedApiKeyProviders.includes(provider)) {
                const providerName = getProviderDisplayName(provider);
                toast({
                    title: "Provider not supported",
                    description: `Fix with AI requires an OpenAI, Groq, xAI, Ollama, or LM Studio model. "${providerName}" is not supported yet.`,
                    variant: "destructive",
                    action: goToSettings,
                });
                return;
            }

            const resolvedKey = chatApiKeys.find(k => k.id === selectedChatApiKeyId)?.key || secretKey;
            if (!resolvedKey) {
                const providerName = getProviderDisplayName(provider);
                toast({
                    title: "No API Key Provided",
                    description: `Please provide a ${providerName} API key in the settings before using Fix with AI`,
                    variant: "destructive",
                    action: goToSettings,
                });
                return;
            }
        }
    };

    return (
        <Button
            data-testid="fix-with-ai"
            variant="Secondary"
            title="Explain and fix this query with AI"
            disabled={loading}
            onClick={handleClick}
        >
            <Sparkles size={16} />
            {loading ? "Fixing…" : "Fix with AI"}
        </Button>
    );
}
