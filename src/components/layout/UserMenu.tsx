import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "customer" | "admin" | "superadmin";
}

interface UserMenuProps {
  session: { user: SessionUser };
  handleSignOut: () => void;
}

export default function UserMenu({ session, handleSignOut }: UserMenuProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "superadmin":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger */}
      <Menu.Button className="group flex items-center space-x-3 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-sm font-medium text-gray-900">{session.user.name || "User"} &nbsp;
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(session.user.role)}`}>
              {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
              </span>
            </span>
            <span className="text-sm font-medium text-gray-900">{session.user.email || "Email"}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </Menu.Button>

      {/* Dropdown Items */}
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-1 w-40 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50">

          {/* Menu Items */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                    active ? "bg-gray-50" : ""
                  }`}
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium">Profile Settings</span>
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors ${
                    active ? "bg-red-50" : ""
                  }`}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
