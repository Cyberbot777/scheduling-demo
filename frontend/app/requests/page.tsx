"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trash2, UserPlus } from "lucide-react";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4000/requests").then(res => res.json()),
      fetch("http://localhost:4000/providers").then(res => res.json())
    ]).then(([requestsData, providersData]) => {
      setRequests(requestsData);
      setProviders(providersData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const deleteRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    
    try {
      const response = await fetch(`http://localhost:4000/requests/${requestId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setRequests(requests.filter(r => r.id !== requestId));
        alert("Request deleted successfully!");
      } else {
        alert("Failed to delete request");
      }
    } catch (error) {
      alert("Error deleting request");
    }
  };

  const assignProvider = async (requestId: number) => {
    if (!selectedProvider) {
      alert("Please select a provider");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/requests/${requestId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: parseInt(selectedProvider) })
      });
      
      if (response.ok) {
        const assignment = await response.json();
        // Update the requests list with the new assignment
        setRequests(requests.map(r => 
          r.id === requestId 
            ? { ...r, assignment: assignment }
            : r
        ));
        setShowAssignModal(null);
        setSelectedProvider("");
        alert("Provider assigned successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to assign provider: ${error.error}`);
      }
    } catch (error) {
      alert("Error assigning provider");
    }
  };

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
                   <p className="text-white">{new Date(request.startTime).toLocaleDateString()} {new Date(request.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="text-gray-400">End Time:</p>
                     <p className="text-white">{new Date(request.endTime).toLocaleDateString()} {new Date(request.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <button
                     onClick={() => deleteRequest(request.id)}
                     className="text-white hover:text-red-500 transition-colors p-2 rounded-full"
                     title="Delete Request"
                   >
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
              
              {request.assignment && request.assignment.provider && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Assigned to:</p>
                  <p className="text-white font-medium">{request.assignment.provider.name}</p>
                </div>
              )}
              
                             {/* Action Buttons */}
               <div className="mt-4 flex gap-2">
                 {!request.assignment && (
                   <button
                     onClick={() => setShowAssignModal(request.id)}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                   >
                     <UserPlus size={16} />
                     Assign Provider
                   </button>
                 )}
               </div>
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
        
        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Assign Provider</h3>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
              >
                <option value="">Select a provider</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.specialty})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => assignProvider(showAssignModal)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(null);
                    setSelectedProvider("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
