
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; 

  const isAdmin = user?.email === 'ziyahid27@gmail.com'; 

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedAdminRoute;
