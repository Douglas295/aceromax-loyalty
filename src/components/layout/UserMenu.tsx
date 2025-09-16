import React from "react";
import { Menu } from "@headlessui/react";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger */}
      <Menu.Button className="flex items-center space-x-2 cursor-pointer">
        <User className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{session.user.name || "User"}</span>
      </Menu.Button>

      {/* Dropdown Items */}
      <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="pl-4 py-2">
          Profile &nbsp;
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
            {session.user.role}
          </span>
        </div>

        <Menu.Item>
          {({ active }) => (
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className={`flex items-center w-full ${active ? "bg-gray-100" : ""}`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
