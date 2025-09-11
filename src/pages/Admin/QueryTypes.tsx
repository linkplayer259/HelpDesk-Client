import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { queryAPI } from '../../utils/api';
import { FiTag, FiList } from 'react-icons/fi';

export default function AdminQueryTypes() {
  const [queryTypes, setQueryTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueryTypes();
  }, []);

  const loadQueryTypes = async () => {
    try {
      setLoading(true);
      const response = await queryAPI.getQueryTypes();
      setQueryTypes(response.data.queryTypes);
    } catch (error) {
      console.error('Error loading query types:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Query Types</h1>
          <p className="text-gray-400 mt-1">Manage query categories and types</p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6">
            {queryTypes.length === 0 ? (
              <div className="text-center py-8">
                <FiTag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No query types found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {queryTypes.map((type) => (
                  <div key={type.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-500/20 rounded-full p-3 flex-shrink-0">
                        <FiTag className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2">{type.name}</h3>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <FiList className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Active query type</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                          <span className="text-xs text-gray-400">ID: {type.id}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Query Type Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{queryTypes.length}</p>
              <p className="text-gray-400 text-sm">Total Types</p>
            </div>
            {/* <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {queryTypes.filter(t => t.is_active).length}
              </p>
              <p className="text-gray-400 text-sm">Active</p>
            </div> */}
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">6</p>
              <p className="text-gray-400 text-sm">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">100%</p>
              <p className="text-gray-400 text-sm">Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}