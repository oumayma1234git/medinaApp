import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderCompound from "../compounds/HeaderCompound";
import FooterCompound from "../compounds/FooterCompound";
import Navbar from "../components/Navbar";

function PublicHome() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/films`);
        if (!response.ok) throw new Error("Erreur de chargement");
        const data = await response.json();
        
        const formattedMovies = data.map(movie => ({
          ...movie,
          posterUrl: movie.poster 
            ? `${API_BASE_URL}/uploads/${movie.poster}`
            : null
        }));
        
        setMovies(formattedMovies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  const handleImageError = (e) => {
    e.target.src = "/default-poster.jpg";
    e.target.onerror = null;
    e.target.style.objectFit = "contain";
    e.target.style.padding = "20px";
  };

  const navigateToFilmDetail = (filmId) => {
    navigate(`/film/${filmId}`);
  };

  return (
    <div className="public-home">
      <Navbar />
      
      <div className="main-content">
        <HeaderCompound />
        
        <div className="content-container">
          {error && (
            <div className="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement en cours...</p>
            </div>
          ) : (
            <>
              <h2 className="section-title">
                <span className="icon">🎬</span> Films à l'affiche
              </h2>
              
              {movies.length === 0 ? (
                <div className="no-data">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 5h16v14H4V5zm2 2v10h12V7H6zm5 2h2v6h-2V9zm-3 3h2v3H8v-3zm6 0h2v3h-2v-3z" />
                  </svg>
                  Aucun film disponible
                </div>
              ) : (
                <div className="movies-grid">
                  {movies.map(movie => (
                    <div 
                      key={movie._id} 
                      className="movie-card"
                      onClick={() => navigateToFilmDetail(movie._id)}
                    >
                      <div className="poster-container">
                        {movie.posterUrl ? (
                          <img
                            src={movie.posterUrl}
                            alt={`${movie.title}`}
                            loading="lazy"
                            onError={handleImageError}
                            className="movie-poster"
                          />
                        ) : (
                          <div className="poster-placeholder">
                            <span>Affiche non disponible</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="movie-details">
                        <h3>{movie.title}</h3>
                        <div className="movie-info">
                          <span>{movie.releaseYear}</span>
                          <span>{movie.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <FooterCompound />
      </div>

      <style jsx>{`
        .public-home {
          background: #141414;
          color: white;
          min-height: 100vh;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        
        .main-content {
          margin-top: 70px;
        }
        
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .error-message {
          background: #e50914;
          color: white;
          padding: 12px 15px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 15px 0;
        }
        
        .error-message svg {
          width: 20px;
          height: 20px;
        }
        
        .loading-container {
          text-align: center;
          padding: 40px 0;
        }
        
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: #e50914;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .no-data {
          text-align: center;
          padding: 40px 0;
          color: #777;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .no-data svg {
          width: 50px;
          height: 50px;
          opacity: 0.7;
        }
        
        .section-title {
          font-size: 1.8rem;
          margin: 20px 0 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .movie-card {
          background: #222;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        
        .movie-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .poster-container {
          height: 220px;
          position: relative;
          overflow: hidden;
        }
        
        .movie-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .movie-card:hover .movie-poster {
          transform: scale(1.03);
        }
        
        .poster-placeholder {
          height: 100%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 0.9rem;
          text-align: center;
          padding: 20px;
        }
        
        .movie-details {
          padding: 12px;
        }
        
        .movie-details h3 {
          font-size: 1rem;
          margin: 0 0 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .movie-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #aaa;
        }
        
        @media (max-width: 768px) {
          .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 15px;
          }
          
          .poster-container {
            height: 190px;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }
          
          .poster-container {
            height: 160px;
          }
          
          .movie-details {
            padding: 10px;
          }
          
          .movie-details h3 {
            font-size: 0.9rem;
          }
          
          .movie-info {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default PublicHome;