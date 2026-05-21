"use client";

import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import toast from "react-hot-toast";

const STATUSES = ["Pending", "In Progress", "Completed"];

export default function TaskCard({ task, onStatusChange, canUpdate = true }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (!canUpdate || newStatus === task.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Task marked as ${newStatus}`);
        if (onStatusChange) {
          onStatusChange(data.task);
        }
      } else {
        toast.error(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
  };

  const assignedByName =
    task.assignedBy?.name || (typeof task.assignedBy === "object" ? "" : "");

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                statusColors[task.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {task.status}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm">{task.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            {assignedByName && (
              <span>
                <strong className="text-gray-700">Assigned by:</strong> {assignedByName}
              </span>
            )}
            {task.deadline && (
              <span>
                <strong className="text-gray-700">Deadline:</strong>{" "}
                {formatDate(task.deadline)}
              </span>
            )}
          </div>
        </div>

        {canUpdate && (
          <div className="md:w-52 shrink-0">
            <label className="label text-xs mb-1">Update status</label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="input text-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {isUpdating && (
              <p className="text-xs text-blue-600 mt-1">Saving...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
