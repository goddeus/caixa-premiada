import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CaseDetails from './pages/CaseDetails';
// import Wallet from './pages/Wallet'; // REMOVIDO - página deletada
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
import Withdraw from './pages/Withdraw';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function AppRoutes() {
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
      <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
      {/* <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} /> REMOVIDO - página deletada */}
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