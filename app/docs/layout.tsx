import type { Metadata } from "next";
import "./docs.css";

export const metadata: Metadata = {
  title: "API Documentation - FalkorDB Browser",
  description: "Interactive API documentation for FalkorDB Browser REST API",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="docs-layout">
      {children}
    </div>
  );
}
