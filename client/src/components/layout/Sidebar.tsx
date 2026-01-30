import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  HomeIcon,
  CameraIcon,
  ChartBarIcon,
  ClockIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: '首页', href: '/', icon: HomeIcon },
  { name: '上传菜品', href: '/upload', icon: CameraIcon },
  { name: '历史记录', href: '/history', icon: ClockIcon, requiresAuth: true },
  { name: '数据统计', href: '/statistics', icon: ChartBarIcon, requiresAuth: true },
  { name: '个人中心', href: '/profile', icon: UserCircleIcon, requiresAuth: true },
  { name: '设置', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  const filteredNav = navigation.filter((item) => {
    if (!item.requiresAuth) return true;
    return isAuthenticated;
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-surface-100 flex flex-col transition-all duration-300 ease-out z-30 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-100">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
            <CameraIcon className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-display font-bold text-lg text-surface-900">
              菜品<span className="text-primary-600">识别</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-surface-100">
          <div className="text-xs text-surface-400 text-center">
            食堂菜品热量识别系统 v1.0
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
