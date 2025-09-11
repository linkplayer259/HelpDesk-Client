import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { specialistAPI, queryAPI } from '../../utils/api';
import { Link } from 'react-router-dom';
import { FiUserCheck, FiList, FiClock, FiCheckCircle } from 'react-icons/fi';

// Define types for better TypeScript support
interface Specialist {
  name: string;
  // Add other specialist properties as needed
  [key: string]: any;
}

interface Query {
  current_assignee_name: string;
  status: string;
  // Add other query properties as needed
  [key: string]: any;
}

interface SpecialistWithStats extends Specialist {
  totalQueries: number;
  completedQueries: number;
  pendingQueries: number;
}

export default function AdminSpecialists() {
  const [specialists, setSpecialists] = useState<SpecialistWithStats[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load specialists and queries in parallel
      const [specialistsResponse, queriesResponse] = await Promise.all([
        specialistAPI.getSpecialists(),
        queryAPI.getAllQueries()
      ]);

      const specialistsData: Specialist[] = specialistsResponse.data.specialists;
      const queriesData: Query[] = queriesResponse.data.queries;

      console.log('specialists', specialistsData);
      console.log('queries', queriesData);

      // Calculate statistics for each specialist
      const specialistsWithStats: SpecialistWithStats[] = specialistsData.map((specialist: Specialist) => {
        // Filter queries assigned to this specialist
        const specialistQueries = queriesData.filter((query: Query) => 
          query.current_assignee_name === specialist.name
        );

        // Calculate statistics
        const totalQueries = specialistQueries.length;
        const completedQueries = specialistQueries.filter((query: Query) => 
          query.status === 'completed'
        ).length;
        const pendingQueries = specialistQueries.filter((query: Query) => 
          ['assigned', 'in_progress', 'open'].includes(query.status)
        ).length;

        return {
          ...specialist,
          totalQueries,
          completedQueries,
          pendingQueries
        };
      });

      setSpecialists(specialistsWithStats);
      setQueries(queriesData);
    } catch (error) {
      console.error('Error loading data:', error);
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
          <h1 className="text-3xl font-bold text-white">Specialists</h1>
          <p className="text-gray-400 mt-1">View specialist workload and performance</p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6">
            {specialists.length === 0 ? (
              <div className="text-center py-8">
                <FiUserCheck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No specialists found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialists.map((specialist) => (
                  <div key={specialist.name} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500/20 rounded-full p-3">
                          <FiUserCheck className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{specialist.name}</h3>
                          <p className="text-gray-400 text-sm">Technical Specialist</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{specialist.totalQueries}</p>
                        <p className="text-gray-400 text-xs">Total Assigned</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiList className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Total Queries</span>
                        </div>
                        <span className="text-white font-medium">{specialist.totalQueries}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiClock className="h-4 w-4 text-yellow-400" />
                          <span className="text-gray-400 text-sm">Pending</span>
                        </div>
                        <span className="text-yellow-400 font-medium">{specialist.pendingQueries}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiCheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-gray-400 text-sm">Completed</span>
                        </div>
                        <span className="text-green-400 font-medium">{specialist.completedQueries}</span>
                      </div>
                    </div>

                    {/* Workload indicator */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Workload</span>
                        <span className="text-white">
                          {specialist.totalQueries > 0 ? Math.round((specialist.completedQueries / specialist.totalQueries) * 100) : 0}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${specialist.totalQueries > 0 ? (specialist.completedQueries / specialist.totalQueries) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            specialist.pendingQueries === 0 
                              ? 'bg-green-100 text-green-800' 
                              : specialist.pendingQueries < 5 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {specialist.pendingQueries === 0 ? 'Available' : 
                             specialist.pendingQueries < 5 ? 'Busy' : 'Overloaded'}
                          </span>
                        </div>
                        <Link
                          to={`/admin/queries?specialist=${encodeURIComponent(specialist.name)}`}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          View Queries
                        </Link>
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