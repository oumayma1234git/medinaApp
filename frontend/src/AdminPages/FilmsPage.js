import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FilmsPage() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFilm, setCurrentFilm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchFilms = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('http://localhost:5000/api/films', {
          signal: abortController.signal,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setFilms(data);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Erreur lors du chargement des films');
          console.error('Erreur fetch films:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();

    return () => {
      abortController.abort();
    };
  }, [refreshTrigger]);

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleAddFilm = () => {
    setCurrentFilm(null);
    setIsModalOpen(true);
  };

  const handleEditFilm = (film) => {
    setCurrentFilm(film);
    setIsModalOpen(true);
  };

  const handleDeleteFilm = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/films/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
      } else {
        const data = await response.json();
        setError(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'posterPreview' && formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = currentFilm 
        ? `http://localhost:5000/api/films/${currentFilm._id}`
        : 'http://localhost:5000/api/films/add';
      
      const method = currentFilm ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }

      setRefreshTrigger(prev => prev + 1);
      setIsModalOpen(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
    }
  };

  const filteredFilms = films.filter(film =>
    film.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    );
  };

  const FilmForm = ({ film, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      duration: '',
      language: 'Français',
      genre: '',
      imageUrl: '',
      poster: null,
      posterPreview: '',
      trailer: '',
      director: '',
      releaseYear: new Date().getFullYear()
    });

    useEffect(() => {
      if (film) {
        setFormData({
          title: film.title || '',
          description: film.description || '',
          duration: film.duration || '',
          language: film.language || 'Français',
          genre: film.genre || '',
          imageUrl: film.imageUrl || '',
          poster: null,
          posterPreview: film.poster ? `http://localhost:5000/uploads/${film.poster}` : '',
          trailer: film.trailer || '',
          director: film.director || '',
          releaseYear: film.releaseYear || new Date().getFullYear()
        });
      } else {
        setFormData({
          title: '',
          description: '',
          duration: '',
          language: 'Français',
          genre: '',
          imageUrl: '',
          poster: null,
          posterPreview: '',
          trailer: '',
          director: '',
          releaseYear: new Date().getFullYear()
        });
      }
    }, [film]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData({
          ...formData,
          poster: file,
          posterPreview: URL.createObjectURL(file)
        });
      }
    };

    const handleSubmitForm = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="film-form-container">
        <h3>{film ? 'Modifier le film' : 'Ajouter un nouveau film'}</h3>
        
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label>Titre*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Durée (minutes)*</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Année de sortie*</label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Langue*</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
              >
                <option value="Français">Français</option>
                <option value="Anglais">Anglais</option>
                <option value="Arabe">Arabe</option>
                <option value="Espagnol">Espagnol</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Genre*</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Réalisateur</label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Affiche du film</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.posterPreview && (
              <div className="image-preview">
                <img 
                  src={formData.posterPreview} 
                  alt="Prévisualisation de l'affiche"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>URL de la bande-annonce (YouTube)</label>
            <input
              type="url"
              name="trailer"
              value={formData.trailer}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              {film ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    );
  };

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
            
            <li className="active">
              <button onClick={() => handleNavigation('films')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-8h1V5h-1v2zm2 4h1V9h-1v2zm-2 4h1v-2h-1v2zm-8 0h1v-2H7v2zm-2-4h1V9H5v2zm0-4h1V5H5v2zm8 8v2h1v-2h-1zm2-4h1v-2h-1v2z" clipRule="evenodd" />
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
            
            <li>
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
            <h1 className="page-title">Gestion des Films</h1>
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
          <div className="films-container">
            <div className="films-actions">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Rechercher un film..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              
              {admin && (
                <button className="add-film-btn" onClick={handleAddFilm}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter un film
                </button>
              )}
            </div>

            {error && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des films...</p>
              </div>
            ) : filteredFilms.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>Aucun film trouvé</p>
                {admin && (
                  <button onClick={handleAddFilm} className="primary-btn">
                    Ajouter votre premier film
                  </button>
                )}
              </div>
            ) : (
              <div className="films-grid">
                {filteredFilms.map((film) => (
                  <div key={film._id} className="film-card">
                    <div className="film-poster">
                      {film.poster ? (
                        <img 
                          src={`http://localhost:5000/uploads/${film.poster}`}
                          alt={`Affiche de ${film.title || 'Film sans titre'}`}
                          onError={(e) => {
                            e.target.src = '/default-poster.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="poster-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-8h1V5h-1v2zm2 4h1V9h-1v2zm-2 4h1v-2h-1v2zm-8 0h1v-2H7v2zm-2-4h1V9H5v2zm0-4h1V5H5v2zm8 8v2h1v-2h-1zm2-4h1v-2h-1v2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="film-info">
                      <h3>{film.title || 'Titre inconnu'}</h3>
                      <div className="film-meta">
                        <span>{film.releaseYear || 'N/A'}</span>
                        <span>{film.duration || '0'} min</span>
                        <span>{film.genre || 'Non spécifié'}</span>
                      </div>
                      <p className="film-description">
                        {film.description ? (
                          film.description.length > 100 
                            ? `${film.description.substring(0, 100)}...` 
                            : film.description
                        ) : 'Aucune description disponible'}
                      </p>
                      <div className="film-actions">
                        <button className="view-btn">
                          Voir détails
                        </button>
                        
                        {admin && (
                          <>
                            <button 
                              onClick={() => handleEditFilm(film)}
                              className="edit-btn"
                            >
                              Modifier
                            </button>
                            <button 
                              onClick={() => handleDeleteFilm(film._id)}
                              className="delete-btn"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FilmForm 
          film={currentFilm} 
          onSubmit={handleSubmit} 
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

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

        .films-container {
          width: 100%;
        }

        .films-actions {
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

        .add-film-btn {
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

        .add-film-btn:hover {
          background-color: #164ec9;
        }

        .add-film-btn svg {
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

        .primary-btn {
          padding: 10px 20px;
          background-color: #1a56db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 15px;
        }

        .primary-btn:hover {
          background-color: #164ec9;
        }

        .films-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
        }

        .film-card {
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
        }

        .film-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .film-poster {
          height: 200px;
          background-color: #f3f4f6;
          position: relative;
          overflow: hidden;
        }

        .film-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .poster-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background-color: #e5e7eb;
        }

        .poster-placeholder svg {
          width: 60px;
          height: 60px;
          color: #9ca3af;
        }

        .film-info {
          padding: 20px;
        }

        .film-info h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .film-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .film-meta span {
          font-size: 13px;
          color: #6b7280;
          background-color: #f3f4f6;
          padding: 4px 8px;
          border-radius: 20px;
        }

        .film-description {
          font-size: 14px;
          color: #4b5563;
          margin: 0 0 15px 0;
          line-height: 1.5;
        }

        .film-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .view-btn, .edit-btn, .delete-btn {
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .view-btn {
          background-color: #e0e7ff;
          color: #1a56db;
          text-decoration: none;
        }

        .view-btn:hover {
          background-color: #d0d9ff;
        }

        .edit-btn {
          background-color: #fef3c7;
          color: #92400e;
        }

        .edit-btn:hover {
          background-color: #fde68a;
        }

        .delete-btn {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .delete-btn:hover {
          background-color: #fecaca;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          z-index: 10;
        }
        
        .modal-close svg {
          width: 24px;
          height: 24px;
          color: #6b7280;
          transition: color 0.2s;
        }
        
        .modal-close:hover svg {
          color: #111827;
        }

        .film-form-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .film-form-container h3 {
          font-size: 20px;
          color: #111827;
          margin-bottom: 25px;
          text-align: center;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .form-row {
          display: flex;
          gap: 20px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }
        
        .cancel-btn, .submit-btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cancel-btn {
          background-color: #f3f4f6;
          color: #374151;
          border: none;
        }
        
        .cancel-btn:hover {
          background-color: #e5e7eb;
        }
        
        .submit-btn {
          background-color: #1a56db;
          color: white;
          border: none;
        }
        
        .submit-btn:hover {
          background-color: #164ec9;
        }

        .image-preview {
          margin-top: 10px;
          border: 1px dashed #ddd;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          display: block;
          margin: 0 auto;
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

          .films-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-bar {
            max-width: 100%;
            width: 100%;
          }

          .add-film-btn {
            width: 100%;
            justify-content: center;
          }

          .films-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}