import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navigation } from './components/Navigation';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ManageEvents from './pages/ManageEvents';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/auth" />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {currentUser && <Navigation />}
        
        <main className="container animate-fade-in mt-4">
          <Routes>
            <Route path="/auth" element={!currentUser ? <Auth /> : <Navigate to="/dashboard" />} />
            
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/manage" 
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <ManageEvents />
                </PrivateRoute>
              } 
            />

            <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/auth'} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
