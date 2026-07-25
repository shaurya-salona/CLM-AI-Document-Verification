import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import NewRequest from './pages/NewRequest';
import VendorStatus from './pages/VendorStatus';
import ApproverDashboard from './pages/ApproverDashboard';
import RequestDetails from './pages/RequestDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Vendor Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="vendor" />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/new-request" element={<NewRequest />} />
            <Route path="/vendor/status/:id" element={<VendorStatus />} />
          </Route>

          {/* Approver Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="approver" />}>
            <Route path="/approver/dashboard" element={<ApproverDashboard />} />
            <Route path="/approver/request/:id" element={<RequestDetails />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
