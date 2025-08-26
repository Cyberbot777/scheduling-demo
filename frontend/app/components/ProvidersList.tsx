"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProvidersList() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/providers?page=${page}&limit=3`)
      .then(res => res.json())
      .then(data => {
        setProviders(data.data);
        setTotalPages(data.pagination.totalPages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]); 

  const formatAvailability = (availability: any) => {
    if (!availability) return "No availability data";
    const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    return days
      .filter(day => availability[day])
      .map(day => {
        const times = availability[day];
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        return `${dayName}: ${times.join(", ")}`;
      })
      .join("\n");
  };

  if (loading) {
    return <div className="p-8 text-white">Loading providers...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6">Care Providers</h1>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <h2 className="text-xl font-semibold">{provider.name}</h2>
              <p className="text-purple-400 font-medium mb-4">{provider.specialty}</p>
              <div className="text-sm text-gray-300 whitespace-pre-line">
                {formatAvailability(provider.availability)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}
