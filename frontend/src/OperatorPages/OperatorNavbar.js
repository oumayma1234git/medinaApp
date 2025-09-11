import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OperatorNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="operator-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/operator/dashboard">
            <h2>Cinema Medina - Opérateur</h2>
          </Link>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-items">
            <Link 
              to="/operator/dashboard" 
              className={`navbar-item ${isActive('/operator/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/operator/films" 
              className={`navbar-item ${isActive('/operator/films') ? 'active' : ''}`}
            >
              Films
            </Link>
            <Link 
              to="/operator/seances" 
              className={`navbar-item ${isActive('/operator/seances') ? 'active' : ''}`}
            >
              Séances
            </Link>
            <Link 
              to="/operator/reservations" 
              className={`navbar-item ${isActive('/operator/reservations') ? 'active' : ''}`}
            >
              Réservations
            </Link>
            <Link 
              to="/operator/stats" 
              className={`navbar-item ${isActive('/operator/stats') ? 'active' : ''}`}
            >
              Statistiques
            </Link>
          </div>

          <div className="navbar-user">
            <span className="user-name">Opérateur: {user?.name || user?.username || 'Utilisateur'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="mobile-user-info">
          <span className="user-name">{user?.name || user?.username || 'Utilisateur'}</span>
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <style jsx>{`
        .operator-navbar {
          background: #1a293b;
          color: white;
          padding: 0 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
          position: relative;
        }
        
        .navbar-brand h2 {
          margin: 0;
          color: white;
          font-size: 20px;
        }
        
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        
        .navbar-items {
          display: flex;
          gap: 20px;
        }
        
        .navbar-item {
          color: #e5e7eb;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.3s, color 0.3s;
        }
        
        .navbar-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .navbar-item.active {
          background: #1a56db;
          color: white;
        }
        
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-name {
          font-size: 16px;
          color: white;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          border-radius: 6px;
        }
        
        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        
        .logout-btn:hover {
          background: #dc2626;
        }
        
        .navbar-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }
        
        .mobile-user-info {
          display: none;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 10px;
          border-radius: 6px;
          margin-right: 15px;
        }
        
        .navbar-toggle span {
          width: 25px;
          height: 3px;
          background: white;
          margin: 3px 0;
          transition: 0.3s;
        }
        
        @media (max-width: 768px) {
          .navbar-menu {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: #1a293b;
            flex-direction: column;
            padding: 20px;
            gap: 20px;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
            z-index: 1000;
          }
          
          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          
          .navbar-items {
            flex-direction: column;
            gap: 15px;
            width: 100%;
          }
          
          .navbar-user {
            flex-direction: column;
            gap: 15px;
            width: 100%;
            padding-top: 20px;
            border-top: 1px solid #374151;
          }
          
          .navbar-user .user-name {
            font-size: 18px;
            text-align: center;
          }
          
          .mobile-user-info {
            display: block;
            font-size: 16px;
            color: white;
          }
          
          .navbar-toggle {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};

export default OperatorNavbar;