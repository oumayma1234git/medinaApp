import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorNavbar from './OperatorNavbar';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    films: 0,
    seances: 0,
    reservations: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState('');
  const [errorActivities, setErrorActivities] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/operatorRoutes/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setError('Impossible de charger les statistiques');
        setLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await fetch('http://localhost:5000/api/operatorRoutes/recent-activities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des activités récentes');
        }
        
        const data = await response.json();
        setRecentActivities(data);
        setLoadingActivities(false);
      } catch (error) {
        console.error('Erreur lors du chargement des activités récentes:', error);
        setErrorActivities('Impossible de charger les activités récentes');
        setLoadingActivities(false);
      }
    };

    fetchStats();
    fetchRecentActivities();
  }, []);

  // Fonction pour formater la date relative (il y a...)
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) {
      return 'Il y a moins d\'une minute';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `Il y a ${months} mois`;
    }
    
    const years = Math.floor(months / 12);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="operator-dashboard">
        <OperatorNavbar />
        <div className="operator-content">
          <div className="loading">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-dashboard">
      <OperatorNavbar />
      
      <div className="operator-content">
        <div className="dashboard-header">
          <h1>Dashboard Opérateur</h1>
          <p>Bienvenue, {user?.username}</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f2fd' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1976d2">
                <path d="M18 3H6C4.346 3 3 4.346 3 6v12c0 1.654 1.346 3 3 3h12c1.654 0 3-1.346 3-3V6c0-1.654-1.346-3-3-3zM6 5h12c.551 0 1 .449 1 1v1H5V6c0-.551.449-1 1-1zm12 14H6c-.551 0-1-.449-1-1V9h14v9c0 .551-.449 1-1 1z"/>
                <circle cx="8" cy="12" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="16" cy="12" r="1.5"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.films}</h3>
              <p>Films</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e9' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#388e3c">
                <path d="M19 4h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                <path d="M7 12h5v5H7z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.seances}</h3>
              <p>Séances</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff3e0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f57c00">
                <path d="M4 9v10h16V9H4zm16-2V4c0-1.1-.9-2-2-2h-3c0-1.1-.9-2-2-2H9C7.9 0 7 .9 7 2H4c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2z"/>
                <path d="M8 4h8v2H8z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.reservations}</h3>
              <p>Réservations</p>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Activité Récente</h2>
          {errorActivities && (
            <div className="error-message">
              {errorActivities}
            </div>
          )}
          <div className="activity-list">
            {loadingActivities ? (
              <div className="loading">Chargement des activités...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div className="activity-item" key={index}>
                  <div className="activity-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activity.type === 'seance' ? '#1976d2' : '#388e3c'}>
                      {activity.type === 'seance' ? (
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      ) : (
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      )}
                    </svg>
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                Aucune activité récente à afficher
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .operator-dashboard {
          min-height: 100vh;
          background: #f9fafb;
        }
        
        .operator-content {
          padding: 20px;
        }
        
        .dashboard-header {
          margin-bottom: 30px;
        }
        
        .dashboard-header h1 {
          font-size: 28px;
          color: #1a293b;
          margin-bottom: 5px;
        }
        
        .dashboard-header p {
          color: #6b7280;
          font-size: 16px;
        }
        
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
        }
        
        .stat-icon svg {
          width: 30px;
          height: 30px;
        }
        
        .stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          color: #1a293b;
          margin: 0;
        }
        
        .stat-content p {
          color: #6b7280;
          margin: 5px 0 0;
        }
        
        .recent-activity {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .recent-activity h2 {
          font-size: 20px;
          color: #1a293b;
          margin-bottom: 20px;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
        }
        
        .activity-icon svg {
          width: 20px;
          height: 20px;
        }
        
        .activity-content p {
          margin: 0;
          color: #1a293b;
          font-weight: 500;
        }
        
        .activity-content span {
          color: #9ca3af;
          font-size: 14px;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: #6b7280;
          font-size: 18px;
        }
        
        .no-activities {
          text-align: center;
          padding: 30px;
          color: #9ca3af;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .operator-content {
            padding: 15px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default OperatorDashboard;