import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import {
  HomeIcon,
  CameraIcon,
  ChartBarIcon,
  ClockIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: '首页', href: '/', icon: HomeIcon },
  { name: '上传菜品', href: '/upload', icon: CameraIcon },
  { name: '历史记录', href: '/history', icon: ClockIcon, requiresAuth: true },
  { name: '数据统计', href: '/statistics', icon: ChartBarIcon, requiresAuth: true },
  { name: '个人中心', href: '/profile', icon: UserCircleIcon, requiresAuth: true },
  { name: '设置', href: '/settings', icon: Cog6ToothIcon },
];

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const filteredNav = navigation.filter((item) => {
    if (!item.requiresAuth) return true;
    return isAuthenticated;
  });

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-surface-100 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 transition-colors hidden lg:block"
          >
            {sidebarCollapsed ? (
              <Bars3Icon className="w-6 h-6" />
            ) : (
              <XMarkIcon className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 transition-colors lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-surface-600 hidden sm:block">
                你好，<span className="font-semibold text-surface-900">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-red-500 transition-colors"
                title="退出登录"
              >
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/login" className="btn-ghost text-sm">
                登录
              </Link>
              <Link to="/auth/register" className="btn-primary text-sm">
                注册
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl animate-slide-up">
            <div className="p-4 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg">菜单</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-surface-500 hover:bg-surface-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {filteredNav.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
