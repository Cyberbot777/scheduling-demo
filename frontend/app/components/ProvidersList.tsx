"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function ProvidersList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if we're in selection mode (change provider) or assignment mode (assign provider)
  const mode = searchParams.get("mode");
  const isSelectionMode = mode === "select";
  const isAssignmentMode = mode === "assign";
  const assignmentId = searchParams.get("assignmentId");
  const requestId = searchParams.get("requestId");
  
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState<any>(null);
  const [requestInfo, setRequestInfo] = useState<any>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // filtering state
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // sorting state
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get unique specialties for filter dropdown
  const [specialties, setSpecialties] = useState<string[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch specialties for filter dropdown
    fetch("http://localhost:4000/providers?limit=1000")
      .then(res => res.json())
      .then(data => {
        const uniqueSpecialties = [...new Set(data.data.map((p: any) => p.specialty))] as string[];
        setSpecialties(uniqueSpecialties.sort());
      })
      .catch(console.error);
  }, []);

  // Initialize state from URL on first render
  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "1");
    if (!Number.isNaN(initialPage) && initialPage !== page) setPage(initialPage);

    const spSearch = searchParams.get("search") || "";
    if (spSearch !== "") setSearchQuery(spSearch);

    const spSpecialty = searchParams.get("specialty") || "";
    if (spSpecialty !== "") setSpecialtyFilter(spSpecialty);

    const spDay = searchParams.get("day") || "";
    if (spDay !== "") setDayFilter(spDay);

    const spTime = searchParams.get("time") || "";
    if (spTime !== "") setTimeFilter(spTime);

    const spSortBy = searchParams.get("sortBy") || "name";
    if (spSortBy !== "name") setSortBy(spSortBy);

    const spSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";
    if (spSortOrder !== "asc") setSortOrder(spSortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with current filters for back/forward and sharing
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "9");
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery); 
    if (specialtyFilter) params.set("specialty", specialtyFilter);
    if (dayFilter) params.set("day", dayFilter);
    if (timeFilter) params.set("time", timeFilter);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    // Preserve selection/assignment mode context if present
    if (mode) params.set("mode", mode);
    if (assignmentId) params.set("assignmentId", assignmentId);
    if (requestId) params.set("requestId", requestId);

    const qs = params.toString();
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [page, debouncedSearchQuery, specialtyFilter, dayFilter, timeFilter, sortBy, sortOrder, mode, assignmentId, requestId, pathname, router]);

  // Always reset to first page when any filter/search/sort changes
  useEffect(() => {
    setPage(1);
  }, [specialtyFilter, dayFilter, timeFilter, debouncedSearchQuery, sortBy, sortOrder]);

  useEffect(() => {
    setFiltering(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "9"
    });

    if (specialtyFilter) params.append("specialty", specialtyFilter);
    if (dayFilter) params.append("day", dayFilter);
    if (timeFilter) params.append("time", timeFilter);
    if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);

    fetch(`http://localhost:4000/providers?${params}`)
      .then(res => res.json())
      .then(data => {
        setProviders(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
        setLoading(false);
        setFiltering(false);
      })
      .catch(() => {
        setLoading(false);
        setFiltering(false);
      });
  }, [page, specialtyFilter, dayFilter, timeFilter, debouncedSearchQuery, sortBy, sortOrder]);

  const formatAvailability = (availability: any) => {
    if (!availability) return "No availability data";
    const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

    const toAmPm = (hour: number) => {
      // Normalize to 0-23 for display
      const h = ((hour % 24) + 24) % 24;
      if (h === 0) return "12 AM";
      if (h === 12) return "12 PM";
      if (h < 12) return `${h} AM`;
      return `${h - 12} PM`;
    };

    const slotToAmPm = (slot: string) => {
      const parts = slot.split("-");
      if (parts.length !== 2) return slot;
      const start = Number(parts[0]);
      const end = Number(parts[1]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return slot;
      return `${toAmPm(start)} - ${toAmPm(end)}`;
    };

    return days
      .filter(day => availability[day])
      .map(day => {
        const times = availability[day] as string[];
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const pretty = times.map(slotToAmPm).join(", ");
        return `${dayName}: ${pretty}`;
      })
      .join("\n");
  };

  const clearFilters = useCallback(() => {
    setSpecialtyFilter("");
    setDayFilter("");
    setTimeFilter("");
    setSearchQuery("");
    setSortBy("name");
    setSortOrder("asc");
    setPage(1);
  }, []);

  // Fetch assignment info if in selection mode, or request info if in assignment mode
  useEffect(() => {
    if (isSelectionMode && assignmentId) {
      fetch(`http://localhost:4000/assignments`)
        .then(res => res.json())
        .then(assignments => {
          const assignment = assignments.find((a: any) => a.id === parseInt(assignmentId));
          setAssignmentInfo(assignment);
        })
        .catch(console.error);
    } else if (isAssignmentMode && requestId) {
      fetch(`http://localhost:4000/requests`)
        .then(res => res.json())
        .then(requests => {
          const request = requests.find((r: any) => r.id === parseInt(requestId));
          setRequestInfo(request);
        })
        .catch(console.error);
    }
  }, [isSelectionMode, isAssignmentMode, assignmentId, requestId]);

  // Handle provider selection (for both assignment changes and new assignments)
  const selectProvider = async (providerId: number) => {
    const selectedProvider = providers.find(p => p.id === providerId);
    if (!selectedProvider) return;
    
    let confirmMessage = "";
    let endpoint = "";
    let method = "";
    let body = {};
    let successMessage = "";
    let redirectPath = "";
    
    if (isSelectionMode && assignmentId) {
      // Changing provider for existing assignment
      confirmMessage = `Are you sure you want to change the provider to ${selectedProvider.name} (${selectedProvider.specialty})?`;
      endpoint = `http://localhost:4000/assignments/${assignmentId}`;
      method = "PUT";
      body = { providerId };
      successMessage = "Provider changed successfully!";
      redirectPath = "/assignments";
    } else if (isAssignmentMode && requestId) {
      // Assigning provider to request
      confirmMessage = `Are you sure you want to assign ${selectedProvider.name} (${selectedProvider.specialty}) to this request?`;
      endpoint = `http://localhost:4000/requests/${requestId}/assign`;
      method = "POST";
      body = { providerId };
      successMessage = "Provider assigned successfully!";
      redirectPath = "/requests";
    } else {
      return;
    }
    
    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        alert(successMessage);
        router.push(redirectPath);
      } else {
        const error = await response.json();
        alert(`Failed to ${isSelectionMode ? 'change' : 'assign'} provider: ${error.error}`);
      }
    } catch (error) {
      alert(`Error ${isSelectionMode ? 'changing' : 'assigning'} provider`);
    }
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isSelectionMode ? "Select a Provider" : isAssignmentMode ? "Assign a Provider" : "Care Providers"}
            </motion.h1>
            {isSelectionMode && assignmentInfo && (
              <motion.div 
                className="mt-2 text-sm text-gray-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p>Changing provider for: <span className="text-white font-medium">{assignmentInfo.request.careType} Care</span></p>
                <p>Family: <span className="text-white">{assignmentInfo.request.family.name}</span></p>
                <p>Current Provider: <span className="text-white">{assignmentInfo.provider.name}</span></p>
                <p>Time: <span className="text-white">
                  {new Date(assignmentInfo.request.startTime).toLocaleDateString()} {new Date(assignmentInfo.request.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(assignmentInfo.request.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span></p>
              </motion.div>
            )}
            {isAssignmentMode && requestInfo && (
              <motion.div 
                className="mt-2 text-sm text-gray-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p>Assigning provider for: <span className="text-white font-medium">{requestInfo.careType} Care</span></p>
                <p>Family: <span className="text-white">{requestInfo.family.name}</span></p>
                <p>Time: <span className="text-white">
                  {new Date(requestInfo.startTime).toLocaleDateString()} {new Date(requestInfo.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(requestInfo.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span></p>
              </motion.div>
            )}
          </div>
          <motion.div 
            className="text-sm text-gray-400 text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {filtering ? (
              <span className="flex items-center gap-2 justify-end">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                Filtering...
              </span>
            ) : (
              <div>
                <span>{totalCount} provider{totalCount !== 1 ? 's' : ''} found</span>
                {(isSelectionMode || isAssignmentMode) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-1"
                  >
                    <button
                      onClick={() => router.push(isSelectionMode ? "/assignments" : "/requests")}
                      className="text-purple-400 hover:text-purple-300 text-sm cursor-pointer transition-colors"
                    >
                      ← Back to {isSelectionMode ? "Assignments" : "Requests"}
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="bg-gray-800 p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Specialty</label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Day Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Day</label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any Day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Time (Hour)</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any Time</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString()}>
                    {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">Name</option>
                <option value="specialty">Specialty</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Order:</label>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </button>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-red-600 hover:border-red-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {(specialtyFilter || dayFilter || timeFilter || debouncedSearchQuery) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-300">Active filters:</span>
              {debouncedSearchQuery && (
                <span className="px-2 py-1 bg-purple-600 rounded text-sm">
                  Search: "{debouncedSearchQuery}"
                </span>
              )}
              {specialtyFilter && (
                <span className="px-2 py-1 bg-blue-600 rounded text-sm">
                  Specialty: {specialtyFilter}
                </span>
              )}
              {dayFilter && (
                <span className="px-2 py-1 bg-green-600 rounded text-sm">
                  Day: {dayFilter}
                </span>
              )}
              {timeFilter && (
                <span className="px-2 py-1 bg-yellow-600 rounded text-sm">
                  Time: {timeFilter === "0" ? "12 AM" : parseInt(timeFilter) < 12 ? `${timeFilter} AM` : parseInt(timeFilter) === 12 ? "12 PM" : `${parseInt(timeFilter) - 12} PM`}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {providers.map((provider, i) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:border-purple-500 transition-colors"
            >
                            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{provider.name}</h2>
                {isSelectionMode && assignmentInfo && provider.id === assignmentInfo.provider.id && (
                  <span className="px-2 py-1 bg-blue-600 text-xs rounded">Current</span>
                )}
              </div>
              <p className="text-purple-400 font-medium mb-4">{provider.specialty}</p>
              <div className="text-sm text-gray-300 whitespace-pre-line mb-4">
                {formatAvailability(provider.availability)}
              </div>
              {(isSelectionMode || isAssignmentMode) && (
                <button
                  onClick={() => selectProvider(provider.id)}
                  disabled={isSelectionMode && assignmentInfo && provider.id === assignmentInfo.provider.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isSelectionMode && assignmentInfo && provider.id === assignmentInfo.provider.id
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                  }`}
                >
                  {isSelectionMode && assignmentInfo && provider.id === assignmentInfo.provider.id 
                    ? 'Current Provider' 
                    : isSelectionMode ? 'Select This Provider' : 'Assign This Provider'
                  }
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* No Results Message */}
        {providers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No providers found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-red-600 hover:border-red-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600 disabled:hover:bg-gray-700 transition-colors"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
              className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600 disabled:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
        )}
      </motion.div>
    </div>
  );
}
