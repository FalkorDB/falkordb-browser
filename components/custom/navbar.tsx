/* eslint-disable jsx-a11y/anchor-is-valid */
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import GithubMark from "./GithubMark";


export interface LinkDefinition {
  name: string,
  href: string,
  icon: JSX.Element,
  onClick?: () => void
}

export default function Navbar({ links, collapsed, onExpand }: { links: LinkDefinition[], collapsed: boolean, onExpand:()=>void }) {
  const { status } = useSession()
  const { theme, setTheme, systemTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const setDarkMode = (val: boolean) => {
    if (val) {
      setTheme("dark")
    }
    else {
      setTheme("light")
    }
  }

  const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
  return (
    <nav className="w-full h-full bg-gray-100 dark:bg-gray-800 p-5 space-y-4 flex flex-col">
      <div className="flex items-center space-x-2">
        <Link href="" onClick={onExpand}>
          <Menu className="h-6 w-6" />
        </Link>
        {!collapsed && (<span className="font-bold">FalkorDB Browser</span>)}
      </div>
      {
        mounted &&
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={darkmode} onCheckedChange={setDarkMode} />
          {!collapsed && (<Label htmlFor="dark-mode">{`${theme} mode`}</Label>)}
        </div>
      }
      {status === "authenticated" &&
        <ul className="space-y-4">
          {
            links.map((link, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index} className="flex items-center space-x-2">
                  <Link title={link.name} className="underline underline-offset-2 flex space-x-2" href={link.href} onClick={link.onClick}>
                    {link.icon} {!collapsed && (<p> {link.name}</p>)}
                  </Link>
                </li>
              ))
          }
        </ul>
      }
      <footer className="flex flex-row items-center space-x-1 fixed bottom-1 text-xs">
        <a href="https://github.com/falkordb/falkordb-browser" title="Github repository" aria-label="Github repository">
          <GithubMark darkMode={darkmode} className="h-4 w-4" />
        </a>
        <span>Made by</span>
        <a className="underline" href="https://www.falkordb.com">FalkorDB</a>
      </footer>
    </nav>
  )
}
