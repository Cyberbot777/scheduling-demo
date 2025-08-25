"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit3 } from "lucide-react";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("");

  const deleteAssignment = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      const response = await fetch(`http://localhost:4000/assignments/${assignmentId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        alert("Assignment deleted successfully!");
      } else {
        alert("Failed to delete assignment");
      }
    } catch (error) {
      alert("Error deleting assignment");
    }
  };

  const openEditModal = (assignment: any) => {
    setSelectedProvider(assignment.provider.id.toString());
    setShowEditModal(assignment.id);
  };

  const updateAssignment = async () => {
    if (!showEditModal || !selectedProvider) {
      alert("Please select a provider");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/assignments/${showEditModal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: parseInt(selectedProvider) })
      });
      
      if (response.ok) {
        const updatedAssignment = await response.json();
        setAssignments(assignments.map(a => 
          a.id === showEditModal 
            ? updatedAssignment
            : a
        ));
        setShowEditModal(null);
        setSelectedProvider("");
        alert("Provider changed successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to change provider: ${error.error}`);
      }
    } catch (error) {
      alert("Error changing provider");
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4000/assignments").then(res => res.json()),
      fetch("http://localhost:4000/providers").then(res => res.json())
    ]).then(([assignmentsData, providersData]) => {
      setAssignments(assignmentsData);
      setProviders(providersData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading assignments...</div>
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
        <h1 className="text-3xl font-bold text-white mb-6">
          Provider Assignments
        </h1>
        <p className="text-gray-400 mb-8">
          All current provider assignments and their details
        </p>
        
        <div className="grid gap-6">
          {assignments.map((assignment, i) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Provider Info */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Provider</h3>
                  <p className="text-white font-medium">{assignment.provider.name}</p>
                  <p className="text-gray-400 text-sm">{assignment.provider.specialty}</p>
                </div>
                
                {/* Family Info */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Family</h3>
                  <p className="text-white font-medium">{assignment.request.family.name}</p>
                  <p className="text-gray-400 text-sm">
                    {assignment.request.family.consistency ? 'Prefers consistency' : 'Flexible with providers'}
                  </p>
                </div>
                
                {/* Request Info */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Care Request</h3>
                  <p className="text-white font-medium">{assignment.request.careType}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(assignment.request.startTime).toLocaleDateString()} - {new Date(assignment.request.endTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
                             <div className="mt-4 pt-4 border-t border-gray-700">
                 <div className="grid md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-gray-400">Start Time:</p>
                     <p className="text-white">{new Date(assignment.request.startTime).toLocaleDateString()} {new Date(assignment.request.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <div className="flex justify-between items-center">
                     <div>
                       <p className="text-gray-400">End Time:</p>
                       <p className="text-white">{new Date(assignment.request.endTime).toLocaleDateString()} {new Date(assignment.request.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </div>
                                           <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="text-white hover:text-blue-400 transition-colors p-2 rounded-full"
                          title="Change Provider"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteAssignment(assignment.id)}
                          className="text-white hover:text-red-500 transition-colors p-2 rounded-full"
                          title="Delete Assignment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          ))}
          
          {assignments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <p className="text-lg mb-4">No assignments found</p>
              <p className="text-sm">Create a request and assign a provider to see assignments here</p>
            </motion.div>
          )}
                 </div>
         
         {/* Edit Assignment Modal */}
         {showEditModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
               <h3 className="text-xl font-semibold text-white mb-4">Change Provider</h3>
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
                   onClick={updateAssignment}
                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                 >
                   Update
                 </button>
                 <button
                   onClick={() => {
                     setShowEditModal(null);
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
