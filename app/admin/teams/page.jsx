"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import { Users, Plus, Trash2, UserPlus, Mail, Lock } from "lucide-react";

export default function TeamsPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setMembers(data.users || []);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to load team members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load team members");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Member added");
        setForm({ name: "", email: "", password: "" });
        setShowForm(false);
        await fetchMembers();
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from your team? Their assigned tasks will be deleted.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/members/${memberId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Member removed");
        setMembers((prev) => prev.filter((m) => m._id !== memberId));
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-4 py-8 md:p-8">
          <div className="container-max">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users size={32} className="text-blue-600" />
                  <h1 className="heading-1 text-2xl md:text-5xl">Team Members</h1>
                </div>
                <p className="text-gray-600 text-sm md:text-base max-w-full md:max-w-2xl leading-5 md:leading-6">
                  Add and manage members for your admin account. Only your members appear here and in task assignment.
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2 self-start md:self-auto"
              >
                <UserPlus size={18} />
                {showForm ? "Cancel" : "Add Member"}
              </button>
            </div>

            {showForm && (
              <div className="card mb-8 animate-fade-in">
                <h2 className="heading-3 mb-6">Add new team member</h2>
                <form onSubmit={handleAddMember} className="space-y-5">
                  <div className="form-group">
                    <label className="label">Full name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label flex items-center gap-2">
                      <Mail size={16} /> Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="member@example.com"
                      className="input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label flex items-center gap-2">
                      <Lock size={16} /> Password *
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      className="input"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Member will use this password to log in and update their tasks.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 py-3 w-full md:w-auto px-8"
                  >
                    <Plus size={20} />
                    {loading ? "Adding..." : "Add to team"}
                  </button>
                </form>
              </div>
            )}

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-3 mb-0">Your team ({members.length})</h2>
              </div>

              {fetching ? (
                <p className="text-gray-500 py-8 text-center">Loading members...</p>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No team members yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Click &quot;Add Member&quot; to create accounts for your team
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                          <th className="py-3 pr-4 font-semibold">Name</th>
                          <th className="py-3 pr-4 font-semibold">Email</th>
                          <th className="py-3 pr-4 font-semibold">Added</th>
                          <th className="py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member._id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="py-4 pr-4 font-medium text-gray-800">
                              {member.name}
                            </td>
                            <td className="py-4 pr-4 text-gray-600">{member.email}</td>
                            <td className="py-4 pr-4 text-sm text-gray-500">
                              {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMember(member._id, member.name)
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-4 md:hidden">
                    {members.map((member) => (
                      <div
                        key={member._id}
                        className="border border-gray-200 bg-white rounded-2xl p-3 sm:p-4 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{member.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{member.email}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member._id, member.name)}
                            className="inline-flex items-center gap-2 px-2 py-1 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          Added: {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
