"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Users,
  ClipboardList,
  BarChart3,
  Shield,
  Zap,
  Calendar,
  LayoutDashboard,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Team Management",
    description:
      "Create and organize teams with multiple members. Invite, assign roles, and administer groups in one place.",
    color: "bg-indigo-100 text-indigo-600",
    ring: "ring-indigo-100",
  },
  {
    icon: ClipboardList,
    title: "Task Assignment",
    description:
      "Assign tasks with clear deadlines, priorities, and owners. Everyone sees what matters right now.",
    color: "bg-sky-100 text-sky-600",
    ring: "ring-sky-100",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Monitor completion rates and team performance with dashboards built for quick decisions.",
    color: "bg-violet-100 text-violet-600",
    ring: "ring-violet-100",
  },
];

const highlights = [
  { icon: Shield, label: "Secure email verification with OTP" },
  { icon: Zap, label: "Role-based access control" },
  { icon: LayoutDashboard, label: "Real-time task status updates" },
  { icon: Calendar, label: "Deadline tracking & reminders" },
  { icon: BarChart3, label: "Dashboard analytics" },
  { icon: Database, label: "MongoDB-powered persistence" },
];

const stats = [
  { value: "Teams", label: "Organize members" },
  { value: "Tasks", label: "Track deliverables" },
  { value: "Insights", label: "Measure progress" },
];

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  return (
    <>
      <Navbar variant="landing" />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden landing-mesh text-white">
          <div className="landing-grid absolute inset-0 pointer-events-none" aria-hidden />
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 md:pt-24 md:pb-36">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm font-medium text-blue-100 mb-8 backdrop-blur-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Team collaboration, simplified
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="text-gradient-hero">Team Management</span>
                <br />
                <span className="text-white/95">that actually works</span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                Efficiently manage teams, assign tasks, and track progress — all in one
                beautiful workspace built for admins and members alike.
              </p>

              {!user ? (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold landing-glow hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm transition-all duration-200"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold landing-glow hover:bg-blue-50 transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Stats strip */}
            <div className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {stats.map((item) => (
                <div
                  key={item.value}
                  className="text-center py-4 px-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <p className="text-xl md:text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs md:text-sm text-blue-200/80 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature cards — high contrast on light background */}
        <section className="relative -mt-12 md:-mt-16 pb-20 md:pb-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16 pt-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-3">
                Why TeamManage
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Everything you need to run your team
              </h2>
              <p className="mt-4 text-slate-600 max-w-xl mx-auto text-lg">
                From onboarding members to closing tasks — stay aligned without the chaos.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {features.map(({ icon: Icon, title, description, color, ring }) => (
                <article key={title} className="landing-card p-8">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${color} ring-4 ${ring} mb-6`}
                  >
                    <Icon className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Key features */}
        <section className="py-16 md:py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-3">
                  Key features
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Built for security, speed, and clarity
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Admins get full control. Members get a focused view of their work. Everyone
                  stays on the same page.
                </p>
              </div>

              <ul className="grid sm:grid-cols-2 gap-4">
                {highlights.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-slate-700 font-medium text-sm leading-snug pt-2">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA footer */}
        <section className="py-16 md:py-20 landing-mesh text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to organize your team?
            </h2>
            <p className="text-blue-100/90 text-lg mb-8">
              Create an account in minutes and start assigning tasks today.
            </p>
            {!user && (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold landing-glow hover:bg-blue-50 transition-all"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </section>

        <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
          <p>© {new Date().getFullYear()} TeamManage — Team Management System</p>
        </footer>
      </main>
    </>
  );
}
