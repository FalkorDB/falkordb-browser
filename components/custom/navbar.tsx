/* eslint-disable jsx-a11y/anchor-is-valid */
import { Activity, Info, LogOut, Moon, Sun, Waypoints } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"
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

export default function Navbar({ collapsed }: { collapsed: boolean }) {
  const { status } = useSession()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathName = usePathname()
  const darkmode = theme === "dark" || (theme === "system" && systemTheme === "dark")
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className='w-full h-full bg-gray-100 dark:bg-gray-800 py-5 flex flex-col justify-between'>
      <ul className={`flex flex-col gap-5 ${collapsed ? "items-center" : "justify-start pl-2"}`}>
        {status === "authenticated" &&
          linksUp.map((link, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index}>
              <Link
                className={cn("underline underline-offset-2 flex gap-2", pathName === link.href ? '' : 'text-blue-300')}
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
      <ul className={`flex flex-col gap-5 ${collapsed ? "items-center" : "justify-start pl-2"}`}>
        <li key={0}>
          {
            mounted &&
            <button type="button" className="flex flex-row items-center gap-2 underline underline-offset-2 text-blue-300" onClick={() => setTheme(darkmode ? "light" : "dark")}>
              {
                darkmode ? <Sun /> : <Moon />
              }
              {
                !collapsed &&
                <Label className="cursor-pointer text-md" htmlFor="dark-mode">{`${theme === "dark" ? "light" : "dark"} mode`}</Label>
              }
            </button>
          }
        </li>
        {
          linksDown.map((link, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index + 1}>
              <Link
                title={link.name}
                className={cn("underline underline-offset-2 flex gap-2", pathName === link.href ? '' : 'text-blue-300')}
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
        <li key={linksDown.length + 1} className={`${!collapsed ? "flex flex-row items-center gap-1" : "flex justify-center"}`}>
          <a href="https://github.com/falkordb/falkordb-browser" className="flex justify-center" title="Github repository" aria-label="Github repository">
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
    </nav>
  )
}