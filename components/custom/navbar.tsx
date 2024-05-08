/* eslint-disable jsx-a11y/anchor-is-valid */
import { Activity, BookOpenText, Info, LogOut, Moon, Sun, Users, Waypoints } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"
import Image from "next/image";
import { Label } from "../ui/label";
import GithubMark from "./GithubMark";

const TEXT_COLOR = "text-blue-600 dark:text-blue-300"
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
  {
    name: "Users",
    href: "/users",
    icon: (<Users className="h-6 w-6" />),
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

export default function Navbar({ isCollapsed, onDocsExpand }: { isCollapsed: boolean, onDocsExpand: () => void }) {
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
      <ul className={`flex flex-col gap-5 ${isCollapsed ? "items-center" : "justify-start pl-2"}`}>
        <li>
          <Link href="https://www.falkordb.com" target="_blank">
            <Image src="/falkordb.svg" alt="FalkorDB Logo" width={100} height={100} />
          </Link>
        </li>
        {status === "authenticated" &&
          linksUp.map((link, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index}>
              <Link
                title={link.name}
                className={cn("underline underline-offset-2 flex gap-2", pathName === link.href ? '' : TEXT_COLOR)}
                href={link.href} onClick={link.onClick}
              >
                {link.icon}
                {
                  !isCollapsed &&
                  <div className="flex flex-col">
                    {/* eslint-disable-next-line react/no-array-index-key */}
                    {link.name.split(" ").map((str, strIndex) => <p key={strIndex}>{str}</p>)}
                  </div>}
              </Link>
            </li>
          ))
        }
      </ul>
      <ul className={`flex flex-col gap-5 ${isCollapsed ? "items-center" : "justify-start pl-2"}`}>
        <li key={0}>
          {
            mounted &&
            <Link title="Theme" type="button" className={cn("flex flex-row items-center gap-2 underline underline-offset-2", TEXT_COLOR)} onClick={() => setTheme(darkmode ? "light" : "dark")} href="">
              {
                darkmode ? <Sun /> : <Moon />
              }
              {
                !isCollapsed &&
                <Label className="cursor-pointer text-md" htmlFor="dark-mode">{`${theme === "dark" ? "light" : "dark"} mode`}</Label>
              }
            </Link>
          }
        </li>
        {
          linksDown.map((link, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index + 1}>
              <Link
                title={link.name}
                className={cn("underline underline-offset-2 flex gap-2", pathName === link.href ? '' : TEXT_COLOR)}
                href={link.href} onClick={link.onClick}
              >
                {link.icon}
                {
                  !isCollapsed &&
                  <div className="flex flex-col">
                    {/* eslint-disable-next-line react/no-array-index-key */}
                    {link.name.split(" ").map((str, strIndex) => <p key={strIndex}>{str}</p>)}
                  </div>}
              </Link>
            </li>
          ))
        }
        <li key={linksDown.length + 1} className={`${!isCollapsed ? "flex flex-row items-center gap-1" : "flex justify-center"}`}>
          <Link title="Documentation" type="button" className={cn("flex flex-row items-center gap-2 underline underline-offset-2", TEXT_COLOR)} onClick={() => onDocsExpand()} href="">
            <BookOpenText/>
            {
              !isCollapsed &&
              <p >Documentation</p>
            }
          </Link>
        </ li>
        <li key={linksDown.length + 2} className={`${!isCollapsed ? "flex flex-row items-center gap-1" : "flex justify-center"}`}>
          <a href="https://github.com/falkordb/falkordb-browser" className="flex justify-center" title="Github repository" aria-label="Github repository">
            <GithubMark darkMode={darkmode} className="h-4 w-4" />
          </a>
          {
            !isCollapsed && (
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