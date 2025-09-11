import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FooterCompound from "../compounds/FooterCompound";
import { jwtDecode } from "jwt-decode";

function FilmDetail() {
  const { filmId } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        checkFavoriteStatus(token);
      } catch (error) {
        console.error("Token decoding error:", error);
        localStorage.removeItem('token');
      }
    }
  }, [filmId]);

  const checkFavoriteStatus = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/check/${filmId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const { isFavorite } = await response.json();
        setIsFavorite(isFavorite);
      }
    } catch (error) {
      console.error("Favorite check error:", error);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const filmResponse = await fetch(`http://localhost:5000/api/films/${filmId}`);
        if (!filmResponse.ok) throw new Error("Film not found");
        setFilm(await filmResponse.json());
        
        const seancesResponse = await fetch(`http://localhost:5000/api/seances?film=${filmId}`);
        if (!seancesResponse.ok) throw new Error("Failed to load screenings");
        setSeances(await seancesResponse.json());
        
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filmId]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/favorites/${filmId}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour');
      }

      const data = await response.json();
      setIsFavorite(data.isFavorite);
      window.dispatchEvent(new Event('favoritesUpdated'));
      
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const filterSeancesByDate = (date) => {
    return seances.filter(seance => seance.date === date);
  };

  const handleReservation = (seanceId) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    navigate(`/reservation/${seanceId}`);
  };

  // Fonction pour extraire l'ID YouTube de différentes formats d'URL
  const extractYoutubeId = (url) => {
    if (!url) return null;
    
    // Si c'est déjà un ID (ne contient pas de caractères spéciaux d'URL)
    if (!url.includes('://')) return url;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Fonctions pour la navigation du calendrier
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // Générer les jours du mois pour le calendrier
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Nombre total de jours dans le mois
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Ajouter les jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const daysToAdd = 42 - days.length; // 6 semaines de 7 jours
    for (let i = 1; i <= daysToAdd; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Vérifier si une date a des séances
  const hasScreenings = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return seances.some(seance => seance.date === dateStr);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!film) {
    return <div>Film non trouvé</div>;
  }

  return (
    <div className="film-detail">
      <Navbar />
      
      {/* Hero Section with Video Background */}
      <div className="film-hero">
        <div className="video-container">
          {film.trailer && videoPlaying ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeId(film.trailer)}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
                title="Bande-annonce"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setVideoPlaying(false)}
              ></iframe>
              <button className="close-video" onClick={() => setVideoPlaying(false)}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>
                </svg>
              </button>
            </>
          ) : (
            <div className="hero-overlay" style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url(${film.poster || film.imageUrl || 'https://via.placeholder.com/1920x1080'})`
            }}>
              {film.trailer && (
                <button className="play-button" onClick={() => setVideoPlaying(true)}>
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="white"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="hero-content">
          <div className="container">
            <h1 className="film-title">{film.title}</h1>
            
            <div className="film-meta">
              <span className="meta-item">{film.releaseYear}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{film.duration} min</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{film.genre}</span>
            </div>
            
            <div className="action-buttons">
              <button 
                className={`action-btn ${isFavorite ? 'favorited' : ''}`}
                onClick={toggleFavorite}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? '...' : (isFavorite ? '✓ Favori' : '+ Ma liste')}
              </button>
              <button className="action-btn secondary">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                </svg>
                Noter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          <div className="content-grid">
            {/* Left Column */}
            <div className="left-column">
              <section className="synopsis-section">
                <h2 className="section-title">Synopsis</h2>
                <p className="synopsis-text">{film.description || "Aucune description disponible."}</p>
              </section>
              
              <section className="casting-section">
                <h2 className="section-title">Casting</h2>
                <p className="casting-text">{film.cast || "Information sur le casting non disponible"}</p>
              </section>
            </div>
            
            {/* Right Column */}
            <div className="right-column">
              <section className="seances-section">
                <h2 className="section-title">Séances</h2>
                
                <div className="date-selector-container">
                  <div className="date-selector-header">
                    <button className="nav-arrow" onClick={() => navigateMonth('prev')}>
                      <svg viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                      </svg>
                    </button>
                    
                    <div className="current-month">
                      {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </div>
                    
                    <button className="nav-arrow" onClick={() => navigateMonth('next')}>
                      <svg viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                      </svg>
                    </button>
                    
                    <button 
                      className="calendar-toggle"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                  
                  {showDatePicker && (
                    <div className="calendar-popup">
                      <div className="calendar-grid">
                        <div className="week-days">
                          {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
                            <div key={day} className="week-day">{day}</div>
                          ))}
                        </div>
                        
                        <div className="calendar-days">
                          {generateCalendarDays().map((day, index) => {
                            const dateStr = day.date.toISOString().split('T')[0];
                            const isSelected = selectedDate === dateStr;
                            const isToday = new Date().toDateString() === day.date.toDateString();
                            
                            return (
                              <button
                                key={index}
                                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasScreenings(day.date) ? 'has-screenings' : 'no-screenings'}`}
                                onClick={() => {
                                  if (day.isCurrentMonth) {
                                    setSelectedDate(dateStr);
                                    setShowDatePicker(false);
                                  }
                                }}
                                disabled={!hasScreenings(day.date)}
                              >
                                {day.date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="date-scroller">
                    {generateDates().map((date, index) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const isActive = selectedDate === dateStr;
                      const hasSeances = filterSeancesByDate(dateStr).length > 0;
                      
                      return (
                        <button
                          key={index}
                          className={`date-btn ${isActive ? 'active' : ''} ${!hasSeances ? 'no-seances' : ''}`}
                          onClick={() => setSelectedDate(dateStr)}
                          disabled={!hasSeances}
                        >
                          <div className="date-day">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                          <div className="date-number">{date.getDate()}</div>
                          {isActive && (
                            <div className="date-month">{date.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {filterSeancesByDate(selectedDate).length === 0 ? (
                  <div className="no-seances">
                    <p>Aucune séance programmée pour cette date</p>
                  </div>
                ) : (
                  <div className="seances-list">
                    {filterSeancesByDate(selectedDate).map(seance => (
                      <div key={seance._id} className="seance-card">
                        <div className="seance-time">{seance.time.substring(0, 5)}</div>
                        <div className="seance-info">
                          <div className="seance-cinema">Cinéma Medina</div>
                          <div className="seance-format">{seance.format || 'Standard'}</div>
                        </div>
                        <button 
                          className="reserve-btn"
                          onClick={() => handleReservation(seance._id)}
                        >
                          Réserver
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <FooterCompound />
      
      <style jsx>{`
        /* Base Styles */
        .film-detail {
          background: #fff;
          color: #333;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Hero Section */
        .film-hero {
          position: relative;
          height: 70vh;
          min-height: 500px;
          overflow: hidden;
        }
        
        .video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .video-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .play-button {
          width: 80px;
          height: 80px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .play-button:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.1);
        }
        
        .play-button svg {
          width: 30px;
          height: 30px;
          margin-left: 5px;
        }
        
        .close-video {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
        }
        
        .close-video svg {
          width: 24px;
          height: 24px;
        }
        
        .hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 60px 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          z-index: 2;
        }
        
        .film-title {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 15px 0;
          line-height: 1.2;
        }
        
        .film-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .meta-divider {
          opacity: 0.6;
        }
        
        .action-buttons {
          display: flex;
          gap: 15px;
        }
        
        .action-btn {
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        
        .action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .action-btn:not(.secondary) {
          background: #e50914;
          color: white;
          border: none;
        }
        
        .action-btn:not(.secondary):hover:not(:disabled) {
          background: #f40612;
        }
        
        .action-btn.favorited {
          background: #4CAF50;
        }
        
        .action-btn.favorited:hover:not(:disabled) {
          background: #45a049;
        }
        
        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(5px);
        }
        
        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Main Content */
        .main-content {
          padding: 60px 0;
          background: #fff;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }
        
        @media (max-width: 992px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
        
        /* Sections */
        .section-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin: 0 0 25px 0;
          color: #222;
          position: relative;
          padding-bottom: 10px;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background: #e50914;
        }
        
        .synopsis-text, .casting-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
        }
        
        .casting-text {
          white-space: pre-line;
        }
        
        /* Nouveau sélecteur de dates */
        .date-selector-container {
          margin-bottom: 30px;
          position: relative;
        }
        
        .date-selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        
        .nav-arrow {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        
        .nav-arrow:hover {
          background: #f5f5f5;
        }
        
        .nav-arrow svg {
          width: 20px;
          height: 20px;
        }
        
        .current-month {
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
        }
        
        .calendar-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        
        .calendar-toggle:hover {
          background: #f5f5f5;
        }
        
        .calendar-toggle svg {
          width: 20px;
          height: 20px;
        }
        
        .calendar-popup {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
          margin-top: 5px;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }
        
        .week-days {
          display: contents;
        }
        
        .week-day {
          text-align: center;
          font-weight: 600;
          font-size: 0.8rem;
          color: #666;
          padding: 5px;
          grid-column: span 1;
        }
        
        .calendar-days {
          display: contents;
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          background: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .calendar-day.other-month {
          color: #ccc;
        }
        
        .calendar-day.today {
          background: #f0f0f0;
          font-weight: 600;
        }
        
        .calendar-day.selected {
          background: #e50914;
          color: white;
        }
        
        .calendar-day.has-screenings:hover:not(.selected) {
          background: #f5f5f5;
        }
        
        .calendar-day.no-screenings {
          color: #ccc;
          cursor: not-allowed;
        }
        
        .date-scroller {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 15px;
          scrollbar-width: none;
        }
        
        .date-scroller::-webkit-scrollbar {
          display: none;
        }
        
        .date-btn {
          min-width: 70px;
          padding: 12px 10px;
          border-radius: 8px;
          background: #f5f5f5;
          border: none;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.2s;
        }
        
        .date-btn.active, .date-btn:hover:not(:disabled) {
          background: #e50914;
          color: white;
        }
        
        .date-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .date-day {
          font-size: 0.8rem;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        
        .date-number {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .date-month {
          font-size: 0.7rem;
          text-transform: uppercase;
        }
        
        .date-btn.no-seances {
          opacity: 0.5;
        }
        
        /* Seances Section */
        .seances-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .seance-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .seance-card:hover {
          background: #f0f0f0;
        }
        
        .seance-time {
          font-size: 1.3rem;
          font-weight: 600;
          min-width: 80px;
        }
        
        .seance-info {
          flex: 1;
          padding: 0 20px;
        }
        
        .seance-cinema {
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .seance-format {
          font-size: 0.9rem;
          color: #666;
        }
        
        .reserve-btn {
          padding: 10px 20px;
          background: #e50914;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .reserve-btn:hover {
          background: #f40612;
        }
        
        .no-seances {
          text-align: center;
          padding: 30px;
          background: #f9f9f9;
          border-radius: 8px;
          color: #666;
        }
        
        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #fff;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(229, 9, 20, 0.1);
          border-top-color: #e50914;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Error State */
        .error-message {
          text-align: center;
          padding: 100px 20px;
          color: #e50914;
          font-size: 1.2rem;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .film-hero {
            height: 60vh;
            min-height: 400px;
          }
          
          .film-title {
            font-size: 2.2rem;
          }
          
          .hero-content {
            padding: 40px 0;
          }
          
          .action-buttons {
            flex-wrap: wrap;
          }
          
          .action-btn {
            flex: 1;
            justify-content: center;
          }
          
          .date-btn {
            min-width: 60px;
            padding: 10px 8px;
          }
          
          .date-number {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 576px) {
          .film-hero {
            height: 50vh;
          }
          
          .film-title {
            font-size: 1.8rem;
          }
          
          .film-meta {
            font-size: 0.9rem;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
          
          .date-scroller {
            gap: 5px;
          }
          
          .date-btn {
            min-width: 55px;
            padding: 8px 5px;
          }
          
          .date-day {
            font-size: 0.7rem;
          }
          
          .date-number {
            font-size: 1rem;
          }
          
          .date-month {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}

export default FilmDetail;