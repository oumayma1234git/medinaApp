import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderCompound from "../compounds/HeaderCompound";
import FooterCompound from "../compounds/FooterCompound";
import { jwtDecode } from "jwt-decode";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";

function ReservationPage() {
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seance, setSeance] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [showReservations, setShowReservations] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentReservationQR, setCurrentReservationQR] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [newSeats, setNewSeats] = useState([]);
  
  // Vérifier l'utilisateur connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Erreur de décodage du token:", error);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  // Charger les détails de la séance
  useEffect(() => {
    if (!user || showReservations) return;
    
    const fetchSeanceDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/seances/${seanceId}?details=1`);
        
        if (!response.ok) {
          throw new Error("Séance non trouvée");
        }
        
        const seanceData = await response.json();
        setSeance(seanceData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchSeanceDetails();
  }, [seanceId, user, showReservations]);



  // Gestion de la sélection des sièges
  const toggleSeatSelection = (row, number) => {
    // Vérifier si le siège est disponible
    const seat = seance.seats.find(s => s.row === row && s.number === number);
    if (!seat.available) return;
    
    // Vérifier si le siège est déjà sélectionné
    const isSelected = selectedSeats.some(s => s.row === row && s.number === number);
    
    if (isSelected) {
      // Désélectionner
      setSelectedSeats(selectedSeats.filter(s => !(s.row === row && s.number === number)));
    } else {
      // Limite de 8 sièges par réservation
      if (selectedSeats.length >= 8) {
        alert('Vous ne pouvez sélectionner que 8 sièges maximum par réservation.');
        return;
      }
      
      // Sélectionner
      setSelectedSeats([...selectedSeats, { row, number }]);
    }
  };

  // Confirmer la réservation
  const confirmReservation = async () => {
    if (selectedSeats.length === 0) {
      alert("Veuillez sélectionner au moins un siège");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/seances/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          seanceId: seance._id,
          seats: selectedSeats
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la réservation");
      }
      
      const result = await response.json();
      setReservationConfirmed(true);
      setReservationId(result.reservationId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculer le prix total
  const calculateTotalPrice = () => {
    if (!seance) return 0;
    
    // Prix par défaut
    const standardPrice = 12;
    const vipPrice = 15;
    
    let total = 0;
    
    selectedSeats.forEach(seat => {
      // Détecter les sièges VIP (dernières rangées)
      const rowLetter = seat.row;
      const rowIndex = "ABCDEFGHIJKLMNO".indexOf(rowLetter);
      
      if (rowIndex >= 12) { // Rangées M, N, O
        total += vipPrice;
      } else {
        total += standardPrice;
      }
    });
    
    return total;
  };

  // Annuler et revenir en arrière
  const handleCancel = () => {
    navigate(-1);
  };

  // Fonction pour charger les réservations de l'utilisateur
  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/user/my-reservations", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des réservations");
      }
      
      const data = await response.json();
      setUserReservations(data);
      setShowReservations(true);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fonction pour annuler une réservation (CORRIGÉE)
 // ... (code existant)

const cancelReservation = async (reservationId) => {
  if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user/cancel/${reservationId}`, 
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Gestion des réponses
      if (response.ok) {
        fetchUserReservations(); // Recharger la liste
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'annulation");
      }
    } catch (err) {
      setError(err.message);
    }
  }
};
// ... (suite du code)

  // Fonction pour commencer la modification d'une réservation
  const startEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setNewSeats([{ row: reservation.row, number: reservation.seat }]);
  };

  // Fonction pour annuler la modification
  const cancelEdit = () => {
    setEditingReservation(null);
    setNewSeats([]);
  };

  // Fonction pour confirmer la modification
  const confirmEdit = async () => {
    if (newSeats.length === 0) {
      alert("Veuillez sélectionner au moins un siège");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/seances/reserve/${editingReservation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          newSeats: newSeats
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la modification de la réservation");
      }
      
      // Recharger les réservations après modification
      fetchUserReservations();
      setEditingReservation(null);
      setNewSeats([]);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fonction pour afficher le QR code
  const showReservationQR = (reservation) => {
    setCurrentReservationQR(reservation);
    setShowQRModal(true);
  };

  // Rendu des réservations
  const renderReservations = () => {
    return (
      <div className="reservations-container">
        <h2>Mes Réservations</h2>
        
        {userReservations.length === 0 ? (
          <div className="no-reservations">
            <p>Aucune réservation trouvée.</p>
          </div>
        ) : (
          <div className="reservations-list">
            {userReservations.map((reservation, index) => (
              <div key={index} className="reservation-card">
                <div className="reservation-header">
                  <h3>{reservation.film}</h3>
                  <div className="reservation-actions">
                    <button 
                      className="qr-button"
                      onClick={() => showReservationQR(reservation)}
                    >
                      <i className="fas fa-qrcode"></i> QR Code
                    </button>
                    <button 
                      className="edit-button"
                      onClick={() => startEditReservation(reservation)}
                    >
                      <i className="fas fa-edit"></i> Modifier
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => cancelReservation(reservation.id)}
                    >
                      <i className="fas fa-trash"></i> Supprimer
                    </button>
                  </div>
                </div>
                <div className="reservation-details">
                  <p><strong>Date:</strong> {reservation.date}</p>
                  <p><strong>Heure:</strong> {reservation.time}</p>
                  <p><strong>Siège:</strong> {reservation.row}{reservation.seat}</p>
                  <p><strong>Réservé le:</strong> {new Date(reservation.reservationDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={() => setShowReservations(false)}
        >
          <i className="fas fa-arrow-left"></i> Retour
        </button>

        {/* Modal pour le QR Code */}
        {showQRModal && currentReservationQR && (
          <div className="qr-modal">
            <div className="qr-modal-content">
              <span className="close" onClick={() => setShowQRModal(false)}>&times;</span>
              <h3>QR Code pour la réservation</h3>
              <div className="qr-code-container">
                <QRCodeSVG 
                  value={`Reservation ID: ${currentReservationQR.id}\nFilm: ${currentReservationQR.film}\nDate: ${currentReservationQR.date} ${currentReservationQR.time}\nSiège: ${currentReservationQR.row}${currentReservationQR.seat}`}
                  size={256}
                  level="H"
                />
              </div>
              <p>Siège: {currentReservationQR.row}{currentReservationQR.seat}</p>
            </div>
          </div>
        )}

        {/* Modal pour la modification de réservation */}
        {editingReservation && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <span className="close" onClick={cancelEdit}>&times;</span>
              <h3>Modifier la réservation</h3>
              
              <div className="seats-selection">
                <h4>Nouveaux sièges sélectionnés:</h4>
                <div className="selected-seats-list">
                  {newSeats.map((seat, idx) => (
                    <div key={idx} className="selected-seat">
                      {seat.row}{seat.number}
                      <button 
                        className="remove-seat"
                        onClick={() => setNewSeats(newSeats.filter((s, i) => i !== idx))}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                
                {seance && (
                  <div className="seats-grid">
                    <div className="screen">ÉCRAN</div>
                    {Array.from({ length: 15 }).map((_, rowIndex) => {
                      const rowLetter = String.fromCharCode(65 + rowIndex); // A à O
                      
                      return (
                        <div className="row" key={rowIndex}>
                          <div className="row-label">{rowLetter}</div>
                          <div className="seats">
                            {Array.from({ length: 23 }).map((_, seatIndex) => {
                              const seatNumber = seatIndex + 1;
                              const seat = seance.seats.find(s => s.row === rowLetter && s.number === seatNumber);
                              const isSelected = newSeats.some(s => s.row === rowLetter && s.number === seatNumber);
                              const isOriginal = editingReservation.row === rowLetter && editingReservation.seat === seatNumber;
                              
                              let seatClass = "seat";
                              if (seat && !seat.available && !isOriginal) seatClass += " occupied";
                              if (isSelected) seatClass += " selected";
                              if (rowIndex >= 12) seatClass += " vip";
                              if (isOriginal) seatClass += " original";
                              
                              return (
                                <div 
                                  key={seatIndex}
                                  className={seatClass}
                                  onClick={() => {
                                    if (isOriginal) return;
                                    if (seat && seat.available) {
                                      if (isSelected) {
                                        setNewSeats(newSeats.filter(s => !(s.row === rowLetter && s.number === seatNumber)));
                                      } else {
                                        if (newSeats.length >= 8) {
                                          alert('Vous ne pouvez sélectionner que 8 sièges maximum par réservation.');
                                          return;
                                        }
                                        setNewSeats([...newSeats, { row: rowLetter, number: seatNumber }]);
                                      }
                                    }
                                  }}
                                >
                                  {seatNumber}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="edit-actions">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={confirmEdit}>
                  Confirmer les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (showReservations) {
    return (
      <div className="reservation-page">
       
        
        {renderReservations()}
        
        <FooterCompound />
        
        <style jsx>{`
          .reservation-page {
            background: #141414;
            color: white;
            min-height: 100vh;
          }
          
          .reservations-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
          }
          
          .reservations-container h2 {
            font-size: 2.2rem;
            margin-bottom: 30px;
            color: #fff;
            text-align: center;
          }
          
          .reservations-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 30px;
            margin: 40px 0;
          }
          
          .reservation-card {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transition: transform 0.3s;
          }
          
          .reservation-card:hover {
            transform: translateY(-5px);
          }
          
          .reservation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #333;
          }
          
          .reservation-header h3 {
            margin: 0;
            font-size: 1.4rem;
            color: #fff;
          }
          
          .reservation-actions {
            display: flex;
            gap: 10px;
          }
          
          .qr-button, .edit-button, .delete-button {
            background: transparent;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
            font-size: 0.9rem;
          }
          
          .qr-button {
            border: 1px solid #e50914;
            color: #e50914;
          }
          
          .qr-button:hover {
            background: rgba(229, 9, 20, 0.1);
          }
          
          .edit-button {
            border: 1px solid #3498db;
            color: #3498db;
          }
          
          .edit-button:hover {
            background: rgba(52, 152, 219, 0.1);
          }
          
          .delete-button {
            border: 1px solid #e74c3c;
            color: #e74c3c;
          }
          
          .delete-button:hover {
            background: rgba(231, 76, 60, 0.1);
          }
          
          .reservation-details p {
            margin: 10px 0;
            color: #ccc;
          }
          
          .reservation-details strong {
            color: #fff;
          }
          
          .no-reservations {
            text-align: center;
            padding: 40px;
            background: #1a1a1a;
            border-radius: 10px;
            margin: 40px 0;
          }
          
          .no-reservations p {
            font-size: 1.2rem;
            color: #aaa;
          }
          
          .btn {
            padding: 15px;
            border-radius: 5px;
            border: none;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
            max-width: 250px;
            margin: 0 auto;
          }
          
          .btn-secondary {
            background: #333;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #444;
          }
          
          /* Modal styles */
          .qr-modal, .edit-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          
          .qr-modal-content, .edit-modal-content {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          
          .close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 1.5rem;
            cursor: pointer;
            color: #aaa;
          }
          
          .close:hover {
            color: white;
          }
          
          .qr-modal-content h3 {
            margin-top: 0;
            text-align: center;
          }
          
          .qr-code-container {
            display: flex;
            justify-content: center;
            margin: 20px 0;
          }
          
          .edit-modal-content h3 {
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .seats-selection {
            margin: 20px 0;
          }
          
          .selected-seats-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
          }
          
          .selected-seat {
            background: #e50914;
            padding: 8px 15px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .remove-seat {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            margin-left: 5px;
          }
          
          .seats-grid {
            max-height: 500px;
            overflow-y: auto;
            margin-top: 20px;
            padding: 15px;
            background: #222;
            border-radius: 8px;
          }
          
          .screen {
            width: 90%;
            height: 20px;
            background: linear-gradient(to bottom, #aaa, #555);
            margin: 0 auto 20px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: bold;
            letter-spacing: 2px;
            font-size: 0.8rem;
          }
          
          .row {
            display: flex;
            gap: 5px;
            align-items: center;
            margin-bottom: 5px;
          }
          
          .row-label {
            width: 20px;
            text-align: center;
            font-weight: bold;
            color: #aaa;
            font-size: 0.9rem;
          }
          
          .seats {
            display: flex;
            gap: 4px;
          }
          
          .seat {
            width: 25px;
            height: 25px;
            border-radius: 3px;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            font-size: 0.6rem;
            color: rgba(255,255,255,0.3);
          }
          
          .seat.available:hover {
            background: #444;
            transform: scale(1.1);
          }
          
          .seat.selected {
            background: #e50914;
            color: white;
          }
          
          .seat.occupied {
            background: #222;
            cursor: not-allowed;
          }
          
          .seat.vip {
            background: #f1c40f;
            color: #333;
          }
          
          .seat.original {
            background: #3498db;
            color: white;
          }
          
          .edit-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
          }
          
          .edit-actions .btn {
            max-width: none;
            margin: 0;
            padding: 12px 20px;
          }
        `}</style>
      </div>
    );
  }

  if (reservationConfirmed) {
    return (
      <div className="reservation-page">
        <Navbar />
        
        <div className="confirmation-container">
          <div className="confirmation-card">
            <div className="confirmation-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Réservation confirmée !</h2>
            <p>Votre réservation a été effectuée avec succès.</p>
            
            <div className="qr-code-container">
              <QRCodeSVG 
                value={`Reservation ID: ${reservationId}\nFilm: ${seance.film.title}\nDate: ${seance.date} ${seance.time}\nSièges: ${selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}`}
                size={200}
                level="H"
              />
            </div>
            
            <div className="reservation-details">
              <p><strong>ID de réservation:</strong> {reservationId}</p>
              <p><strong>Film:</strong> {seance.film.title}</p>
              <p><strong>Date:</strong> {seance.date} à {seance.time}</p>
              <p><strong>Sièges:</strong> {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</p>
              <p><strong>Total:</strong> {calculateTotalPrice()} DT </p>
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-home"></i> Retour à l'accueil
              </button>
              <button 
                className="btn btn-secondary"
                onClick={fetchUserReservations}
              >
                <i className="fas fa-ticket-alt"></i> Voir mes réservations
              </button>
            </div>
          </div>
        </div>
        
        <FooterCompound />
        
        <style jsx>{`
          .reservation-page {
            background: #141414;
            color: white;
            min-height: 100vh;
          }
          
          .confirmation-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          
          .confirmation-card {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            max-width: 600px;
            width: 100%;
          }
          
          .confirmation-icon {
            font-size: 5rem;
            color: #4CAF50;
            margin-bottom: 20px;
          }
          
          .confirmation-card h2 {
            font-size: 2.2rem;
            margin-bottom: 15px;
            color: #fff;
          }
          
          .confirmation-card p {
            font-size: 1.2rem;
            color: #aaa;
            margin-bottom: 30px;
          }
          
          .qr-code-container {
            margin: 30px 0;
            display: flex;
            justify-content: center;
          }
          
          .reservation-details {
            text-align: left;
            background: #222;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
          }
          
          .reservation-details p {
            margin: 10px 0;
            font-size: 1.1rem;
          }
          
          .action-buttons {
            display: flex;
            gap: 15px;
            margin-top: 20px;
          }
          
          .btn {
            padding: 15px;
            border-radius: 5px;
            border: none;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s;
            flex: 1;
          }
          
          .btn-primary {
            background: #e50914;
            color: white;
          }
          
          .btn-primary:hover {
            background: #f40612;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(229, 9, 20, 0.4);
          }
          
          .btn-secondary {
            background: transparent;
            color: #aaa;
            border: 1px solid #444;
          }
          
          .btn-secondary:hover {
            background: #222;
          }
        `}</style>
      </div>
    );
  }

  // Calculer les places libres
  const freeSeats = seance.seats.filter(seat => seat.available).length;

  return (
    <div className="reservation-page">
   <Navbar />
      
      <div className="reservation-container">
        <div className="reservation-header">
          <h1 className="film-title">{seance.film.title}</h1>
          <div className="cinema-info">
            <div className="info-card">
              <div className="info-label">Cinéma</div>
              <div className="info-value">Cinéma Medina Centre</div>
            </div>
            <div className="info-card">
              <div className="info-label">Date</div>
              <div className="info-value">{seance.date}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Séance</div>
              <div className="info-value">{seance.time}</div>
            </div>
          </div>
        </div>
        
        <div className="free-seats">
          <span>{freeSeats}</span> places libres
        </div>
        
        <div className="seats-container">
          <div className="screen">ÉCRAN</div>
          
          <div className="seats-grid">
            {Array.from({ length: 15 }).map((_, rowIndex) => {
              const rowLetter = String.fromCharCode(65 + rowIndex); // A à O
              
              return (
                <div className="row" key={rowIndex}>
                  <div className="row-label">{rowLetter}</div>
                  <div className="seats">
                    {Array.from({ length: 23 }).map((_, seatIndex) => {
                      const seatNumber = seatIndex + 1;
                      const seat = seance.seats.find(s => s.row === rowLetter && s.number === seatNumber);
                      const isSelected = selectedSeats.some(s => s.row === rowLetter && s.number === seatNumber);
                      
                      let seatClass = "seat";
                      if (seat && !seat.available) seatClass += " occupied";
                      if (isSelected) seatClass += " selected";
                      if (rowIndex >= 12) seatClass += " vip"; // Rangées VIP (M, N, O)
                      
                      return (
                        <div 
                          key={seatIndex}
                          className={seatClass}
                          onClick={() => toggleSeatSelection(rowLetter, seatNumber)}
                        >
                          {seatNumber}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="seats-info">
            <div className="info-item">
              <div className="info-color available-color"></div>
              <span>Disponible</span>
            </div>
            <div className="info-item">
              <div className="info-color selected-color"></div>
              <span>Sélectionné</span>
            </div>
            <div className="info-item">
              <div className="info-color occupied-color"></div>
              <span>Occupé</span>
            </div>
            <div className="info-item">
              <div className="info-color vip-color"></div>
              <span>VIP</span>
            </div>
          </div>
        </div>
        
        <div className="reservation-summary">
          <h2 className="summary-title">Votre sélection</h2>
          
          <div className="seats-selected">
            {selectedSeats.length === 0 ? (
              <div className="no-seats">Aucun siège sélectionné</div>
            ) : (
              selectedSeats.map((seat, index) => (
                <div key={index} className="selected-seat">
                  <i className="fas fa-chair"></i> Siège {seat.row}{seat.number}
                </div>
              ))
            )}
          </div>
          
          <div className="price-details">
            {selectedSeats.map((seat, index) => {
              // Prix par défaut
              let price = 12;
              const rowIndex = "ABCDEFGHIJKLMNO".indexOf(seat.row);
              if (rowIndex >= 12) price = 15; // Rangées VIP
              
              return (
                <div className="price-row" key={index}>
                  <span>Siège {seat.row}{seat.number} {rowIndex >= 12 ? "(VIP)" : ""}</span>
                  <span>{price} DT</span>
                </div>
              );
            })}
            
            <div className="price-row total-row">
              <span>Total</span>
              <span>{calculateTotalPrice()} DT</span>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={confirmReservation}
              disabled={selectedSeats.length === 0}
            >
              <i className="fas fa-ticket-alt"></i> Confirmer la réservation
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
      
      <div className="windows-activate">
        <span>Activer Windows</span>
        <a href="#">Accédez aux paramètres pour activer Windows.</a>
      </div>
      
      <FooterCompound />
      
      <style jsx>{`
        .reservation-page {
          background: #141414;
          color: white;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        
        .reservation-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }
        
        .reservation-header {
          background: #1a1a1a;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .film-title {
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: #fff;
        }
        
        .cinema-info {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          margin-bottom: 20px;
        }
        
        .info-card {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .info-label {
          color: #aaa;
          font-size: 0.9rem;
        }
        
        .info-value {
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .free-seats {
          background: #333;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.2rem;
        }
        
        .free-seats span {
          color: #e50914;
          font-weight: bold;
        }
        
        .seats-container {
          background: #1a1a1a;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .screen {
          width: 90%;
          height: 30px;
          background: linear-gradient(to bottom, #aaa, #555);
          margin: 0 auto 40px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: bold;
          letter-spacing: 2px;
          position: relative;
        }
        
        .screen:after {
          content: "";
          position: absolute;
          top: 100%;
          left: 10%;
          width: 80%;
          height: 40px;
          background: radial-gradient(ellipse closest-side, rgba(255,255,255,0.1), transparent 80%);
        }
        
        .seats-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          max-width: 100%;
          overflow-x: auto;
        }
        
        .row {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .row-label {
          width: 25px;
          text-align: center;
          font-weight: bold;
          color: #aaa;
        }
        
        .seats {
          display: flex;
          gap: 8px;
        }
        
        .seat {
          width: 30px;
          height: 30px;
          border-radius: 5px;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
        }
        
        .seat.available:hover {
          background: #444;
          transform: scale(1.1);
        }
        
        .seat.selected {
          background: #e50914;
          color: white;
        }
        
        .seat.occupied {
          background: #222;
          cursor: not-allowed;
        }
        
        .seat.vip {
          background: #f1c40f;
          color: #333;
        }
        
        .seat.vip.selected {
          background: #e50914;
          color: white;
        }
        
        .seats-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #333;
          flex-wrap: wrap;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-color {
          width: 20px;
          height: 20px;
          border-radius: 3px;
        }
        
        .available-color { background: #333; }
        .selected-color { background: #e50914; }
        .occupied-color { background: #222; }
        .vip-color { background: #f1c40f; }
        
        .reservation-summary {
          background: #1a1a1a;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          margin-top: 30px;
        }
        
        .summary-title {
          font-size: 1.8rem;
          margin-bottom: 25px;
          color: #fff;
          padding-bottom: 10px;
          border-bottom: 2px solid #e50914;
        }
        
        .seats-selected {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin: 20px 0;
          min-height: 50px;
        }
        
        .no-seats {
          color: #aaa;
          font-style: italic;
          width: 100%;
          text-align: center;
        }
        
        .selected-seat {
          background: #e50914;
          padding: 8px 15px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .price-details {
          margin: 30px 0;
          padding: 20px;
          background: #222;
          border-radius: 8px;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        
        .total-row {
          border-top: 1px solid #444;
          margin-top: 10px;
          padding-top: 15px;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .btn {
          padding: 15px;
          border-radius: 5px;
          border: none;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: #e50914;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #f40612;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(229, 9, 20, 0.4);
        }
        
        .btn-secondary {
          background: transparent;
          color: #aaa;
          border: 1px solid #444;
        }
        
        .btn-secondary:hover {
          background: #222;
        }
        
        .windows-activate {
          background: #0a0a0a;
          padding: 10px 20px;
          text-align: center;
          border-top: 1px solid #333;
          color: #aaa;
          font-size: 0.9rem;
          margin-top: 40px;
          border-radius: 0 0 10px 10px;
        }
        
        .windows-activate a {
          color: #e50914;
          text-decoration: none;
        }
        
        /* Auth buttons */
        .auth-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .user-info {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .username {
          font-size: 0.9rem;
          color: #e50914;
          font-weight: bold;
        }
        
        .auth-button {
          padding: 8px 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        
        .auth-button:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .signin-button {
          padding: 8px 15px;
          background: #e50914;
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s ease;
        }
        
        .signin-button:hover {
          background: #f40612;
        }
        
        .signup-button {
          padding: 8px 15px;
          background: transparent;
          border: 1px solid white;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s ease;
        }
        
        .signup-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .logout-button {
          padding: 8px 15px;
          background: #222;
          border: 1px solid #444;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .logout-button:hover {
          background: #333;
        }
        
        @media (min-width: 992px) {
          .reservation-container {
            grid-template-columns: 2fr 1fr;
          }
          
          .reservation-summary {
            margin-top: 0;
            position: sticky;
            top: 20px;
          }
        }
        
        @media (max-width: 768px) {
          .seat {
            width: 25px;
            height: 25px;
          }
          
          .film-title {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 576px) {
          .cinema-info {
            flex-direction: column;
            gap: 15px;
          }
          
          .seat {
            width: 20px;
            height: 20px;
            font-size: 0.6rem;
          }
          
          .seats-info {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default ReservationPage;