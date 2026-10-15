"use client";

import { memo, useMemo } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

// Release bodies carry HTML (a collapsed <details> block), so it is rendered
// and then sanitized, unlike chat messages where HTML stays off.
const md = new MarkdownIt({ html: true, linkify: true });
const defaultLinkOpen = md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet("target", "_blank");
    tokens[idx].attrSet("rel", "noreferrer");
    return defaultLinkOpen(tokens, idx, options, env, self);
};

/** Markdown from a GitHub release, rendered safely. */
const ReleaseMarkdown = memo(function ReleaseMarkdown({ source, className }: { source: string; className?: string }) {
    const html = useMemo(() => DOMPurify.sanitize(md.render(source), { ADD_ATTR: ["target"] }), [source]);
    return <div className={cn("markdown-body release-notes text-sm", className)} dangerouslySetInnerHTML={{ __html: html }} />;
});

export default ReleaseMarkdown;
