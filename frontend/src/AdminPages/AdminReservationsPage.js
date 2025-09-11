import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSeance, setSelectedSeance] = useState('');
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const seanceId = searchParams.get('seanceId');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      logout();
      navigate('/admin/login');
      return;
    }
    
    fetchReservations();
    fetchSeances();
  }, [seanceId]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = 'http://localhost:5000/api/admin/reservations';
      if (seanceId) {
        url += `?seance=${seanceId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }
      
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeances = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSeances(data);
        
        if (seanceId) {
          setSelectedSeance(seanceId);
        }
      }
    } catch (err) {
      console.error('Erreur fetch séances:', err);
    }
  };

  const handleSeanceChange = (e) => {
    const newSeanceId = e.target.value;
    setSelectedSeance(newSeanceId);
    
    if (newSeanceId) {
      setSearchParams({ seanceId: newSeanceId });
    } else {
      setSearchParams({});
    }
  };

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const filteredReservations = reservations.filter(reservation =>
    reservation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.film?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${reservation.row}${reservation.seat}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <aside className="sidebar">
          {/* Votre sidebar d'administration */}
        </aside>
        <main className="main-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement des réservations...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
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
            <li>
              <button onClick={() => handleNavigation('dashboard')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Tableau de bord</span>
              </button>
            </li>
            
            <li>
              <button onClick={() => handleNavigation('users')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Utilisateurs</span>
              </button>
            </li>
            
            <li>
              <button onClick={() => handleNavigation('films')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-8h1V5h-1v2zm2 4h1V9h-1v2zm-2 4h1v-2h-1v2zm-8 0h1v-2H7v2zm-2-4h1V9H5v2zm0-4h1V5H5v2zm8 8dv2h1v-2h-1zm2-4h1v-2h-1v2z" clipRule="evenodd" />
                </svg>
                <span>Films</span>
              </button>
            </li>
            
            <li>
              <button onClick={() => handleNavigation('seances')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Séances</span>
              </button>
            </li>
            
            <li className="active">
              <button onClick={() => handleNavigation('reservations')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Réservations</span>
              </button>
            </li>
            
            <li>
              <button onClick={() => handleNavigation('settings')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c.836 1.372-.734 2.942-2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
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

      <main className="main-content">
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
            <h1 className="page-title">Gestion des Réservations</h1>
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

        <div className="content-area">
          <div className="reservations-container">
            <div className="reservations-actions">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Rechercher une réservation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="filter-group">
                <select value={selectedSeance} onChange={handleSeanceChange}>
                  <option value="">Toutes les séances</option>
                  {seances.map(seance => (
                    <option key={seance._id} value={seance._id}>
                      {seance.film?.title} - {new Date(seance.date).toLocaleDateString('fr-FR')} {seance.time}
                    </option>
                  ))}
                </select>
              </div>
              
              <button className="refresh-btn" onClick={fetchReservations}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Actualiser
              </button>
            </div>

            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {filteredReservations.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>Aucune réservation trouvée</p>
              </div>
            ) : (
              <div className="reservations-list">
                {filteredReservations.map((reservation) => (
                  <div key={reservation._id} className="reservation-card">
                    <div className="reservation-header">
                      <h3>{reservation.film}</h3>
                      <div className="reservation-date-time">
                        <span className="reservation-date">
                          {formatDate(reservation.date)} {formatTime(reservation.time)}
                        </span>
                        <span className="reservation-seat">{reservation.row}{reservation.seat}</span>
                      </div>
                    </div>
                    
                    <div className="reservation-details">
                      <div className="reservation-info">
                        <span>Utilisateur: {reservation.user?.name || 'Inconnu'} ({reservation.user?.email})</span>
                        <span>Réservé le: {formatDate(reservation.reservationDate)}</span>
                      </div>
                      
                      <div className="reservation-id">
                        <span>ID: {reservation._id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f5f7fa;
        }

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
          padding: 0;
          margin: 0;
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

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

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

        .content-area {
          flex: 1;
          padding: 25px;
          background-color: #f5f7fa;
        }

        .reservations-container {
          width: 100%;
        }

        .reservations-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
        }

        .search-bar {
          position: relative;
          flex-grow: 1;
          max-width: 400px;
        }

        .search-bar input {
          width: 80%;
          padding: 10px 15px 10px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s;
          background-color: #f9fafb;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
          background-color: white;
        }

        .search-bar svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #9ca3af;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-group select {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background-color: #f9fafb;
          transition: all 0.3s;
        }

        .filter-group select:focus {
          outline: none;
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
          background-color: white;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          background-color: #1a56db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .refresh-btn:hover {
          background-color: #164ec9;
        }

        .refresh-btn svg {
          width: 16px;
          height: 16px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .error-message svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          gap: 20px;
        }

        .loading-container p {
          color: #4b5563;
          font-size: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(26, 86, 219, 0.1);
          border-radius: 50%;
          border-top-color: #1a56db;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          background-color: #f9fafb;
          border-radius: 12px;
          gap: 15px;
        }

        .empty-state svg {
          width: 48px;
          height: 48px;
          color: #9ca3af;
        }

        .empty-state p {
          color: #4b5563;
          font-size: 16px;
          margin: 0;
        }

        .reservations-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .reservation-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .reservation-header h3 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .reservation-date-time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .reservation-date {
          font-weight: 600;
          color: #374151;
        }

        .reservation-seat {
          font-size: 18px;
          font-weight: 700;
          color: #1a56db;
        }

        .reservation-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .reservation-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .reservation-info span {
          font-size: 14px;
          color: #6b7280;
        }

        .reservation-id {
          display: flex;
          align-items: center;
        }

        .reservation-id span {
          font-size: 14px;
          font-weight: 600;
          color: #059669;
        }

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

          .reservations-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-bar {
            max-width: 100%;
            width: 100%;
          }

          .filter-group {
            width: 100%;
          }

          .filter-group select {
            width: 100%;
          }

          .refresh-btn {
            width: 100%;
            justify-content: center;
          }

          .reservation-header {
            flex-direction: column;
            gap: 10px;
          }

          .reservation-date-time {
            align-items: flex-start;
          }

          .reservation-details {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}