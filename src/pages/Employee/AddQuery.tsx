import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { queryAPI } from '../../utils/api';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

export default function AddQuery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queryTypes, setQueryTypes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    query_type_id: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQueryTypes();
  }, []);

  const loadQueryTypes = async () => {
    try {
      const response = await queryAPI.getQueryTypes();
      setQueryTypes(response.data.queryTypes);
    } catch (error) {
      console.error('Error loading query types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await queryAPI.addQuery({
  query_type_id: parseInt(formData.query_type_id),
  title: formData.title,          // ✅ send title separately
  description: formData.description, // ✅ send description only
  userId: user.id
});


      navigate('/employee/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout theme="light">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Query</h1>
            <p className="text-gray-600 mt-1">Submit a new help desk request</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query Type *
              </label>
              <select
                value={formData.query_type_id}
                onChange={(e) => setFormData({ ...formData, query_type_id: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a query type</option>
                {queryTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide detailed information about your issue, including steps to reproduce if applicable"
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/employee/dashboard')}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                <FiSend className="h-4 w-4" />
                <span>{loading ? 'Submitting...' : 'Submit Query'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}