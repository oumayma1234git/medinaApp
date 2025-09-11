import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import FooterCompound from "../compounds/FooterCompound";

function MesReservation() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRCode, setShowQRCode] = useState(null);
  const [user, setUser] = useState(null);

  // Charger les réservations de l'utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (token && userName) {
      setUser({ name: userName });
      fetchReservations(token);
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  // Récupérer les réservations depuis l'API
  const fetchReservations = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/my-reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          navigate('/signin');
          return;
        }
        throw new Error('Erreur lors de la récupération des réservations');
      }

      const data = await response.json();
      
      // Transformer les données pour correspondre à la structure attendue
      const transformedData = data.map(reservation => ({
        id: reservation.id,
        film: reservation.film,
        date: reservation.date,
        time: reservation.time,
        seat: `${reservation.row}${reservation.seat}`,
        price: 12.50, // Prix fixe pour l'exemple
        bookingDate: reservation.reservationDate
      }));

      setReservations(transformedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les réservations. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  // Supprimer une réservation
  const handleDeleteReservation = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/user/my-reservations/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Échec de la suppression');
        }

        // Mettre à jour l'état local
        setReservations(reservations.filter(res => res.id !== id));
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la suppression de la réservation');
      }
    }
  };

  // Modifier une réservation
  const handleEditReservation = (id) => {
    navigate(`/edit-reservation/${id}`);
  };

  // Afficher le QR Code
  const handleShowQRCode = (reservation) => {
    setShowQRCode(reservation);
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="reservations-page">
     <Navbar />

      <div className="container">
        <h1 className="page-title">
          <FiCalendar className="title-icon" /> Mes Réservations
        </h1>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de vos réservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="no-reservations">
            <h2>Aucune réservation trouvée</h2>
            <p>Vous n'avez pas encore effectué de réservation.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Voir les films à l'affiche
            </button>
          </div>
        ) : (
          <div className="reservations-grid">
            {reservations.map(reservation => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <h3>{reservation.film}</h3>
                  <div className="reservation-actions">
                    <button 
                      className="action-btn qr-btn"
                      onClick={() => handleShowQRCode(reservation)}
                    >
                      QR Code
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditReservation(reservation.id)}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteReservation(reservation.id)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="reservation-details">
                    
                  <div className="detail-item">
                    <span className="label">Date</span>
                    <span className="value">{formatDate(reservation.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Heure</span>
                    <span className="value">{reservation.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Siège</span>
                    <span className="value">{reservation.seat}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Réservé le</span>
                    <span className="value">{formatDate(reservation.bookingDate)}</span>
                  </div>
                  <div className="detail-item price">
                    <span className="label">Prix</span>
                    <span className="value">{reservation.price.toFixed(2)} €</span>
                  </div>
                </div>
                
                <div className="reservation-id">
                  ID: {reservation.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {showQRCode && (
        <div className="qr-modal">
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setShowQRCode(null)}
            >
              <FiX size={24} />
            </button>
            <h3>QR Code - Réservation</h3>
            
            <div className="qr-container">
              <QRCodeSVG 
                value={`Réservation ID: ${showQRCode.id}\nFilm: ${showQRCode.film}\nDate: ${showQRCode.date} ${showQRCode.time}\nSiège: ${showQRCode.seat}`}
                size={200}
                level="H"
              />
            </div>
            
            <div className="reservation-info">
              <p><strong>Film:</strong> {showQRCode.film}</p>
              <p><strong>Date:</strong> {formatDate(showQRCode.date)} à {showQRCode.time}</p>
              <p><strong>Siège:</strong> {showQRCode.seat}</p>
              <p><strong>ID:</strong> {showQRCode.id}</p>
            </div>
          </div>
        </div>
      )}

      <FooterCompound />

      <style jsx>{`
        .reservations-page {
          background: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 60px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .page-title {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 2.5rem;
          color: #1a56db;
          margin-bottom: 40px;
        }
        
        .title-icon {
          background: #e1effe;
          padding: 10px;
          border-radius: 50%;
          color: #1a56db;
        }
        
        .reservations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
        }
        
        .reservation-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .reservation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #1a56db;
          color: white;
        }
        
        .reservation-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }
        
        .reservation-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-btn {
          padding: 8px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
        }
        
        .qr-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .qr-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .edit-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .edit-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .delete-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .delete-btn:hover {
          background: rgba(255, 100, 100, 0.4);
        }
        
        .reservation-details {
          padding: 20px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .detail-item.price {
          border-bottom: none;
          margin-top: 10px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
          font-weight: 600;
        }
        
        .label {
          color: #6b7280;
        }
        
        .value {
          font-weight: 500;
          color: #374151;
        }
        
        .detail-item.price .value {
          color: #1a56db;
          font-size: 1.2rem;
        }
        
        .reservation-id {
          padding: 15px 20px;
          background: #f9fafb;
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .no-reservations {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          max-width: 600px;
          margin: 0 auto;
        }
        
        .no-reservations h2 {
          color: #1e293b;
          margin-bottom: 15px;
        }
        
        .no-reservations p {
          color: #64748b;
          margin-bottom: 30px;
          font-size: 1.1rem;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary {
          background: #1a56db;
          color: white;
        }
        
        .btn-primary:hover {
          background: #164ec9;
        }
        
        .loading-container {
          text-align: center;
          padding: 60px 0;
        }
        
        .loading-spinner {
          border: 5px solid rgba(26, 86, 219, 0.1);
          border-left-color: #1a56db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .qr-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          position: relative;
          max-width: 90%;
          width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s;
        }
        
        .close-btn:hover {
          color: #1e293b;
        }
        
        .qr-container {
          margin: 30px 0;
          display: flex;
          justify-content: center;
        }
        
        .reservation-info {
          text-align: left;
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .reservation-info p {
          margin: 10px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .reservation-info p:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .alert-danger {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }
          
          .reservations-grid {
            grid-template-columns: 1fr;
          }
          
          .modal-content {
            padding: 30px 20px;
          }
        }
        
        @media (max-width: 480px) {
          .reservation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .reservation-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

export default MesReservation;