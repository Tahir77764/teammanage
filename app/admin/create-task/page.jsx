"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { Plus, Users } from "lucide-react";

export default function CreateTaskPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers((data.users || []).filter((u) => u.role === "user"));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline ? new Date(form.deadline) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Task created successfully!");
        setForm({
          title: "",
          description: "",
          assignedTo: "",
          deadline: "",
        });
      } else {
        toast.error(data.error || data.message || "Failed to create task");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-8">
          <div className="container-max">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Plus size={32} className="text-blue-600" />
                <h1 className="heading-1">Create New Task</h1>
              </div>
              <p className="text-gray-600">Assign a task to team members</p>
            </div>

            {/* Form Card */}
            <div className="card max-w-2xl animate-fade-in">
              <form onSubmit={handleCreateTask} className="space-y-6">
                {/* Title Field */}
                <div className="form-group">
                  <label className="label">Task Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g., Design Homepage"
                    className="input"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Description Field */}
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Provide detailed description of the task..."
                    rows="5"
                    className="input resize-none"
                    disabled={loading}
                  />
                </div>

                {/* Assign To Field */}
                <div className="form-group">
                  <label className="label">Assign To *</label>
                  <div className="relative">
                    <Users
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={form.assignedTo}
                      onChange={(e) =>
                        setForm({ ...form, assignedTo: e.target.value })
                      }
                      className="input pl-10"
                      required
                      disabled={loading}
                    >
                      <option value="">Select a team member</option>
                      {users.length === 0 && (
                        <option value="" disabled>
                          Add members in Team Members first
                        </option>
                      )}
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Deadline Field */}
                <div className="form-group">
                  <label className="label">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm({ ...form, deadline: e.target.value })
                    }
                    className="input"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                  >
                    <Plus size={20} />
                    {loading ? "Creating..." : "Create Task"}
                  </button>
                  <button
                    type="reset"
                    className="btn-secondary px-6 py-3"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Tip:</span> Assign tasks to team
                members to keep track of project progress. Members will see their
                tasks in their dashboard and can update the status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
