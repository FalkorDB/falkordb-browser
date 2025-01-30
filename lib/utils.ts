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

export const lightenColor = (hex: string): string => {
  // Remove the # if present
  const color = hex.replace('#', '');
  // Convert to RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  // Mix with white (add 20% of the remaining distance to white)
  const lightR = Math.min(255, r + Math.floor((255 - r) * 0.2));
  const lightG = Math.min(255, g + Math.floor((255 - g) * 0.2));
  const lightB = Math.min(255, b + Math.floor((255 - b) * 0.2));
  // Convert back to hex
  return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
}