"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Users,
  CheckSquare,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/tasks"),
        ]);

        if (usersRes.ok && tasksRes.ok) {
          const usersData = await usersRes.json();
          const tasksData = await tasksRes.json();

          const users = usersData.users || [];
          const tasks = tasksData.tasks || [];

          setStats({
            totalUsers: users.length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t) => t.status === "Completed")
              .length,
            pendingTasks: tasks.filter((t) => t.status === "Pending").length,
            inProgressTasks: tasks.filter((t) => t.status === "In Progress")
              .length,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      bgGradient: "from-blue-600 to-blue-400",
      icon: Users,
      trend: "+2 this week",
    },
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      bgGradient: "from-purple-600 to-purple-400",
      icon: CheckSquare,
      trend: `${stats.completedTasks} completed`,
    },
    {
      label: "In Progress",
      value: stats.inProgressTasks,
      bgGradient: "from-amber-600 to-amber-400",
      icon: TrendingUp,
      trend: "Active now",
    },
    {
      label: "Completion Rate",
      value:
        stats.totalTasks > 0
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100) + "%"
          : "0%",
      bgGradient: "from-green-600 to-green-400",
      icon: BarChart3,
      trend: "Overall progress",
    },
  ];

  const taskStatus = [
    { label: "Pending", count: stats.pendingTasks, color: "bg-yellow-100 text-yellow-800" },
    { label: "In Progress", count: stats.inProgressTasks, color: "bg-blue-100 text-blue-800" },
    { label: "Completed", count: stats.completedTasks, color: "bg-green-100 text-green-800" },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-4 py-8 md:p-8">
          <div className="container-max">
            {/* Header */}
            <div className="mb-12">
              <h1 className="heading-1 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Monitor system activity and team performance
              </p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${card.bgGradient} text-white p-3 sm:p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] sm:text-xs opacity-80">{card.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold mt-1">{card.value}</p>
                        <p className="text-[9px] sm:text-[10px] opacity-75 mt-2">{card.trend}</p>
                      </div>
                      <Icon size={24} className="opacity-80" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Breakdown */}
              <div className="lg:col-span-2 card">
                <h3 className="heading-3 mb-6">Task Status Overview</h3>
                <div className="space-y-4">
                  {taskStatus.map((status, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">
                          {status.label}
                        </span>
                        <span className={`badge ${status.color}`}>
                          {status.count} {status.count === 1 ? "task" : "tasks"}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${status.label === "Pending"
                            ? "bg-yellow-400"
                            : status.label === "In Progress"
                              ? "bg-blue-400"
                              : "bg-green-400"
                            } transition-all duration-500`}
                          style={{
                            width:
                              stats.totalTasks > 0
                                ? (status.count / stats.totalTasks) * 100 + "%"
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <h3 className="heading-3 mb-6">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {stats.completedTasks}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {stats.totalTasks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}