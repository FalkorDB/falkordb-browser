import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full h-full bg-gray-100 p-5">
      <div className="flex items-center space-x-2 border-b pb-4 mb-4">
        <Menu className="h-6 w-6 text-blue-500" />
        <span className="font-bold">Dashboard</span>
      </div>
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
          <LogOut className="h-6 w-6" />
          <Link className="text-blue-600 underline underline-offset-2" onClick={() => signOut({ callbackUrl: '/' })} href="/">
            Sign Out
          </Link>
        </li>
      </ul>
    </nav>
  )
}
