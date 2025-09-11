import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { useAuth } from '../contexts/AuthContext';
import { queryAPI } from '../utils/api';
import { FiArrowLeft, FiCalendar, FiUser, FiTag } from 'react-icons/fi';

export default function QueryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadQuery();
    }
  }, [id]);

  const loadQuery = async () => {
    try {
      setLoading(true);
      const response = await queryAPI.getQueryById(id!);
      setQuery(response.data.query);
    } catch (error) {
      console.error('Error loading query:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (user?.role_name === 'admin') {
      navigate('/admin/queries');
    } else if (user?.role_name === 'specialist') {
      navigate('/specialist/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 text-sm font-medium rounded-full';
    switch (status) {
      case 'open': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'assigned': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'in_progress': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'completed': return `${baseClasses} bg-green-100 text-green-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const theme = user?.role_name === 'admin' ? 'dark' : 'light';

  if (loading) {
    return (
      <Layout theme={theme}>
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
          }`}></div>
        </div>
      </Layout>
    );
  }

  if (!query) {
    return (
      <Layout theme={theme}>
        <div className="text-center py-8">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Query not found
          </p>
          <button
            onClick={goBack}
            className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout theme={theme}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={goBack}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Query #{query.problem_number}
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Query details and status
            </p>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-8 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Description
                </h2>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`whitespace-pre-wrap ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {query.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Query Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Status
                    </label>
                    <span className={getStatusBadge(query.status)}>
                      {query.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Query Type
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiTag className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {query.query_types?.name || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Submitted By
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiUser className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {query.creator?.name || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Assigned To
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiUser className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {query.specialist.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Created
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(query.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Last Updated
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(query.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}