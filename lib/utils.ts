import { toast } from "@/components/ui/use-toast"
import { type ClassValue, clsx } from "clsx"
import { signOut } from "next-auth/react"
import { twMerge } from "tailwind-merge"

// eslint-disable-next-line import/prefer-default-export
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function securedFetch(  input: string | URL | globalThis.Request,  init?: RequestInit): Promise<Response> {    
  return fetch(input, init).then((response) => {

    const { status } = response;

    if (status >= 300) {     
      response.text().then((message) => {
        toast({
          title: "Error",
          description: message,
        })
      }).then(() => {
        if (status === 401 || status >= 500) {
          signOut({ callbackUrl: '/login' })
        }
      })
    }

    return response
  })
}


