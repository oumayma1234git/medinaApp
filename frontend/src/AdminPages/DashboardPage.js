import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNavigation = (path) => {
    setActiveTab(path);
    navigate(`/admin/${path}`);
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-circle">
              <div className="logo-initials">CM</div>
            </div>
            <div className="logo-text">
              <span className="logo-title">Cinema Medina</span>
              <span className="logo-subtitle">Administration</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''}>
              <button onClick={() => handleNavigation('dashboard')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Tableau de bord</span>
              </button>
            </li>
            
            <li className={activeTab === 'users' ? 'active' : ''}>
              <button onClick={() => handleNavigation('users')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Utilisateurs</span>
              </button>
            </li>
            
            <li className={activeTab === 'films' ? 'active' : ''}>
              <button onClick={() => handleNavigation('films')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-8h1V5h-1v2zm2 4h1V9h-1v2zm-2 4h1v-2h-1v2zm-8 0h1v-2H7v2zm-2-4h1V9H5v2zm0-4h1V5H5v2zm8 8v2h1v-2h-1zm2-4h1v-2h-1v2z" clipRule="evenodd" />
                </svg>
                <span>Films</span>
              </button>
            </li>
            
            <li className={activeTab === 'seances' ? 'active' : ''}>
              <button onClick={() => handleNavigation('seances')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Séances</span>
              </button>
            </li>
            
            <li className={activeTab === 'reservations' ? 'active' : ''}>
              <button onClick={() => handleNavigation('reservations')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Réservations</span>
              </button>
            </li>
            
            <li className={activeTab === 'settings' ? 'active' : ''}>
              <button onClick={() => handleNavigation('settings')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Paramètres</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Tableau de bord'}
              {activeTab === 'users' && 'Gestion des utilisateurs'}
              {activeTab === 'films' && 'Gestion des films'}
              {activeTab === 'seances' && 'Gestion des séances'}
              {activeTab === 'reservations' && 'Gestion des réservations'}
              {activeTab === 'settings' && 'Paramètres'}
            </h1>
          </div>
          
          <div className="header-right">
            <div className="user-profile">
              <div className="avatar">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="user-info">
                <span className="user-name">{admin?.name || 'Admin'}</span>
                <span className="user-role">Administrateur</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>

      <style jsx>{`
        /* Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f5f7fa;
        }

        /* Loading Screen */
        .loading-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          background-color: #f5f7fa;
        }

        .spinner-container {
          text-align: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(26, 86, 219, 0.1);
          border-radius: 50%;
          border-top-color: #1a56db;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background-color: #1f2937;
          color: white;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
          z-index: 100;
        }

        .sidebar-header {
          padding: 25px 20px;
          border-bottom: 1px solid #374151;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .logo-initials {
          font-size: 16px;
          font-weight: 700;
          color: white;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 12px;
          opacity: 0.7;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
        }

        .sidebar-nav li {
          margin-bottom: 5px;
        }

        .sidebar-nav button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: #d1d5db;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .sidebar-nav button:hover {
          background-color: #374151;
          color: white;
        }

        .sidebar-nav button svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: #9ca3af;
        }

        .sidebar-nav li.active button {
          background-color: #111827;
          color: white;
          border-left: 4px solid #1a56db;
        }

        .sidebar-nav li.active button svg {
          color: #1a56db;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #374151;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          background: transparent;
          border: none;
          color: #d1d5db;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
        }

        .logout-btn:hover {
          background-color: #374151;
          color: white;
        }

        .logout-btn svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: #9ca3af;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* Top Header Styles */
        .top-header {
          height: 70px;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 25px;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }

        .mobile-menu-btn svg {
          width: 24px;
          height: 24px;
          color: #4b5563;
        }

        .page-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #1a56db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .user-role {
          font-size: 12px;
          color: #6b7280;
        }

        /* Content Area Styles */
        .content-area {
          flex: 1;
          padding: 25px;
          background-color: #f5f7fa;
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            z-index: 1000;
          }

          .sidebar.mobile-open {
            left: 0;
          }

          .mobile-menu-btn {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .top-header {
            padding: 0 15px;
          }

          .content-area {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;