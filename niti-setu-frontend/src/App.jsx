import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import FarmerProfile from './pages/FarmerProfile';
import EligibilityDashboard from './pages/EligibilityDashboard';
import SchemeChat from './pages/SchemeChat';
import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (user) {
    return <Navigate to="/profile" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/profile" element={<ProtectedRoute><FarmerProfile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><EligibilityDashboard /></ProtectedRoute>} />
            <Route path="/chat/:schemeName" element={<ProtectedRoute><SchemeChat /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
