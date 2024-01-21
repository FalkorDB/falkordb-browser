import { Info, LogOut, Menu, Waypoints } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { GithubMark } from "./GithubMark";

export default function Navbar() {
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
      {
        mounted &&
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={darkmode} onCheckedChange={setDarkMode} />
          <Label htmlFor="dark-mode">{`${theme} mode`}</Label>
        </div>
      }
      <div className="flex items-center space-x-2 border-b">
        <Menu className="h-6 w-6" />
        <span className="font-bold">FalkorDB Browser</span>
      </div>
      {status === "authenticated" &&
        <ul className="space-y-2">
          {/* <li className="flex items-center space-x-2">
          <AirVentIcon className="h-6 w-6" />
          <span>Employees</span>
        </li>
        <li className="flex items-center space-x-2">
          <AirVentIcon className="h-6 w-6" />
          <span>Company</span>
        </li>
        <li className="flex items-center space-x-2">
          <AirVentIcon className="h-6 w-6" />
          <span>Candidate</span>
        </li>
        <li className="flex items-center space-x-2">
          <AirVentIcon className="h-6 w-6" />
          <span>Calendar</span>
        </li> */}

          {/* <li className="flex items-center space-x-2">
            <AirVentIcon className="h-6 w-6" />
            <span>Profile</span>
          </li> */}

          <li className="flex items-center space-x-2">
            <Info className="h-6 w-6" />
            <Link className="underline underline-offset-2" href="/details">
              Connection Details
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <Waypoints className="h-6 w-6" />
            <Link className="underline underline-offset-2" href="/graph">
              Graph
            </Link>
          </li>
          <li className="flex items-center space-x-2">
            <LogOut className="h-6 w-6" />
            <Link className="underline underline-offset-2" href="/" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </Link>
          </li>
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
