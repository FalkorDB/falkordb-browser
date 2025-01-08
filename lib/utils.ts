/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/prefer-default-export

"use client"

import { type ClassValue, clsx } from "clsx"
import { signOut } from "next-auth/react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function securedFetch(
  input: string | URL | globalThis.Request,
  init: RequestInit,
  toast?: any,
): Promise<Response> {
  const response = await fetch(input, init)
  const { status } = response

  if (status >= 300) {
    response.json().then((err) => {
      if (toast) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        })
      }
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

export const defaultQuery = (q?: string) => q || "MATCH (n) OPTIONAL MATCH (n)-[e]-(m) return n,e,m LIMIT 100"