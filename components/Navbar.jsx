"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar({ variant = "default" }) {
  const isLanding = variant === "landing";
  const [user, setUser] = useState(null);
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
        router.push("/");
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
            textClassName="text-xl font-bold"
            variant="light"
          />

          <div className={`${isLanding ? "flex" : "hidden md:flex"} items-center ${isLanding ? "gap-2" : "gap-4"}`}>
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 navbar-pill rounded-lg">
                  <span className="text-sm text-blue-50">
                    Welcome, <span className="font-semibold text-white">{user.name}</span>
                  </span>
                </div>

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
                  className={isLanding ? "px-3 py-1.5 rounded-full border border-white/25 text-sm text-white hover:bg-white/15 transition duration-200" : "px-4 py-2 navbar-link-hover text-blue-50"}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={isLanding ? "inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-white text-sm text-blue-700 font-semibold shadow-lg shadow-blue-500/20 hover:bg-slate-100 transition duration-200" : "px-4 py-2 navbar-cta"}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>

        {!isLanding && (
          <div className="flex flex-wrap items-center gap-3 md:hidden mt-4 justify-end">
            {user ? (
              <>
                <div className="flex items-center justify-between gap-3 px-4 py-2 navbar-pill rounded-lg text-sm text-blue-50 w-full">
                  <span>
                    Welcome, <span className="font-semibold text-white">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={isLanding ? "inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/25 text-white hover:bg-white/15 transition duration-200" : "inline-flex items-center justify-center px-4 py-2 navbar-link-hover text-blue-50"}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={isLanding ? "inline-flex items-center justify-center px-5 py-2 rounded-full bg-white text-blue-700 font-semibold shadow-lg shadow-blue-500/20 hover:bg-slate-100 transition duration-200" : "inline-flex items-center justify-center px-4 py-2 navbar-cta text-center"}
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
