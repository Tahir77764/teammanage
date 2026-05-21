"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import TaskCard from "@/components/TaskCard";
import Loader from "@/components/Loader";
import { CheckSquare, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleStatusChange = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };

  if (loading) {
    return <Loader />;
  }

  const completionPercentage =
    tasks.length > 0
      ? Math.round(
        (tasks.filter((t) => t.status === "Completed").length / tasks.length) *
        100
      )
      : 0;

  return (
    <ProtectedRoute requiredRole="user">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="container-max px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="heading-1 mb-2">My Dashboard</h1>
            <p className="text-gray-600">Track and manage your assigned tasks</p>
          </div>

          {/* Completion Progress */}
          {tasks.length > 0 && (
            <div className="card mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading-3 flex items-center gap-2">
                  <CheckSquare size={24} className="text-blue-600" />
                  Overall Progress
                </h3>
                <span className="text-2xl font-bold text-blue-600">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {tasks.filter((t) => t.status === "Completed").length} of{" "}
                {tasks.length} tasks completed
              </p>
            </div>
          )}

          {/* Tasks Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <CheckSquare size={28} className="text-blue-600" />
              <div>
                <h2 className="heading-3 mb-0">Your Tasks</h2>
                <p className="text-sm text-gray-600">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"} assigned
                </p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <p className="text-gray-600 text-lg">No tasks assigned yet</p>
                <p className="text-gray-500 text-sm">
                  Your admin will assign tasks here. Use the status dropdown to update progress.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task._id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TaskCard
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}