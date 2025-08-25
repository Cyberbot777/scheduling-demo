"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/providers")
      .then(res => res.json())
      .then(data => setProviders(data));
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Care Providers
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-gray-50 border border-gray-200 rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-900">{p.name}</h2>
            <p className="text-purple-600 font-medium">{p.specialty}</p>
            <p className="text-gray-500 text-sm mt-2">
              Availability: {JSON.stringify(p.availability)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
