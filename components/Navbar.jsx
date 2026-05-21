"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar({ variant = "default" }) {
  const isLanding = variant === "landing";
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navShellClass = isLanding ? "navbar-brand-landing" : "navbar-brand";

  return (
    <nav
      className={`${navShellClass} text-white sticky top-0 z-50`}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Logo
            href="/"
            size="sm"
            showText={true}
            textClassName="text-xl font-bold hidden sm:inline"
            variant="light"
          />

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 navbar-pill rounded-lg">
                  <span className="text-sm text-blue-50">
                    Welcome, <span className="font-semibold text-white">{user.name}</span>
                  </span>
                </div>

                {user.role === "admin" ? (
                  <Link
                    href="/admin/dashboard"
                    className="px-3 py-2 navbar-link-hover text-blue-50"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 navbar-link-hover text-blue-50"
                  >
                    User Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="btn-danger px-4 py-2 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 navbar-link-hover text-blue-50"
                >
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 navbar-cta">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 navbar-link-hover"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 space-y-2 animate-fade-in pb-2">
            {user ? (
              <>
                <div className="px-4 py-2 navbar-pill rounded-lg text-sm text-blue-50">
                  Welcome, <span className="font-semibold text-white">{user.name}</span>
                </div>

                {user.role === "admin" ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 navbar-link-hover text-blue-50"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 navbar-link-hover text-blue-50"
                  >
                    User Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full btn btn-danger text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 navbar-link-hover text-blue-50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 navbar-cta text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
