import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { queryAPI } from '../../utils/api';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiAlertCircle, FiUser } from 'react-icons/fi';

export default function SpecialistDashboard() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadQueries();
    }
  }, [user, selectedStatus]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      // For specialist, get all queries but filter by assigned specialist name
      const response = await queryAPI.getAllQueries({
        status: selectedStatus || undefined
      });
      
      // Filter queries assigned to this user (assuming user name matches specialist name)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <FiAlertCircle className="text-yellow-500" />;
      case 'assigned': return <FiClock className="text-blue-500" />;
      case 'in_progress': return <FiClock className="text-blue-500" />;
      case 'completed': return <FiCheckCircle className="text-green-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
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

  const stats = {
    total: queries.length,
    pending: queries.filter(q => q.status === 'assigned' || q.status === 'in_progress').length,
    completed: queries.filter(q => q.status === 'completed').length,
  };

  return (
    <Layout theme="light">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Specialist Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Assigned Queries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <FiUser className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Queries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Assigned Queries</h2>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : queries.length === 0 ? (
              <div className="text-center py-8">
                <FiAlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No queries assigned to you</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queries.map((query) => (
                  <div key={query.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(query.status)}
                          <h3 className="font-medium text-gray-900">
                            Query #{query.problem_number}
                          </h3>
                          <span className={getStatusBadge(query.status)}>
                            {query.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {query.query_type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{query.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>Created: {new Date(query.created_at).toLocaleDateString()}</span>
                          <span>By: {query.user}</span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-3">
                          {query.status === 'assigned' && (
                            <button
                              onClick={() => updateQueryStatus(query.id, 'in_progress')}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Start Working
                            </button>
                          )}
                          {query.status === 'in_progress' && (
                            <button
                              onClick={() => updateQueryStatus(query.id, 'completed')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                          <Link
                            to={`/specialist/query/${query.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}