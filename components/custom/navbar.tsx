import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { GithubMark } from "./GithubMark";


export interface LinkDefinition {
  name: string,
  href: string,
  icon: JSX.Element,
  onClick?: () => void
}

export default function Navbar(params: { links: LinkDefinition[], collapsed: boolean, onExpand:()=>void }) {
  const { data: session, status } = useSession()
  const { theme, setTheme, systemTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function setDarkMode(val: boolean) {
    if (val) {
      setTheme("dark")
    }
    else {
      setTheme("light")
    }
  }

  let darkmode = theme == "dark" || (theme == "system" && systemTheme == "dark")
  return (
    <nav className="w-full h-full bg-gray-100 dark:bg-gray-800 p-5 space-y-4 flex flex-col">
      <div className="flex items-center space-x-2 border-b">
        <Link href="" onClick={params.onExpand}><Menu className="h-6 w-6" /></Link>
        {!params.collapsed && (<span className="font-bold">FalkorDB Browser</span>)}
      </div>
      {
        mounted &&
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={darkmode} onCheckedChange={setDarkMode} />
          {!params.collapsed && (<Label htmlFor="dark-mode">{`${theme} mode`}</Label>)}
        </div>
      }
      {status === "authenticated" &&
        <ul className="space-y-4">
          {
            params.links.map((link, index) => {
              return (
                <li key={index} className="flex items-center space-x-2">
                  <Link title={link.name} className="underline underline-offset-2 flex space-x-2" href={link.href} onClick={link.onClick}>
                    {link.icon} {!params.collapsed && (<p> {link.name}</p>)}
                  </Link>
                </li>
              )
            })
          }
        </ul>
      }
      <footer className="flex flex-row items-center space-x-1 fixed bottom-1 text-xs">
        <a href="https://github.com/falkordb/falkordb-browser">{
          <GithubMark darkMode={darkmode} className="h-4 w-4" />
        }
        </a>
        <span>Made by</span>
        <a className="underline" href="https://www.falkordb.com">FalkorDB</a>
      </footer>
    </nav>
  )
}
