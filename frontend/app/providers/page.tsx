"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/providers")
      .then(res => res.json())
      .then(data => {
        setProviders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatAvailability = (availability: any) => {
    if (!availability) return "No availability data";
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const formattedDays = days
      .filter(day => availability[day])
      .map(day => {
        const times = availability[day];
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        return `${dayName}: ${times.join(', ')}`;
      });
    
    return formattedDays.length > 0 ? formattedDays.join('\n') : "No availability set";
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading providers...</div>
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
          Care Providers
        </h1>
        <p className="text-gray-400 mb-8">
          Available healthcare providers and their specialties
        </p>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:border-purple-500 transition-colors"
            >
              <h2 className="text-xl font-semibold text-white mb-2">{provider.name}</h2>
              <p className="text-purple-400 font-medium mb-4">{provider.specialty}</p>
              <div className="text-gray-400 text-sm">
                <p className="mb-2"><strong>Availability:</strong></p>
                <div className="bg-gray-900 p-3 rounded text-xs">
                  {formatAvailability(provider.availability).split('\n').map((line, index) => (
                    <div key={index} className="mb-1">{line}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
