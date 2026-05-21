"use client";

import { useEffect, useState } from "react";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/tasks/get-user-tasks");
        if (response.ok) {
          const tasks = await response.json();

          const stats = {
            totalTasks: tasks.length,
            completed: tasks.filter((t) => t.status === "Completed").length,
            pending: tasks.filter((t) => t.status === "Pending").length,
            inProgress: tasks.filter((t) => t.status === "In Progress").length,
          };

          setStats(stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      bgColor: "bg-blue-500",
      icon: "📋",
    },
    {
      label: "Pending",
      value: stats.pending,
      bgColor: "bg-yellow-500",
      icon: "⏳",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      bgColor: "bg-purple-500",
      icon: "🔄",
    },
    {
      label: "Completed",
      value: stats.completed,
      bgColor: "bg-green-500",
      icon: "✅",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className={`${card.bgColor} text-white p-6 rounded-lg shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75">{card.label}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
            <span className="text-4xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
