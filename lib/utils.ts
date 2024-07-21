import { toast } from "@/components/ui/use-toast"
import { type ClassValue, clsx } from "clsx"
import { EdgeDataDefinition, NodeDataDefinition } from "cytoscape"
import { signOut } from "next-auth/react"
import { twMerge } from "tailwind-merge"

export type ElementDataDefinition = NodeDataDefinition | EdgeDataDefinition

// eslint-disable-next-line import/prefer-default-export
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/default-param-last
export function Toast(message?: string, type?: string) {
  toast({
    title: type || "Error",
    description: message || "Something Went Wrong",
  })
}

export async function securedFetch(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)
  const { status } = response
  if (status >= 300) {
    response.text().then((message) => {
      Toast(message)
    }).then(() => {
      if (status === 401 || status >= 500) {
        signOut({ callbackUrl: '/login' })
      }
    })
  }
  return response
}

export function prepareArg(arg: string) {
  return encodeURIComponent(arg.trim())
}

export const defaultQuery = (q: string) => q || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) return n,e,m LIMIT 100"