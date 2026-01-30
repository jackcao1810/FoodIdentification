import { lazy } from 'react';

const Home = lazy(() => import('../pages/Home'));
const Upload = lazy(() => import('../pages/Upload'));
const Result = lazy(() => import('../pages/Result'));
const History = lazy(() => import('../pages/History'));
const Statistics = lazy(() => import('../pages/Statistics'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
  meta?: {
    title: string;
    requiresAuth?: boolean;
    hideInNav?: boolean;
  };
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: lazy(() => import('../components/layout/MainLayout')),
    children: [
      { path: '', element: Home, meta: { title: '首页' } },
      { path: 'upload', element: Upload, meta: { title: '上传菜品' } },
      { path: 'result/:id', element: Result, meta: { title: '识别结果' } },
      { path: 'history', element: History, meta: { title: '历史记录', requiresAuth: true } },
      { path: 'statistics', element: Statistics, meta: { title: '数据统计', requiresAuth: true } },
      { path: 'profile', element: Profile, meta: { title: '个人中心', requiresAuth: true } },
      { path: 'settings', element: Settings, meta: { title: '设置' } },
    ],
  },
  {
    path: '/auth',
    element: lazy(() => import('../components/layout/AuthLayout')),
    children: [
      { path: 'login', element: Login, meta: { title: '登录', hideInNav: true } },
      { path: 'register', element: Register, meta: { title: '注册', hideInNav: true } },
    ],
  },
];

export const getPageTitle = (pathname: string, routes: RouteConfig[]): string => {
  for (const route of routes) {
    if (route.path === pathname) {
      return route.meta?.title || '';
    }
    if (route.children) {
      for (const child of route.children) {
        if (child.path === pathname || pathname.startsWith(child.path.replace(':id', ''))) {
          return child.meta?.title || '';
        }
      }
    }
  }
  return '食堂菜品识别';
};
