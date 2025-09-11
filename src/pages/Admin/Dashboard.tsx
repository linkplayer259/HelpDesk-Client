import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { queryAPI, userAPI, specialistAPI } from '../../utils/api';
import { 
  FiUsers, FiList, FiCheckCircle, FiClock, 
  FiUserCheck, FiAlertCircle, FiTrendingUp 
} from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQueries: 0,
    completedQueries: 0,
    pendingQueries: 0,
    specialists: 0,
    employees: 0
  });
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersResponse = await userAPI.getUsers();
      const users = usersResponse.data.data;
      
      // Load queries
      const queriesResponse = await queryAPI.getAllQueries();
      const queries = queriesResponse.data.queries;
      
      // Load specialists
      const specialistsResponse = await specialistAPI.getSpecialists();
      const specialists = specialistsResponse.data.specialists;

      // Calculate stats
      const totalUsers = users.length;
      const employees = users.filter((u: any) => u.role_id === 2).length; // Assuming role_id 2 is employee
      const totalQueries = queries.length;
      const completedQueries = queries.filter((q: any) => q.status === 'completed').length;
      const pendingQueries = queries.filter((q: any) => 
        q.status === 'open' || q.status === 'assigned' || q.status === 'in_progress'
      ).length;

      setStats({
        totalUsers,
        totalQueries,
        completedQueries,
        pendingQueries,
        specialists: specialists.length,
        employees
      });

      // Set recent queries (last 5)
      setRecentQueries(queries.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Layout theme="dark">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout theme="dark">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">System overview and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-500/20 rounded-full p-3">
                <FiUsers className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Employees</p>
                <p className="text-2xl font-bold text-white">{stats.employees}</p>
              </div>
              <div className="bg-green-500/20 rounded-full p-3">
                <FiUsers className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Specialists</p>
                <p className="text-2xl font-bold text-white">{stats.specialists}</p>
              </div>
              <div className="bg-purple-500/20 rounded-full p-3">
                <FiUserCheck className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Queries</p>
                <p className="text-2xl font-bold text-white">{stats.totalQueries}</p>
              </div>
              <div className="bg-yellow-500/20 rounded-full p-3">
                <FiList className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingQueries}</p>
              </div>
              <div className="bg-orange-500/20 rounded-full p-3">
                <FiClock className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedQueries}</p>
              </div>
              <div className="bg-green-500/20 rounded-full p-3">
                <FiCheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Completion Rate */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Completion Rate</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-white">
                    {stats.totalQueries > 0 ? Math.round((stats.completedQueries / stats.totalQueries) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.totalQueries > 0 ? (stats.completedQueries / stats.totalQueries) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-white">
                    {stats.totalQueries > 0 ? Math.round((stats.pendingQueries / stats.totalQueries) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.totalQueries > 0 ? (stats.pendingQueries / stats.totalQueries) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 rounded-full p-2">
                    <FiTrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Query Resolution</p>
                    <p className="text-gray-400 text-sm">Average resolution time</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">Good</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 rounded-full p-2">
                    <FiUsers className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">User Activity</p>
                    <p className="text-gray-400 text-sm">Active users this week</p>
                  </div>
                </div>
                <span className="text-blue-400 font-bold">High</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/20 rounded-full p-2">
                    <FiUserCheck className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Specialist Load</p>
                    <p className="text-gray-400 text-sm">Workload distribution</p>
                  </div>
                </div>
                <span className="text-purple-400 font-bold">Balanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Queries */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Recent Queries</h2>
          </div>
          <div className="p-6">
            {recentQueries.length === 0 ? (
              <div className="text-center py-8">
                <FiList className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No queries found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQueries.map((query) => (
                  <div key={query.id} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-white">
                            Query #{query.problem_number}
                          </h3>
                          <span className={getStatusBadge(query.status)}>
                            {query.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-400">
                            {query.query_type}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3 line-clamp-2">{query.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>By: {query.user}</span>
                          <span>Created: {new Date(query.created_at).toLocaleDateString()}</span>
                          {query.current_assignee_name && (
                            <span>Assigned to: {query.current_assignee_name}</span>
                          )}
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