"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trash2, UserPlus, Edit3 } from "lucide-react";

export default function RequestsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    careType: "",
    startTime: "",
    endTime: "",
    familyId: ""
  });

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4000/requests").then(res => res.json()),
      fetch("http://localhost:4000/families").then(res => res.json())
    ]).then(([requestsData, familiesData]) => {
      setRequests(requestsData);
      setFamilies(familiesData);
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



  const openEditModal = (request: any) => {
    setEditForm({
      careType: request.careType,
      startTime: new Date(request.startTime).toISOString().slice(0, 16),
      endTime: new Date(request.endTime).toISOString().slice(0, 16),
      familyId: request.familyId.toString()
    });
    setShowEditModal(request.id);
  };

  const updateRequest = async () => {
    if (!showEditModal) return;
    
    try {
      const response = await fetch(`http://localhost:4000/requests/${showEditModal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careType: editForm.careType,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          familyId: parseInt(editForm.familyId)
        })
      });
      
      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests(requests.map(r => 
          r.id === showEditModal ? updatedRequest : r
        ));
        setShowEditModal(null);
        alert("Request updated successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to update request: ${error.error}`);
      }
    } catch (error) {
      alert("Error updating request");
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
              Manage care requests and provider assignments
            </p>
          </div>
          <Link
            href="/requests/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create New Request
          </Link>
        </div>

        <div className="space-y-6">
          {requests.map((request, i) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {request.careType} Care
                  </h3>
                  <p className="text-gray-400">
                    Family: {request.family?.name} 
                    {request.family?.consistency && (
                      <span className="text-blue-400 ml-2">(Prefers consistency)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.assignment 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {request.assignment ? 'Assigned' : 'Pending'}
                  </span>
                </div>
              </div>

                             <div className="grid md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <p className="text-gray-400 text-sm">Start Time</p>
                   <p className="text-white">
                     {new Date(request.startTime).toLocaleDateString()} {new Date(request.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                 </div>
                 <div className="flex justify-between items-center">
                   <div>
                     <p className="text-gray-400 text-sm">End Time</p>
                     <p className="text-white">
                       {new Date(request.endTime).toLocaleDateString()} {new Date(request.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                   <div className="flex gap-1">
                     <button
                       onClick={() => openEditModal(request)}
                       className="text-white hover:text-blue-400 transition-colors p-2 rounded-full"
                       title="Edit Request"
                     >
                       <Edit3 size={16} />
                     </button>
                     <button
                       onClick={() => deleteRequest(request.id)}
                       className="text-white hover:text-red-500 transition-colors p-2 rounded-full"
                       title="Delete Request"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               </div>

              {request.assignment && request.assignment.provider && (
                <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Assigned to:</p>
                  <p className="text-white font-medium">{request.assignment.provider.name}</p>
                </div>
              )}

                             <div className="mt-4 flex gap-2">
                 {!request.assignment && (
                   <a
                     href={`/providers?requestId=${request.id}&mode=assign`}
                     className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                   >
                     <UserPlus size={16} />
                     Assign Provider
                   </a>
                 )}
               </div>
            </motion.div>
          ))}
        </div>



        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Care Type</label>
                  <input
                    type="text"
                    value={editForm.careType}
                    onChange={(e) => setEditForm({...editForm, careType: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Family</label>
                  <select
                    value={editForm.familyId}
                    onChange={(e) => setEditForm({...editForm, familyId: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {families.map(family => (
                      <option key={family.id} value={family.id}>
                        {family.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={updateRequest}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
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
