import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, PlusCircle, LayoutDashboard, UserCircle, Mail, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!currentUser) return null;

  return (
    <nav className="navbar glass-card">
      <div className="nav-brand">
        <Calendar className="nav-icon" />
        <span className="text-gradient font-bold">CampusEventos</span>
      </div>
      
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        
        {currentUser.role === 'faculty' && (
          <Link to="/manage" className={`nav-link ${location.pathname === '/manage' ? 'active' : ''}`}>
            <PlusCircle size={18} />
            <span>Manage Events</span>
          </Link>
        )}
      </div>

      <div className="nav-user">
        <div className="profile-dropdown-container">
          <button 
            className="profile-avatar-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <UserCircle size={32} className="avatar-icon" />
          </button>

          {showDropdown && (
            <div className="profile-dropdown glass-card animate-fade-in">
              <div className="dropdown-header">
                <span className="dropdown-name">{currentUser.name || currentUser.email.split('@')[0]}</span>
                <span className="user-role badge">{currentUser.role}</span>
              </div>
              <div className="dropdown-body">
                <div className="dropdown-item">
                  <User size={16} className="text-muted" />
                  <span>{currentUser.name || 'User'}</span>
                </div>
                <div className="dropdown-item">
                  <Mail size={16} className="text-muted" />
                  <span>{currentUser.email}</span>
                </div>
              </div>
              <div className="dropdown-footer">
                <button onClick={logout} className="dropdown-logout-btn">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
