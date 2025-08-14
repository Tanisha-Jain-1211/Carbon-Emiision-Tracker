import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FoodInput from './pages/FoodInput';
import TravelInput from './pages/TravelInput';
import ElectricityInput from './pages/ElectricityInput';
import LifestyleInput from './pages/LifestyleInput';
import Share from './pages/Share';
import Leaderboard from './pages/Leaderboard';
import Track from './pages/Track';
import { EmissionProvider } from './context/EmissionContext';
import 'leaflet/dist/leaflet.css';


function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/user`, {
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        else navigate('/');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <EmissionProvider>
      <div>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food"
            element={
              <ProtectedRoute user={user}>
                <FoodInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/travel"
            element={
              <ProtectedRoute user={user}>
                <TravelInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/electricity"
            element={
              <ProtectedRoute user={user}>
                <ElectricityInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lifestyle"
            element={
              <ProtectedRoute user={user}>
                <LifestyleInput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/share"
            element={
              <ProtectedRoute user={user}>
                <Share />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute user={user}>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track"
            element={
              <ProtectedRoute user={user}>
                <Track />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </EmissionProvider>
  );
}

export default App;
