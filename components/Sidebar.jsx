"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Plus, LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: Users,
      label: "Team Members",
      href: "/admin/teams",
    },
    {
      icon: Plus,
      label: "Create Task",
      href: "/admin/create-task",
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 text-sm text-white shadow-2xl shadow-slate-950/30"
        aria-label="Open sidebar menu"
      >
        <Menu size={18} />
        Menu
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white h-screen flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <Logo
              href="/admin/dashboard"
              size="md"
              showText={true}
              textClassName="text-xl font-bold text-white"
              variant="light"
            />
            <p className="text-xs text-slate-400 mt-2 pl-1">Admin Panel</p>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-slate-700/80 transition"
            aria-label="Close sidebar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200 group"
              >
                <Icon
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
