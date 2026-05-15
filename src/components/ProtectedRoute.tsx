import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('institution' | 'graduate' | 'verifier')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ui-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-burkina-red border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase text-ui-muted tracking-widest">Sécurisation...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective correct page if role mismatched
    if (user.role === 'institution') return <Navigate to="/admin" replace />;
    if (user.role === 'graduate') return <Navigate to="/espace-diplome" replace />;
    if (user.role === 'verifier') return <Navigate to="/verifier" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
