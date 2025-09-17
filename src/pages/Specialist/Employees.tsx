import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { queryAPI } from '../../utils/api';
import { FiUser, FiList, FiCheckCircle, FiClock } from 'react-icons/fi';

interface EmployeeWithStats {
  name: string;
  totalQueries: number;
  completedQueries: number;
  pendingQueries: number;
}

export default function SpecialistEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Get all queries assigned to this specialist
      const response = await queryAPI.getAllQueries();
      const allQueries = response.data.queries;
      
      // Filter queries assigned to this specialist
      const specialistQueries = allQueries.filter(
        (query: any) => query.current_assignee_name === user?.name
      );
      
      // Extract unique employees whose queries have been assigned to this specialist
      const employeeMap = new Map<string, EmployeeWithStats>();
      
      specialistQueries.forEach((query: any) => {
        if (query.user) {
          const employeeName = query.user;
          
          if (!employeeMap.has(employeeName)) {
            employeeMap.set(employeeName, {
              name: employeeName,
              totalQueries: 0,
              completedQueries: 0,
              pendingQueries: 0
            });
          }
          
          const employee = employeeMap.get(employeeName)!;
          employee.totalQueries++;
          
          if (query.status === 'completed') {
            employee.completedQueries++;
          } else if (['assigned', 'in_progress', 'open'].includes(query.status)) {
            employee.pendingQueries++;
          }
        }
      });
      
      setEmployees(Array.from(employeeMap.values()));
    } catch (error) {
      console.error('Error loading employees:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">My Employees</h1>
          <p className="text-gray-600 mt-1">Employees whose queries you have worked on</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <FiUser className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No employee queries have been assigned to you yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                  <div key={employee.name} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-full p-3">
                          <FiUser className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-gray-600 text-sm">Employee</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{employee.totalQueries}</p>
                        <p className="text-gray-600 text-xs">Queries Handled</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiList className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 text-sm">Total Queries</span>
                        </div>
                        <span className="text-gray-900 font-medium">{employee.totalQueries}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiClock className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600 text-sm">Pending</span>
                        </div>
                        <span className="text-blue-600 font-medium">{employee.pendingQueries}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiCheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600 text-sm">Completed</span>
                        </div>
                        <span className="text-green-600 font-medium">{employee.completedQueries}</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Resolution Rate</span>
                        <span className="text-gray-900">
                          {employee.totalQueries > 0 ? Math.round((employee.completedQueries / employee.totalQueries) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${employee.totalQueries > 0 ? (employee.completedQueries / employee.totalQueries) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.pendingQueries === 0 
                            ? 'bg-green-100 text-green-800' 
                            : employee.pendingQueries < 3 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.pendingQueries === 0 ? 'All Resolved' : 
                           employee.pendingQueries < 3 ? 'In Progress' : 'High Priority'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {employee.completedQueries} of {employee.totalQueries} resolved
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
        {employees.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{employees.length}</p>
                <p className="text-gray-600 text-sm">Employees Helped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {employees.reduce((sum, e) => sum + e.totalQueries, 0)}
                </p>
                <p className="text-gray-600 text-sm">Total Queries Handled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {employees.length > 0 ? Math.round(
                    (employees.reduce((sum, e) => sum + e.completedQueries, 0) / 
                     employees.reduce((sum, e) => sum + e.totalQueries, 0)) * 100
                  ) : 0}%
                </p>
                <p className="text-gray-600 text-sm">Overall Resolution Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}