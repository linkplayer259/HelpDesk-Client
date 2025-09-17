import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { queryAPI } from '../../utils/api';
import { FiUserCheck, FiList, FiCheckCircle, FiClock } from 'react-icons/fi';

interface SpecialistWithStats {
  name: string;
  totalQueries: number;
  completedQueries: number;
  pendingQueries: number;
}

export default function EmployeeSpecialists() {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState<SpecialistWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSpecialists();
    }
  }, [user]);

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      
      // Get all queries for this employee
      const response = await queryAPI.getUserQueries(user!.id);
      const userQueries = response.data.queries;
      
      // Extract unique specialists who have been assigned to this employee's queries
      const specialistMap = new Map<string, SpecialistWithStats>();
      
      userQueries.forEach((query: any) => {
        if (query.current_assignee_name) {
          const specialistName = query.current_assignee_name;
          
          if (!specialistMap.has(specialistName)) {
            specialistMap.set(specialistName, {
              name: specialistName,
              totalQueries: 0,
              completedQueries: 0,
              pendingQueries: 0
            });
          }
          
          const specialist = specialistMap.get(specialistName)!;
          specialist.totalQueries++;
          
          if (query.status === 'completed') {
            specialist.completedQueries++;
          } else if (['assigned', 'in_progress', 'open'].includes(query.status)) {
            specialist.pendingQueries++;
          }
        }
      });
      
      setSpecialists(Array.from(specialistMap.values()));
    } catch (error) {
      console.error('Error loading specialists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout theme="light">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout theme="light">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Specialists</h1>
          <p className="text-gray-600 mt-1">Specialists who have worked on your queries</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            {specialists.length === 0 ? (
              <div className="text-center py-8">
                <FiUserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No specialists have been assigned to your queries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialists.map((specialist) => (
                  <div key={specialist.name} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-3">
                          <FiUserCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{specialist.name}</h3>
                          <p className="text-gray-600 text-sm">Technical Specialist</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{specialist.totalQueries}</p>
                        <p className="text-gray-600 text-xs">Your Queries</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiList className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 text-sm">Total Assigned</span>
                        </div>
                        <span className="text-gray-900 font-medium">{specialist.totalQueries}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiClock className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600 text-sm">Pending</span>
                        </div>
                        <span className="text-blue-600 font-medium">{specialist.pendingQueries}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiCheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600 text-sm">Completed</span>
                        </div>
                        <span className="text-green-600 font-medium">{specialist.completedQueries}</span>
                      </div>
                    </div>

                    {/* Performance indicator */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="text-gray-900">
                          {specialist.totalQueries > 0 ? Math.round((specialist.completedQueries / specialist.totalQueries) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${specialist.totalQueries > 0 ? (specialist.completedQueries / specialist.totalQueries) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          specialist.pendingQueries === 0 
                            ? 'bg-green-100 text-green-800' 
                            : specialist.pendingQueries < 3 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {specialist.pendingQueries === 0 ? 'All Complete' : 
                           specialist.pendingQueries < 3 ? 'Working' : 'Busy'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {specialist.completedQueries} of {specialist.totalQueries} done
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {specialists.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{specialists.length}</p>
                <p className="text-gray-600 text-sm">Specialists Worked With</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {specialists.reduce((sum, s) => sum + s.completedQueries, 0)}
                </p>
                <p className="text-gray-600 text-sm">Total Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {specialists.reduce((sum, s) => sum + s.pendingQueries, 0)}
                </p>
                <p className="text-gray-600 text-sm">Still Pending</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}