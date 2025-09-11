import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorNavbar from './OperatorNavbar';

const ReservationsManagement = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [seances, setSeances] = useState([]);
  const [selectedSeance, setSelectedSeance] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReservations();
    fetchSeances();
  }, []);

  useEffect(() => {
    if (selectedSeance) {
      setFilteredReservations(
        reservations.filter(res => res.seanceId === selectedSeance)
      );
    } else {
      setFilteredReservations(reservations);
    }
  }, [selectedSeance, reservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/operatorRoutes/reservations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }
      
      const data = await response.json();
      setReservations(data);
      setFilteredReservations(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Impossible de charger les réservations');
      setLoading(false);
    }
  };

  const fetchSeances = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operatorRoutes/seances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des séances');
      }
      
      const data = await response.json();
      setSeances(data.seances);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
      setError('Impossible de charger les séances');
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="reservations-management">
        <OperatorNavbar />
        <div className="operator-content">
          <div className="loading">Chargement des réservations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-management">
      <OperatorNavbar />
      
      <div className="operator-content">
        <div className="page-header">
          <h1>Gestion des Réservations</h1>
          
          <div className="filters">
            <select 
              value={selectedSeance} 
              onChange={(e) => setSelectedSeance(e.target.value)}
              className="filter-select"
            >
              <option value="">Toutes les séances</option>
              {seances.map(seance => (
                <option key={seance._id} value={seance._id}>
  {(seance.film?.title || "Film supprimé")} - {formatDate(seance.date)} {seance.time}
</option>

              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="reservations-list">
          <div className="reservations-header">
            <span className="count">{filteredReservations.length} réservation(s)</span>
          </div>
          
          {filteredReservations.map(reservation => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-info">
                <div className="reservation-main">
                  <h3>{reservation.film}</h3>
                  <p className="reservation-datetime">
                    {formatDate(reservation.date)} à {reservation.time} - Salle {reservation.room}
                  </p>
                  <p className="reservation-seat">
                    Siège: Rang {reservation.row}, Place {reservation.seat}
                  </p>
                </div>
                
                <div className="reservation-user">
                  <p className="user-name">{reservation.user?.username || 'Utilisateur inconnu'}</p>
                  <p className="user-email">{reservation.user?.email || ''}</p>
                </div>
              </div>
              
              <div className="reservation-meta">
                <span className="reservation-date">
                  Réservé le {formatDateTime(reservation.reservationDate)}
                </span>
              </div>
            </div>
          ))}
          
          {filteredReservations.length === 0 && (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M7 12h2v2H7zm0-4h2v2H7zm4 4h2v2h-2zm0-4h2v2h-2zm4 4h2v2h-2zm0-4h2v2h-2z"/>
              </svg>
              <p>Aucune réservation trouvée</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .reservations-management {
          min-height: 100vh;
          background: #f9fafb;
        }
        
        .operator-content {
          padding: 20px;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .page-header h1 {
          font-size: 28px;
          color: #1a293b;
          margin: 0;
        }
        
        .filters {
          display: flex;
          gap: 15px;
        }
        
        .filter-select {
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }
        
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .reservations-list {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .reservations-header {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .count {
          font-weight: 500;
          color: #6b7280;
        }
        
        .reservation-card {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .reservation-card:last-child {
          border-bottom: none;
        }
        
        .reservation-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .reservation-main h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: #1a293b;
        }
        
        .reservation-datetime, .reservation-seat {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .reservation-user {
          text-align: right;
        }
        
        .user-name {
          margin: 0 0 5px;
          font-weight: 500;
          color: #1a293b;
        }
        
        .user-email {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .reservation-meta {
          display: flex;
          justify-content: flex-end;
        }
        
        .reservation-date {
          color: #9ca3af;
          font-size: 13px;
        }
        
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #9ca3af;
        }
        
        .empty-state svg {
          width: 60px;
          height: 60px;
          margin-bottom: 15px;
        }
        
        .empty-state p {
          margin: 0;
          font-size: 16px;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: #6b7280;
          font-size: 18px;
        }
        
        @media (max-width: 768px) {
          .operator-content {
            padding: 15px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .reservation-info {
            flex-direction: column;
          }
          
          .reservation-user {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default ReservationsManagement;