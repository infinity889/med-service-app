import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { MainLayout } from './layouts/MainLayout'
import { AuthProvider, useAuth } from './context/AuthContext'

// Lazy-loaded components for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Search = React.lazy(() => import('./pages/Search').then(module => ({ default: module.Search })))
const ClinicDetails = React.lazy(() => import('./pages/ClinicDetails').then(module => ({ default: module.ClinicDetails })))
const ServiceDetails = React.lazy(() => import('./pages/ServiceDetails').then(module => ({ default: module.ServiceDetails })))
const Clinics = React.lazy(() => import('./pages/Clinics').then(module => ({ default: module.Clinics })))
const Services = React.lazy(() => import('./pages/Services').then(module => ({ default: module.Services })))
const Compare = React.lazy(() => import('./pages/Compare').then(module => ({ default: module.Compare })))
const History = React.lazy(() => import('./pages/History').then(module => ({ default: module.History })))
const Statistics = React.lazy(() => import('./pages/Statistics').then(module => ({ default: module.Statistics })))
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })))
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })))
const Register = React.lazy(() => import('./pages/Register').then(module => ({ default: module.Register })))
const Landing = React.lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })))
const Moderator = React.lazy(() => import('./pages/Moderator').then(module => ({ default: module.Moderator })))

const queryClient = new QueryClient()

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/register" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Fallback component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen w-full bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<MainLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="search" element={<Search />} />
                <Route path="clinics" element={<Clinics />} />
                <Route path="clinics/:id" element={<ProtectedRoute><ClinicDetails /></ProtectedRoute>} />
                <Route path="services" element={<Services />} />
                <Route path="services/:id" element={<ProtectedRoute><ServiceDetails /></ProtectedRoute>} />
                <Route path="compare" element={<Compare />} />
                <Route path="history" element={<History />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="moderator" element={<AdminRoute><Moderator /></AdminRoute>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
