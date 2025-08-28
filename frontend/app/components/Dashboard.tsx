"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    providers: 0,
    requests: 0,
    assignments: 0,
    families: 0
  });

  useEffect(() => {
  fetch("http://localhost:4000/stats")
    .then(res => res.json())
    .then(data => {
      setStats({
        providers: data.providers,
        families: data.families,
        requests: data.requests,
        assignments: data.assignments
      });
    })
    .catch(err => console.error("Error fetching stats:", err));
}, []);


  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Healthcare Scheduling System
        </h1>
        <p className="text-gray-400 mb-8">
          AI-driven healthcare provider scheduling system
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="text-2xl font-bold text-purple-400">{stats.providers}</div>
            <div className="text-gray-400">Providers</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="text-2xl font-bold text-blue-400">{stats.families}</div>
            <div className="text-gray-400">Families</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="text-2xl font-bold text-green-400">{stats.requests}</div>
            <div className="text-gray-400">Requests</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <div className="text-2xl font-bold text-yellow-400">{stats.assignments}</div>
            <div className="text-gray-400">Assignments</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/requests/new"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg text-center transition-colors"
              >
                Create New Request
              </Link>
              <Link 
                href="/assignments"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center transition-colors"
              >
                View Assignments
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">System Overview</h2>
            <div className="space-y-2 text-gray-400">
              <p>• {stats.providers} care providers available</p>
              <p>• {stats.families} families in the system</p>
              <p>• {stats.requests} care requests pending</p>
              <p>• {stats.assignments} successful assignments</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
