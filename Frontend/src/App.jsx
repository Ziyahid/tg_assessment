import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import GoogleAuth from './components/auth/GoogleAuth';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import './index.css';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <GoogleAuth />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        }
      />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;