"use client"

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import UserMenu from "./UserMenu";
import Image from "next/image";
import { 
  Home, 
  Shield,
  Users,
  Building,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogIn = async () => {
    router.push('/login');
  };

  const handleRegister = async () => {
    router.push('/register');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };


  if (!session) {
    return (
    <nav className="bg-white shadow-sm border-b fixed shadow-md z-100 px-4 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
          <Link href="/" className="flex items-center">
            {/* Mobile (sm and below) */}
            <Image
              src="/images/logo.png"
              alt="Aceromax"
              height={32}
              width={100}
              className="h-8 w-auto block sm:hidden"
              priority
            />
            {/* Default (sm and above) */}
            <Image
              src="/images/brand.png"
              alt="Aceromax"
              height={32}
              width={100}
              className="h-8 w-auto hidden sm:block"
              priority
            />
          </Link>
          </div>

          <div className="flex items-center space-x-4">
            {pathname == "/" && 
              <>
              <div className="sm:flex items-center space-x-4 hidden">
                <a
                  href="#how-it-works"
                  className="text-base font-normal leading-6 text-gray-700 hover:text-sky-700 transition-colors"
                  onClick={e => {
                      e.preventDefault();
                      const el = document.getElementById("how-it-works");
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.pageYOffset - 75;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                  }}
                >
                  How It Works
                </a>
                <a
                  href="#benefits"
                  className="text-base font-normal leading-6 text-gray-700 hover:text-sky-700 transition-colors"
                  onClick={e => {
                      e.preventDefault();
                      const el = document.getElementById("benefits");
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.pageYOffset - 75;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                  }}
                >
                  Benefits
                </a>
                <a
                  href="#users-say"
                  className="text-base font-normal leading-6 text-gray-700 hover:text-sky-700 transition-colors"
                  onClick={e => {
                      e.preventDefault();
                      const el = document.getElementById("users-say");
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.pageYOffset - 75;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                  }}
                >
                  Waitlist
                </a>
              </div>
              <Button
                onClick={handleLogIn}
                variant="outline"
                size="sm"
                className="flex items-center ml-4"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </>}
            {pathname === "/login" && 
              <>
              <span className="sm:flex hidden">New to Aceromax?</span>
              <Button
                onClick={handleRegister}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
              </>
            }
            {pathname === "/register" && 
            <>
            <span className="sm:flex hidden">Already have an account?</span>
            <Button
              onClick={handleLogIn}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            </>
            }
          </div>
        </div>
      </div>
    </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b fixed shadow-md z-100 px-4 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
         <div className="flex items-center">
          <Link href="/" className="flex items-center">
            {/* Mobile (sm and below) */}
            <Image
              src="/images/logo.png"
              alt="Aceromax"
              height={32}
              width={100}
              className="h-8 w-auto block sm:hidden"
              priority
            />
            {/* Default (sm and above) */}
            <Image
              src="/images/brand.png"
              alt="Aceromax"
              height={32}
              width={100}
              className="h-8 w-auto hidden sm:block"
              priority
            />
          </Link>
        </div>

          {/* Navigation Links */}
          <div className="flex items-center">
            {session.user.role === "admin" && 
              <>
                <Link
                  href="/admin"
                  className="flex items-center px-2 sm:mx-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
                >
                  <Shield className="w-5 h-5 sm:mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center py-2 sm:mx-3 rounded-md text-sm font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
                >
                  <Users className="w-5 h-5 sm:mr-2" />
                  Users
                </Link> 
              </>
            }
            {session.user.role === "superadmin" && 
              <>
              <Link
                href="/admin/branches"
                className="flex items-center px-2 sm:mx-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
              >
                <Building className="w-5 h-5 sm:mr-2" />
                Branches
              </Link> 
              <Link
                href="/admin/users"
                className="flex items-center py-2 sm:mx-3 rounded-md text-sm font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
              >
                <Users className="w-5 h-5 sm:mr-2" />
                Users
              </Link> 
            </>
            }
            {session.user.role === "customer" && 
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-sky-600 hover:bg-gray-50"
              >
                <Home className="w-5 h-5 sm:mr-2" />
                Dashboard
              </Link>
            }
          </div>

          <UserMenu session={session} handleSignOut={handleSignOut} />
        </div>
      </div>
    </nav>
  );
}
