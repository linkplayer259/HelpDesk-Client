import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { queryAPI } from '../../utils/api';
import { Link } from 'react-router-dom';
import { FiFilter, FiUser, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function SpecialistQueries() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    queryType: ''
  });

  useEffect(() => {
    if (user) {
      loadQueries();
    }
  }, [user, filters]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      // Get all queries and filter by assigned specialist name
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.queryType) params.queryType = filters.queryType;
      
      const response = await queryAPI.getAllQueries(params);
      
      // Filter queries assigned to this specialist
      const userQueries = response.data.queries.filter(
        (query: any) => query.current_assignee_name === user?.name
      );
      
      setQueries(userQueries);
    } catch (error) {
      console.error('Error loading queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQueryStatus = async (queryId: string, status: string) => {
    try {
      await queryAPI.updateQueryStatus(queryId, status);
      loadQueries(); // Reload queries after update
    } catch (error) {
      console.error('Error updating query status:', error);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({ status: '', queryType: '' });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <FiAlertCircle className="text-yellow-500" />;
      case 'assigned': return <FiClock className="text-blue-500" />;
      case 'in_progress': return <FiClock className="text-blue-500" />;
      case 'completed': return <FiCheckCircle className="text-green-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <Layout theme="light">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Queries</h1>
          <p className="text-gray-600 mt-1">Manage queries assigned to you</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <FiFilter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query Type</label>
              <select
                value={filters.queryType}
                onChange={(e) => updateFilter('queryType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {queries.length} queries
              </div>
            </div>
          </div>
        </div>

        {/* Queries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-8">
                <FiAlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No queries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-600 font-medium pb-4">Query #</th>
                      <th className="text-left text-gray-600 font-medium pb-4">Type</th>
                      <th className="text-left text-gray-600 font-medium pb-4">User</th>
                      <th className="text-left text-gray-600 font-medium pb-4">Status</th>
                      <th className="text-left text-gray-600 font-medium pb-4">Created</th>
                      <th className="text-right text-gray-600 font-medium pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map((query) => (
                      <tr key={query.id} className="border-b border-gray-100">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(query.status)}
                            <span className="text-gray-900 font-mono">#{query.problem_number}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-700">{query.query_type}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <FiUser className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{query.user}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={getStatusBadge(query.status)}>
                            {query.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-600">
                            {new Date(query.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {query.status === 'assigned' && (
                              <button
                                onClick={() => updateQueryStatus(query.id, 'in_progress')}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {query.status === 'in_progress' && (
                              <button
                                onClick={() => updateQueryStatus(query.id, 'completed')}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            <Link
                              to={`/specialist/query/${query.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{queries.length}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <FiUser className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {queries.filter(q => q.status === 'assigned').length}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {queries.filter(q => q.status === 'in_progress').length}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <FiClock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {queries.filter(q => q.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}