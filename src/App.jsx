import { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import LoginForm from "./pages/LoginPage";
import SignupForm from "./pages/SignUp";
import DashboardLayout from "./pages/DashboardLayout";

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check token on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAdminLoggedIn(true);
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAdminLoggedIn ? (
            <Navigate to="/admin/dashboard/orders" />
          ) : (
            <LoginForm setIsAdminLoggedIn={setIsAdminLoggedIn} />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAdminLoggedIn ? (
            <Navigate to="/admin/dashboard/orders" />
          ) : (
            <LoginForm setIsAdminLoggedIn={setIsAdminLoggedIn} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAdminLoggedIn ? (
            <Navigate to="/admin/dashboard/orders" />
          ) : (
            <SignupForm />
          )
        }
      />

      {/* Protected Admin Dashboard */}
      <Route
        path="/admin/dashboard/*"
        element={
          isAdminLoggedIn ? (
            <DashboardLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
