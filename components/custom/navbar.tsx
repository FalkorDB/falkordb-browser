import { AirVentIcon } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full h-full bg-gray-100 p-5">
      <div className="flex items-center space-x-2 border-b pb-4 mb-4">
        <AirVentIcon className="h-6 w-6 text-blue-500" />
        <span className="font-bold">Dashboard</span>
      </div>
      <ul className="space-y-2">
        <li className="flex items-center space-x-2">
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
        </li>
      </ul>
      <div className="mt-4">
        <ul className="space-y-2">
          <li className="flex items-center space-x-2">
            <AirVentIcon className="h-6 w-6" />
            <span>Profile</span>
          </li>
          <li className="flex items-center space-x-2">
            <AirVentIcon className="h-6 w-6" />
            <span>Setting</span>
          </li>
        </ul>
      </div>
    </nav>
  )
}
