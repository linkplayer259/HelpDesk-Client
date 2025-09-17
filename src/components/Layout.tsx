import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiPlus, FiUser, FiUsers, FiList, FiSettings, 
  FiLogOut, FiBarChart2, FiTag, FiUserCheck 
} from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
}

export default function Layout({ children, theme = 'light' }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';
  const sidebarBgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200';
  const linkBaseClass = isDark 
    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const activeLinkClass = isDark 
    ? 'text-white bg-gray-700 border-blue-400' 
    : 'text-blue-600 bg-blue-50 border-blue-500';

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role_name) {
      case 'employee':
        return [
          { path: '/employee/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/employee/my-queries', icon: FiList, label: 'My Queries' },
          { path: '/employee/add-query', icon: FiPlus, label: 'Add Query' },
          { path: '/employee/specialists', icon: FiUserCheck, label: 'Specialists' },
        ];
      case 'specialist':
        return [
          { path: '/specialist/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/specialist/queries', icon: FiList, label: 'My Queries' },
          { path: '/specialist/employees', icon: FiUser, label: 'Employees' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: FiBarChart2, label: 'Dashboard' },
          { path: '/admin/users', icon: FiUsers, label: 'Users' },
          { path: '/admin/employees', icon: FiUser, label: 'Employees' },
          { path: '/admin/specialists', icon: FiUserCheck, label: 'Specialists' },
          { path: '/admin/queries', icon: FiList, label: 'Queries' },
          { path: '/admin/query-types', icon: FiTag, label: 'Query Types' },
          { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 ${sidebarBgClass} border-r min-h-screen`}>
          <div className="p-6">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              IT Help Desk
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.role_name?.charAt(0).toUpperCase() + user?.role_name?.slice(1)} Panel
            </p>
          </div>

          <nav className="mt-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium border-r-3 transition-colors ${
                    isActive 
                      ? activeLinkClass 
                      : `${linkBaseClass} border-transparent`
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
            <div className={`flex items-center space-x-3 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <FiUser className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name}
                </p>
                <p className="text-xs truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className={`flex items-center text-sm w-full px-3 py-2 rounded-lg transition-colors ${linkBaseClass}`}
            >
              <FiLogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}