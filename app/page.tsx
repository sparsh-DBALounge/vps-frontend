"use client";

import React, { useState, useEffect } from "react";

interface User {
  id: number;
  userName: string;
  email: string;
  age: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");

  // Toast Notifications State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show Toast Helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Users from Backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError("Unable to connect to the backend server. Please verify it is running.");
      showToast("Failed to sync user list", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !email.trim()) {
      showToast("Name and email are required fields.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userName: userName.trim(),
        email: email.trim(),
        age: age ? parseInt(age, 10) : null,
      };

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const newUser = await res.json();
      setUsers((prev) => [newUser, ...prev]);
      
      // Reset Form fields
      setUserName("");
      setEmail("");
      setAge("");
      
      showToast(`User "${newUser.userName}" successfully registered!`, "success");
    } catch (err: any) {
      console.error("Failed to create user:", err);
      showToast(err.message || "Failed to register user. Email might already exist.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for stats
  const totalUsers = users.length;
  const validAges = users.filter((u) => u.age !== null && u.age !== undefined) as { age: number }[];
  const averageAge =
    validAges.length > 0
      ? Math.round(validAges.reduce((sum, u) => sum + u.age, 0) / validAges.length)
      : 0;

  // Filtered Users List
  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date utility
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper for generating deterministic avatar colors based on username
  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
      "bg-violet-500/20 text-violet-400 border-violet-500/30",
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "bg-sky-500/20 text-sky-400 border-sky-500/30",
      "bg-teal-500/20 text-teal-400 border-teal-500/30",
      "bg-rose-500/20 text-rose-400 border-rose-500/30",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800/60 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              User Registry
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              A premium client dashboard to register users and view directory lists.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? "bg-rose-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${error ? "bg-rose-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {error ? "API Offline" : "API Connected"}
            </span>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Registered</span>
            <span className="text-4xl font-extrabold text-white mt-4 tracking-tight">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-zinc-800 animate-pulse rounded" />
              ) : (
                totalUsers
              )}
            </span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Average Age</span>
            <span className="text-4xl font-extrabold text-white mt-4 tracking-tight">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-zinc-800 animate-pulse rounded" />
              ) : (
                `${averageAge} yrs`
              )}
            </span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Latest Member</span>
            <span className="text-lg font-bold text-violet-300 mt-4 truncate max-w-full">
              {loading ? (
                <span className="inline-block w-32 h-6 bg-zinc-800 animate-pulse rounded" />
              ) : users.length > 0 ? (
                users[0].userName
              ) : (
                "None yet"
              )}
            </span>
          </div>
        </section>

        {/* Main Work Area */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Create User Form Section */}
          <section className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Register New User</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="userName" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  id="userName"
                  className="bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200 outline-none rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 text-sm"
                  placeholder="e.g. Liam Smith"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200 outline-none rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 text-sm"
                  placeholder="e.g. liam@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  id="age"
                  min="0"
                  max="150"
                  className="bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200 outline-none rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 text-sm"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] transition-all duration-150 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-violet-950/40 hover:shadow-violet-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register User</span>
                )}
              </button>
            </form>
          </section>

          {/* User Directory Section */}
          <section className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6 shadow-xl min-h-[480px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-white">Registered Directory</h2>
              
              {/* Search & Refresh Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 transition-all duration-200 outline-none rounded-xl pl-9 pr-4 py-2 w-full sm:w-48 text-xs text-zinc-200 placeholder-zinc-600"
                  />
                </div>

                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  title="Reload Users"
                  className="bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  <svg className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-3 text-sm flex gap-3 items-center">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Directory Cards/List View */}
            <div className="flex-1 flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {loading && users.length === 0 ? (
                // Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-zinc-900/25 border border-zinc-800/40 rounded-xl p-4 flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="w-1/3 h-4 bg-zinc-800 rounded" />
                      <div className="w-1/2 h-3 bg-zinc-800 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border flex-shrink-0 ${getAvatarBg(user.userName)}`}>
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* User Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 group-hover:text-white transition-colors duration-150 truncate">
                            {user.userName}
                          </span>
                          {user.age !== null && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 font-semibold px-2 py-0.5 rounded-full border border-zinc-700/50">
                              {user.age} yrs
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors duration-150 truncate block mt-0.5">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-800/60 rounded-xl">
                  <svg className="h-12 w-12 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-zinc-500">
                    {searchQuery ? "No matching users found" : "No users registered yet"}
                  </span>
                  <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                    {searchQuery ? "Try searching for a different keyword or name." : "Register a new user using the form on the left."}
                  </p>
                </div>
              )}
            </div>
          </section>

        </main>
      </div>

      {/* Floating custom toasts container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-xl shadow-black/40 animate-slide-in transition-all duration-300 max-w-sm ${
              toast.type === "success"
                ? "bg-zinc-900 border-emerald-500/30 text-emerald-300"
                : "bg-zinc-900 border-rose-500/30 text-rose-300"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="h-5 w-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Embedded toast slide-in css */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateY(1rem) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(63, 63, 70, 0.4);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(82, 82, 91, 0.6);
        }
      `}</style>
    </div>
  );
}
