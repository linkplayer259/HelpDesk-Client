import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/Employee/Dashboard';
import EmployeeAddQuery from './pages/Employee/AddQuery';
import SpecialistDashboard from './pages/Specialist/Dashboard';
import SpecialistQueries from './pages/Specialist/Queries';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminEmployees from './pages/Admin/Employees';
import AdminSpecialists from './pages/Admin/Specialists';
import AdminQueries from './pages/Admin/Queries';
import AdminQueryTypes from './pages/Admin/QueryTypes';
import AdminSettings from './pages/Admin/Settings';
import QueryDetails from './components/QueryDetails';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const roleRoutes = {
    employee: (
      <Routes>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/my-queries" element={<EmployeeMyQueries />} />
        <Route path="/employee/add-query" element={<EmployeeAddQuery />} />
        <Route path="/employee/specialists" element={<EmployeeSpecialists />} />
        <Route path="/employee/query/:id" element={<QueryDetails />} />
        <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
      </Routes>
    ),
    specialist: (
      <Routes>
        <Route path="/specialist/dashboard" element={<SpecialistDashboard />} />
        <Route path="/specialist/queries" element={<SpecialistQueries />} />
        <Route path="/specialist/employees" element={<SpecialistEmployees />} />
        <Route path="/specialist/query/:id" element={<QueryDetails />} />
        <Route path="*" element={<Navigate to="/specialist/dashboard" replace />} />
      </Routes>
    ),
    admin: (
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/specialists" element={<AdminSpecialists />} />
        <Route path="/admin/queries" element={<AdminQueries />} />
        <Route path="/admin/query-types" element={<AdminQueryTypes />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/query/:id" element={<QueryDetails />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    )
  };

  return roleRoutes[user.role_name as keyof typeof roleRoutes] || (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;