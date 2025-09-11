import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function SeanceHallPage() {
  const [seance, setSeance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      logout();
      navigate('/admin/login');
      return;
    }
    
    if (location.state && location.state.seance) {
      setSeance(location.state.seance);
      setLoading(false);
    } else {
      fetchSeance();
    }
  }, [id]);

  const fetchSeance = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5000/api/seances/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la séance');
      }
      
      const data = await response.json();
      setSeance(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Organiser les sièges par rangée
  const organizeSeatsByRow = (seats) => {
    const rows = {};
    seats.forEach(seat => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });
    
    // Trier les sièges par numéro dans chaque rangée
    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => a.number - b.number);
    });
    
    return rows;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <aside className="sidebar">
          {/* Sidebar code */}
        </aside>
        <main className="main-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement de la salle...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar code (identique à celui de SeancesPage) */}
      </aside>

      <main className="main-content">
        <header className="top-header">
       
          
        
          
        </header>

        <div className="content-area">
          <div className="seance-hall-container">
            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {seance && (
              <>
                <div className="seance-info-header">
                  <h2>{seance.film?.title || 'Film Inconnu'}</h2>
                  <p>{formatDate(seance.date)} {seance.time}</p>
                </div>

                <div className="cinema-hall">
                  <div className="screen">ÉCRAN</div>
                  
                  <div className="seats-container">
                    {Object.entries(organizeSeatsByRow(seance.seats || [])).map(([row, seats]) => (
                      <div key={row} className="seat-row">
                        <div className="row-label">Rangée {row}</div>
                        <div className="seats">
                          {seats.map(seat => (
                            <div 
                              key={seat._id} 
                              className={`seat ${seat.available ? 'available' : 'occupied'}`}
                              title={`Siège ${row}${seat.number} - ${seat.available ? 'Disponible' : 'Occupé'}`}
                            >
                              {seat.number}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="legend">
                    <div className="legend-item">
                      <div className="seat-legend available"></div>
                      <span>Disponible</span>
                    </div>
                    <div className="legend-item">
                      <div className="seat-legend occupied"></div>
                      <span>Occupé</span>
                    </div>
                  </div>
                </div>

                <div className="seance-stats">
                  <div className="stat">
                    <span className="stat-label">Places totales:</span>
                    <span className="stat-value">{(seance.seats || []).length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Places occupées:</span>
                    <span className="stat-value">{(seance.seats || []).filter(s => !s.available).length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Places disponibles:</span>
                    <span className="stat-value">{(seance.seats || []).filter(s => s.available).length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Taux d'occupation:</span>
                    <span className="stat-value">
                      {Math.round(((seance.seats || []).filter(s => !s.available).length / (seance.seats || []).length) * 100)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .seance-hall-container {
          width: 100%;
        }

        .seance-info-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .seance-info-header h2 {
          font-size: 24px;
          color: #111827;
          margin-bottom: 10px;
        }

        .seance-info-header p {
          font-size: 16px;
          color: #6b7280;
        }

        .cinema-hall {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
        }

        .screen {
          width: 80%;
          height: 10px;
          background-color: #374151;
          margin: 0 auto 40px auto;
          border-radius: 4px;
          position: relative;
          text-align: center;
          padding: 15px 0;
          color: white;
          font-weight: bold;
        }

        .seats-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .seat-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .row-label {
          width: 80px;
          text-align: right;
          font-weight: 600;
          color: #4b5563;
        }

        .seats {
          display: flex;
          gap: 8px;
        }

        .seat {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .seat.available {
          background-color: #10b981;
          color: white;
        }

        .seat.occupied {
          background-color: #ef4444;
          color: white;
        }

        .legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .seat-legend {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .seat-legend.available {
          background-color: #10b981;
        }

        .seat-legend.occupied {
          background-color: #ef4444;
        }

        .seance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .cinema-hall {
            padding: 20px;
          }
          
          .seat {
            width: 25px;
            height: 25px;
            font-size: 10px;
          }
          
          .seance-stats {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .seat-row {
            flex-direction: column;
            gap: 5px;
          }
          
          .row-label {
            width: 100%;
            text-align: center;
          }
          
          .seance-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}