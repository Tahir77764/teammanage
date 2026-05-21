"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const [status, setStatus] = useState("loading");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }

        const user = await response.json();

        if (requiredRole && user.role !== requiredRole) {
          router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
          return;
        }

        setStatus("authorized");
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (status !== "authorized") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
