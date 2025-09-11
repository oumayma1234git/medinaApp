import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FooterCompound from "../compounds/FooterCompound";

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      const films = data.map(item => ({
        ...item.film,
        posterUrl: item.film.poster 
          ? `${API_BASE_URL}/uploads/${item.film.poster}`
          : null
      })).filter(film => film);
      
      setFavorites(films);
    } catch (error) {
      console.error("Fetch error:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();

    const handleUpdate = () => {
      fetchFavorites();
    };

    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate);
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <Navbar />
      
      <div className="container">
        <div className="page-title">
          <span className="title-icon">❤️</span>
          <h1>Mes films favoris</h1>
        </div>
        
        {favorites.length === 0 ? (
          <div className="no-reservations">
            <h2>Votre liste de favoris est vide</h2>
            <p>Commencez à ajouter des films à votre liste pour les retrouver ici</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Parcourir les films
            </button>
          </div>
        ) : (
          <div className="reservations-grid">
            {favorites.map(film => (
              <div 
                key={film._id} 
                className="reservation-card"
                onClick={() => navigate(`/film/${film._id}`)}
              >
                <div className="film-poster">
                  <img 
                    src={film.posterUrl || '/placeholder-movie.jpg'} 
                    alt={film.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-movie.jpg';
                      e.target.style.objectFit = 'contain';
                      e.target.style.padding = '20px';
                    }}
                  />
                </div>
                
                <div className="reservation-details">
                  <div className="detail-item">
                    <span className="label">Titre</span>
                    <span className="value">{film.title}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Année</span>
                    <span className="value">{film.releaseYear}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Genre</span>
                    <span className="value">{film.genre}</span>
                  </div>
                  
                  <div className="detail-item price">
                    <span className="label">Durée</span>
                    <span className="value">{film.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <FooterCompound />

      <style jsx>{`
        .favorites-page {
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
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        
        .reservation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .film-poster {
          height: 250px;
          overflow: hidden;
        }
        
        .film-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .reservation-card:hover .film-poster img {
          transform: scale(1.05);
        }
        
        .reservation-details {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
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
          font-weight: 500;
        }
        
        .value {
          font-weight: 500;
          color: #374151;
          text-align: right;
        }
        
        .detail-item.price .value {
          color: #1a56db;
          font-size: 1.1rem;
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
        
        .btn-primary {
          background: #1a56db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary:hover {
          background: #164ec9;
          transform: translateY(-2px);
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
        
        /* Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }
          
          .reservations-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .page-title {
            font-size: 1.8rem;
          }
          
          .film-poster {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

export default FavoritesPage;