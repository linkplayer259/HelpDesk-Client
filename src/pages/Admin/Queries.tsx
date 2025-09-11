import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { queryAPI, specialistAPI } from '../../utils/api';
import { FiFilter, FiUser, FiX } from 'react-icons/fi';

export default function AdminQueries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queries, setQueries] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    queryType: searchParams.get('queryType') || '',
    specialist: searchParams.get('specialist') || '',
    employee: searchParams.get('employee') || ''
  });

  useEffect(() => {
    loadQueries();
    loadSpecialists();
  }, [filters]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.queryType) params.queryType = filters.queryType;
      if (filters.employee) params.user_id = filters.employee;
      
      const response = await queryAPI.getAllQueries(params);
      let filteredQueries = response.data.queries;
      
      // Filter by specialist if specified
      if (filters.specialist) {
        console.log('Filtering by specialist:', filters.specialist);
        console.log('Filtered queries:', filteredQueries);
        filteredQueries = filteredQueries.filter(
          (query: any) => query.current_assignee_name === filters.specialist
        );
      }
      
      setQueries(filteredQueries);
    } catch (error) {
      console.error('Error loading queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialists = async () => {
    try {
      const response = await specialistAPI.getSpecialists();
      setSpecialists(response.data.specialists);
    } catch (error) {
      console.error('Error loading specialists:', error);
    }
  };

  const handleAssignSpecialist = async ( specialistId: string) => {
    if (!selectedQuery) return;
    
    try {
      await queryAPI.assignSpecialist(selectedQuery.id, specialistId);
      setShowAssignModal(false);
      setSelectedQuery(null);
      loadQueries();
    } catch (error) {
      console.error('Error assigning specialist:', error);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ status: '', queryType: '', specialist: '', employee: '' });
    setSearchParams(new URLSearchParams());
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'open': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'assigned': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <Layout theme="dark">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Query Management</h1>
            <p className="text-gray-400 mt-1">Monitor and manage all help desk queries</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-white">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Query Type</label>
              <select
                value={filters.queryType}
                onChange={(e) => updateFilter('queryType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Furniture">Furniture</option>
                <option value="Facilities">Facilities</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Specialist</label>
              <select
                value={filters.specialist}
                onChange={(e) => updateFilter('specialist', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialists</option>
                {specialists.map((specialist) => (
                  <option key={specialist.name} value={specialist.name}>
                    {specialist.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-400">
                Showing {queries.length} queries
              </div>
            </div>
          </div>
        </div>

        {/* Queries Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No queries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 font-medium pb-4">Query #</th>
                      <th className="text-left text-gray-400 font-medium pb-4">Type</th>
                      <th className="text-left text-gray-400 font-medium pb-4">User</th>
                      <th className="text-left text-gray-400 font-medium pb-4">Status</th>
                      <th className="text-left text-gray-400 font-medium pb-4">Assigned To</th>
                      <th className="text-left text-gray-400 font-medium pb-4">Created</th>
                      <th className="text-right text-gray-400 font-medium pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map((query) => (
                      <tr key={query.id} className="border-b border-gray-700/50">
                        <td className="py-4">
                          <span className="text-white font-mono">#{query.problem_number}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-300">{query.query_type}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <FiUser className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{query.user}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={getStatusBadge(query.status)}>
                            {query.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-300">
                            {query.current_assignee_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-400">
                            {new Date(query.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {!query.current_assignee_name && (
                            <button
                              onClick={() => {
                                setSelectedQuery(query);
                                setShowAssignModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Assign Specialist Modal */}
        {showAssignModal && selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md mx-4">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Assign Specialist
                  </h2>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedQuery(null);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-400 mb-4">
                  Query #{selectedQuery.problem_number}
                </p>
                <div className="space-y-3">
                  {specialists.map((specialist) => (
                    <button
                      key={specialist.name}
                      onClick={() => handleAssignSpecialist(specialist.id)
                      }
                      className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{specialist.name}</span>
                        <div className="text-sm text-gray-400">
                          {specialist.pendingQueries} pending
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}