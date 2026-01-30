import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import PageLoader from '../components/common/PageLoader';

const Home = lazy(() => import('../pages/Home'));
const Upload = lazy(() => import('../pages/Upload'));
const Result = lazy(() => import('../pages/Result'));
const History = lazy(() => import('../pages/History'));
const Statistics = lazy(() => import('../pages/Statistics'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#22c55e',
            borderRadius: 12,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      >
        <AntApp>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/result/:id" element={<Result />} />
                <Route
                  path="/history"
                  element={
                    <PrivateRoute>
                      <History />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/statistics"
                  element={
                    <PrivateRoute>
                      <Statistics />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route element={<AuthLayout />}>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
              </Route>
            </Routes>
          </Suspense>
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
