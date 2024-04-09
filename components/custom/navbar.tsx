/* eslint-disable jsx-a11y/anchor-is-valid */
import { Activity, Info, LogOut, Menu, Settings, Waypoints } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import GithubMark from "./GithubMark";
import { DropdownMenu, DropdownMenuContent } from "../ui/dropdown-menu";

export interface LinkDefinition {
  name: string,
  href: string,
  icon: JSX.Element,
  onClick?: () => void
}

const linksUp: LinkDefinition[] = [
  {
    name: "Graph",
    href: "/graph",
    icon: (<Waypoints className="h-6 w-6" />),
  },
  {
    name: "Monitor",
    href: "/monitor",
    icon: (<Activity className="h-6 w-6" />),
  },
]

const linksDown: LinkDefinition[] = [
  {
    name: "Connection Details",
    href: "/details",
    icon: (<Info className="h-6 w-6" />),
  },
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
    <nav className={`w-full h-full bg-gray-100 dark:bg-gray-800 py-7 flex flex-col justify-between ${collapsed ? "items-center" : "justify-start"}`}>
      <div className={`${!collapsed && pl-2}`}>
        <Link href="" onClick={onExpand}>
          <Menu className="h-6 w-6" />
        </Link>
        {status === "authenticated" &&
          <ul className="flex flex-col gap-5 pt-5">
            {
              linksUp.map((link, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index}>
                  <Link
                    className={cn("underline underline-offset-2 flex gap-2", pathName === link.href ? 'text-blue-300' : '')}
                    href={link.href} onClick={link.onClick}
                  >
                    {link.icon}
                    {
                      !collapsed &&
                      <div className="flex flex-col">
                        {/* eslint-disable-next-line react/no-array-index-key */}
                        {link.name.split(" ").map((str, strIndex) => <p key={strIndex}>{str}</p>)}
                      </div>}
                  </Link>
                </li>
              ))
            }
          </ul>
        }
      </div>
      <div className={`${!collapsed && pl-2}`}>
        <ul className="flex flex-col gap-5">
          <li key={0}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-row gap-2">
                  <Settings />
                  {
                    !collapsed &&
                    <p className="underline underline-offset-2">Settings</p>
                  }
                </div>
              </DropdownMenuTrigger>
              {
                mounted &&
                <DropdownMenuContent side="right" className="flex flex-col justify-center p-3">
                  <div className="flex items-center gap-2">
                    <Switch id="dark-mode" checked={darkmode} onCheckedChange={setDarkMode} />
                    <Label htmlFor="dark-mode">{`${theme} mode`}</Label>
                  </div>
                </DropdownMenuContent>
              }
            </DropdownMenu>
          </li>
          {
            linksDown.map((link, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index + 1}>
                <Link
                  title={link.name}
                  className={cn("underline underline-offset-2 flex gap-2", pathName === link.href ? 'text-blue-300' : '')}
                  href={link.href} onClick={link.onClick}
                >
                  {link.icon}
                  {
                    !collapsed &&
                    <div className="flex flex-col">
                      {/* eslint-disable-next-line react/no-array-index-key */}
                      {link.name.split(" ").map((str, strIndex) => <p key={strIndex}>{str}</p>)}
                    </div>}
                </Link>
              </li>
            ))
          }
          <li key={linksDown.length + 1} className="flex flex-row items-center gap-1">
            <a href="https://github.com/falkordb/falkordb-browser" title="Github repository" aria-label="Github repository">
              <GithubMark darkMode={darkmode} className="h-4 w-4" />
            </a>
            {
              !collapsed && (
                <>
                  <p className="text-xs">Made by</p>
                  <a className="underline text-xs" href="https://www.falkordb.com">FalkorDB</a>
                </>
              )
            }
          </ li>
        </ul>
      </div>
    </nav>
  )
}