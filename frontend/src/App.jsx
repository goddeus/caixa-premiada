import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CaseDetails from './pages/CaseDetails';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Affiliates from './pages/Affiliates';
import Admin from './pages/Admin';
import NikeCase from './pages/NikeCase';
import ConsoleCase from './pages/ConsoleCase';
import PremiumMasterCase from './pages/PremiumMasterCase';
import AppleCase from './pages/AppleCase';
import WeekendCase from './pages/WeekendCase';
import SamsungCase from './pages/SamsungCase';
import Profile from './pages/Profile';
import GameHistory from './pages/GameHistory';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Aguardar carregamento da autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Dashboard route - accessible to all (login via modal) */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Navigate to="/" />} />
      <Route path="/register" element={<Navigate to="/" />} />
      
      {/* Case routes - accessible to all but with proper auth check */}
      <Route path="/nike-case" element={<NikeCase />} />
      <Route path="/console-case" element={<ConsoleCase />} />
      <Route path="/premium-master-case" element={<PremiumMasterCase />} />
      <Route path="/apple-case" element={<AppleCase />} />
      <Route path="/samsung-case" element={<SamsungCase />} />
      <Route path="/weekend-case" element={<WeekendCase />} />
      
      {/* Protected routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/game-history" element={<ProtectedRoute><GameHistory /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/affiliates" element={<ProtectedRoute><Affiliates /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/cases/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;