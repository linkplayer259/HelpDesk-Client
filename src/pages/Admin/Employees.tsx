import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { userAPI, queryAPI } from '../../utils/api';
import { Link } from 'react-router-dom';
import { FiUser, FiList, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const usersResponse = await userAPI.getUsers();
      const users = usersResponse.data.data;
      
      // Filter employees (assuming role_id 2 is employee)
      const employeeList = users.filter((user: any) => user.role_id === 2);
      setEmployees(employeeList);

      // Load query stats for each employee
      const stats: Record<string, any> = {};
      await Promise.all(
        employeeList.map(async (employee: any) => {
          try {
            const queriesResponse = await queryAPI.getUserQueries(employee.id);
            const queries = queriesResponse.data.queries;
            
            stats[employee.id] = {
              totalQueries: queries.length,
              pendingQueries: queries.filter((q: any) => 
                q.status === 'open' || q.status === 'assigned' || q.status === 'in_progress'
              ).length,
              completedQueries: queries.filter((q: any) => q.status === 'completed').length,
            };
          } catch (error) {
            console.error(`Error loading queries for employee ${employee.id}:`, error);
            stats[employee.id] = {
              totalQueries: 0,
              pendingQueries: 0,
              completedQueries: 0,
            };
          }
        })
      );
      
      setEmployeeStats(stats);
    } catch (error) {
      console.error('Error loading employees:', error);
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
          <h1 className="text-3xl font-bold text-white">Employees</h1>
          <p className="text-gray-400 mt-1">Manage employees and view their query statistics</p>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6">
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <FiUser className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No employees found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => {
                  const stats = employeeStats[employee.id] || {
                    totalQueries: 0,
                    pendingQueries: 0,
                    completedQueries: 0
                  };

                  return (
                    <div key={employee.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-600 rounded-full p-3">
                            <FiUser className="h-6 w-6 text-gray-300" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
                            <p className="text-gray-400 text-sm">{employee.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          employee.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FiList className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">Total Queries</span>
                          </div>
                          <span className="text-white font-medium">{stats.totalQueries}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FiClock className="h-4 w-4 text-yellow-400" />
                            <span className="text-gray-400 text-sm">Pending</span>
                          </div>
                          <span className="text-yellow-400 font-medium">{stats.pendingQueries}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-gray-400 text-sm">Completed</span>
                          </div>
                          <span className="text-green-400 font-medium">{stats.completedQueries}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            Joined: {new Date(employee.created_at).toLocaleDateString()}
                          </span>
                          <Link
                            to={`/admin/queries?employee=${employee.id}`}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View Queries
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}