"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit3 } from "lucide-react";

export default function AssignmentsList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetch("http://localhost:4000/assignments")
      .then(res => res.json())
      .then(assignmentsData => {
        setAssignments(assignmentsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

        <div className="space-y-6">
          {assignments.map((assignment, i) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {assignment.request.careType} Care
                  </h3>
                  <p className="text-gray-400">
                    Family: {assignment.request.family.name}
                    {assignment.request.family.consistency && (
                      <span className="text-blue-400 ml-2">(Prefers consistency)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`/providers?assignmentId=${assignment.id}&requestId=${assignment.request.id}&mode=select`}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>Change Provider</span>
                  </a>
                </div>
              </div>

                             <div className="mb-4">
                 <p className="text-gray-400 text-sm">Provider</p>
                 <p className="text-white font-medium">
                   {assignment.provider.name} ({assignment.provider.specialty})
                 </p>
               </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Start Time</p>
                  <p className="text-white">
                    {new Date(assignment.request.startTime).toLocaleDateString()} {new Date(assignment.request.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">End Time</p>
                                         <p className="text-white">
                       {new Date(assignment.request.endTime).toLocaleDateString()} {new Date(assignment.request.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                  </div>
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="text-white hover:text-red-500 transition-colors p-2 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
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
              <p>Create a request and assign a provider to see assignments here</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
