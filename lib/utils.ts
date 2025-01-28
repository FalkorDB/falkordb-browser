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

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  const newR = r / 255;
  const newG = g / 255;
  const newB = b / 255;
  
  const max = Math.max(newR, newG, newB);
  const min = Math.min(newR, newG, newB);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
          case newR: h = (newG - newB) / d + (newG < newB ? 6 : 0); break;
          case newG: h = (newB - newR) / d + 2; break;
          case newB: h = (newR - newG) / d + 4; break;
          default:
      }
      h *= 60;
  }

  return [h, s * 100, l * 100];
}

export const getComplementaryColor = (color: string): string => {
  // Create a temporary div to use canvas color parsing
  const div = document.createElement('div');
  div.style.backgroundColor = color;
  document.body.appendChild(div);
  const rgbColor = window.getComputedStyle(div).backgroundColor;
  document.body.removeChild(div);
  
  // Parse RGB values
  const [r, g, b] = rgbColor.match(/\d+/g)!.map(Number);
  
  // Convert to HSL
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Shift hue by 180 degrees for complementary color
  const newHue = (h + 180) % 360;
  
  // Convert back to RGB
  return `hsl(${newHue}, ${s}%, ${l}%)`;
}