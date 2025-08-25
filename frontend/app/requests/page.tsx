"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/requests")
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Care Requests
            </h1>
            <p className="text-gray-400">
              All care requests and their current status
            </p>
          </div>
          <Link 
            href="/requests/new"
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            New Request
          </Link>
        </div>
        
        <div className="grid gap-6">
          {requests.map((request, i) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {request.careType}
                  </h2>
                  <p className="text-gray-400">
                    Family: <span className="text-white">{request.family.name}</span>
                    {request.family.consistency && (
                      <span className="ml-2 text-blue-400 text-sm">(Prefers consistency)</span>
                    )}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.assignment 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {request.assignment ? 'Assigned' : 'Pending'}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Start Time:</p>
                  <p className="text-white">{new Date(request.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">End Time:</p>
                  <p className="text-white">{new Date(request.endTime).toLocaleString()}</p>
                </div>
              </div>
              
              {request.assignment && request.assignment.provider && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Assigned to:</p>
                  <p className="text-white font-medium">{request.assignment.provider.name}</p>
                </div>
              )}
            </motion.div>
          ))}
          
          {requests.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <p className="text-lg mb-4">No care requests found</p>
              <Link 
                href="/requests/new"
                className="text-purple-400 hover:text-purple-300"
              >
                Create your first request
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
