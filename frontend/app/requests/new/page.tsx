"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    familyId: "",
    careType: "",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    // Fetch families and providers for the form
    Promise.all([
      fetch("http://localhost:4000/families").then(res => res.json()),
      fetch("http://localhost:4000/providers").then(res => res.json())
    ]).then(([familiesData, providersData]) => {
      setFamilies(familiesData);
      setProviders(providersData);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          familyId: parseInt(formData.familyId),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        })
      });

      if (response.ok) {
        const newRequest = await response.json();
        router.push("/requests");
      } else {
        alert("Failed to create request");
      }
    } catch (error) {
      alert("Error creating request");
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggestion = async () => {
    if (!formData.familyId || !formData.careType || !formData.startTime || !formData.endTime) {
      alert("Please fill in all fields before getting AI suggestion");
      return;
    }

    setLoading(true);
    try {
      // First create the request
      const requestResponse = await fetch("http://localhost:4000/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          familyId: parseInt(formData.familyId),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        })
      });

      if (requestResponse.ok) {
        const newRequest = await requestResponse.json();
        
        // Then get AI suggestion
        const aiResponse = await fetch("http://localhost:4000/ai-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: newRequest.id })
        });

        if (aiResponse.ok) {
          const suggestion = await aiResponse.json();
          setAiSuggestion(suggestion);
        }
      }
    } catch (error) {
      alert("Error getting AI suggestion");
    } finally {
      setLoading(false);
    }
  };

  const assignProvider = async (providerId: number) => {
    if (!aiSuggestion) return;

    try {
      const response = await fetch("http://localhost:4000/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: aiSuggestion.requestId,
          providerId
        })
      });

      if (response.ok) {
        alert("Provider assigned successfully!");
        router.push("/assignments");
      } else {
        alert("Failed to assign provider");
      }
    } catch (error) {
      alert("Error assigning provider");
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          Create New Care Request
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Family Selection */}
          <div>
            <label className="block text-white mb-2">Family</label>
            <select
              value={formData.familyId}
              onChange={(e) => setFormData({...formData, familyId: e.target.value})}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            >
              <option value="">Select a family</option>
              {families.map(family => (
                <option key={family.id} value={family.id}>
                  {family.name} {family.consistency ? '(Prefers consistency)' : '(Flexible)'}
                </option>
              ))}
            </select>
          </div>

          {/* Care Type */}
          <div>
            <label className="block text-white mb-2">Care Type</label>
            <input
              type="text"
              value={formData.careType}
              onChange={(e) => setFormData({...formData, careType: e.target.value})}
              placeholder="e.g., Overnight newborn care, Lactation consultation"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-white mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-white mb-2">End Time</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Request"}
            </button>
            
            <button
              type="button"
              onClick={getAiSuggestion}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Getting Suggestion..." : "Get AI Suggestion"}
            </button>
          </div>
        </form>

        {/* AI Suggestion Display */}
        {aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">AI Recommendation</h3>
            <div className="mb-4">
              <p className="text-gray-400">Suggested Provider:</p>
              <p className="text-white font-medium">{aiSuggestion.suggestedProvider.name}</p>
              <p className="text-gray-400 text-sm mt-2">{aiSuggestion.suggestedProvider.reasoning}</p>
            </div>
            <button
              onClick={() => assignProvider(aiSuggestion.suggestedProvider.providerId)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Assign This Provider
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
