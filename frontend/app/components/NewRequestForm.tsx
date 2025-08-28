"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NewRequestForm() {
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
      // Fetch a large page so we can resolve names for AI suggestions reliably
      fetch("http://localhost:4000/providers?limit=1000").then(res => res.json())
    ]).then(([familiesData, providersData]) => {
      setFamilies(familiesData);
      setProviders(providersData.data || providersData); // Handle both paginated and non-paginated responses
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
          const response = await aiResponse.json();
          setAiSuggestion({
            requestId: response.requestId,
            providerId: response.suggestedProvider.providerId,
            // keep name if model supplied it so UI can show without lookup
            name: response.suggestedProvider.name,
            reasoning: response.suggestedProvider.reasoning
          });
        }
      }
    } catch (error) {
      alert("Error getting AI suggestion");
    } finally {
      setLoading(false);
    }
  };

  const assignProvider = async () => {
    if (!aiSuggestion) return;
    
    try {
      const response = await fetch(`http://localhost:4000/requests/${aiSuggestion.requestId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: aiSuggestion.providerId })
      });

      if (response.ok) {
        alert("Provider assigned successfully!");
        router.push("/requests");
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
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          Create New Care Request
        </h1>
        <p className="text-gray-400 mb-8">
          Create a new care request with AI-powered provider suggestions
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Request Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Family</label>
                <select
                  value={formData.familyId}
                  onChange={(e) => setFormData({...formData, familyId: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="">Select a family...</option>
                  {families.map((family:any) => (
                    <option key={family.id} value={family.id}>
                      {family.name} {family.consistency && "(Prefers consistency)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Care Type</label>
                <input
                  type="text"
                  value={formData.careType}
                  onChange={(e) => setFormData({...formData, careType: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Lactation Consult, Newborn Care, Postpartum Support"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Create Request"}
                </button>
                <button
                  type="button"
                  onClick={getAiSuggestion}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Getting Suggestion..." : "Get AI Suggestion"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* AI Suggestion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">AI Provider Suggestion</h2>
            
            {aiSuggestion ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    Recommended Provider
                  </h3>
                  <p className="text-white font-medium">
                    {aiSuggestion.name || providers.find(p => p.id === aiSuggestion.providerId)?.name || "Provider not found"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {providers.find(p => p.id === aiSuggestion.providerId)?.specialty || ""}
                  </p>
                </div>

                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-medium mb-2">AI Reasoning:</h4>
                  <p className="text-gray-300 text-sm">
                    {aiSuggestion.reasoning}
                  </p>
                </div>

                <button
                  onClick={assignProvider}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Assign Recommended Provider
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="mb-4">Fill out the request form and click "Get AI Suggestion" to receive a provider recommendation.</p>
                <p className="text-sm">The AI considers family preferences, provider specialties, and availability.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
