/* eslint-disable jsx-a11y/anchor-is-valid */
import { Activity, Info, LogOut, Menu, Waypoints } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import GithubMark from "./GithubMark";

export interface LinkDefinition {
  name: string,
  href: string,
  icon: JSX.Element,
  onClick?: () => void
}

const linksUp: LinkDefinition[] = [
  {
    name: "Connection Details",
    href: "/details",
    icon: (<Info className="h-6 w-6" />),
  },
  {
    name: "Graph",
    href: "/graph",
    icon: (<Waypoints className="h-6 w-6" />),
  },
  {
    name: "Monitor",
    // href: "/api/monitor",
    href: "/monitor",
    icon: (<Activity className="h-6 w-6" />),
  },
]

const linksDown: LinkDefinition[] = [
  {
    name: "Disconnect",
    href: "",
    icon: (<LogOut className="h-6 w-6" />),
    onClick: () => { signOut({ callbackUrl: '/login' }) }
  },
]

export default function Navbar({ collapsed, onExpand }: { collapsed: boolean, onExpand: () => void }) {
  const { status } = useSession()
  const { theme, setTheme, systemTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const pathName = usePathname()
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
    <>
      <nav className="w-full h-full bg-gray-100 dark:bg-gray-800 p-5 pb-16 flex flex-col justify-between ">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="" onClick={onExpand}>
              <Menu className="h-6 w-6" />
            </Link>
            {!collapsed && (<span className="font-bold">FalkorDB Browser</span>)}
          </div>
          {status === "authenticated" &&
            <ul className="space-y-4">
              {
                linksUp.map((link, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={index} className="flex items-center space-x-2">
                    <Link title={link.name} className={cn("underline underline-offset-2 flex space-x-2", pathName === link.href ? 'text-blue-300' : '')}
                      href={link.href} onClick={link.onClick}>
                      {link.icon} {!collapsed && (<p> {link.name}</p>)}
                    </Link>
                  </li>
                ))
              }
            </ul>
          }
        </div>
        <div className="space-y-4">
          {
            mounted &&
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={darkmode} onCheckedChange={setDarkMode} />
              {!collapsed && (<Label htmlFor="dark-mode">{`${theme} mode`}</Label>)}
            </div>
          }
          {
                linksDown.map((link, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={index} className="flex items-center space-x-2">
                    <Link title={link.name} className={cn("underline underline-offset-2 flex space-x-2", pathName === link.href ? 'text-blue-300' : '')}
                      href={link.href} onClick={link.onClick}>
                      {link.icon} {!collapsed && (<p> {link.name}</p>)}
                    </Link>
                  </li>
                ))
              }
        </div>
      </nav>
      <footer className="pl-5 pb-3 flex flex-row items-center space-x-1 fixed bottom-1 text-xs">
        <a href="https://github.com/falkordb/falkordb-browser" title="Github repository" aria-label="Github repository">
          <GithubMark darkMode={darkmode} className="h-4 w-4" />
        </a>
        <span>Made by</span>
        <a className="underline" href="https://www.falkordb.com">FalkorDB</a>
      </footer>
    </>
  )
}
