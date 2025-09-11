import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorNavbar from './OperatorNavbar';

const FilmsManagement = () => {
  const [films, setFilms] = useState([]);
  const [allFilms, setAllFilms] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    director: '',
    releaseYear: '',
    language: '',
    trailer: '',
    poster: null
  });

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/films', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des films');
      }
      
      const data = await response.json();
      setFilms(data);
      setAllFilms(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Filtrer les films en fonction de la recherche
  useEffect(() => {
    if (searchQuery) {
      const filtered = allFilms.filter(film => 
        film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.director.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilms(filtered);
    } else {
      setFilms(allFilms);
    }
  }, [searchQuery, allFilms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('director', formData.director);
      formDataToSend.append('releaseYear', formData.releaseYear);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('trailer', formData.trailer);
      
      if (formData.poster) {
        formDataToSend.append('poster', formData.poster);
      }
      
      const url = editingFilm 
        ? `http://localhost:5000/api/films/${editingFilm._id}`
        : 'http://localhost:5000/api/films/add';
      
      const method = editingFilm ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }
      
      setShowAddForm(false);
      setEditingFilm(null);
      setFormData({
        title: '',
        description: '',
        duration: '',
        genre: '',
        director: '',
        releaseYear: '',
        language: '',
        trailer: '',
        poster: null
      });
      
      // Recharger la liste des films
      fetchFilms();
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (film) => {
    setEditingFilm(film);
    setFormData({
      title: film.title,
      description: film.description,
      duration: film.duration,
      genre: film.genre,
      director: film.director,
      releaseYear: film.releaseYear,
      language: film.language,
      trailer: film.trailer || '',
      poster: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/films/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }
        
        // Recharger la liste des films
        fetchFilms();
        
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'poster') {
      setFormData({
        ...formData,
        poster: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  if (loading) {
    return (
      <div className="films-management">
        <OperatorNavbar />
        <div className="page-header">
          <h1>Gestion des Films</h1>
        </div>
        <div className="loading">Chargement des films...</div>
      </div>
    );
  }

  return (
    <div className="films-management">
      <OperatorNavbar />
      
      <div className="operator-content">
        <div className="page-header">
          <h1>Gestion des Films</h1>
          <div className="header-controls">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher un film..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
            <button 
              className="btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              Ajouter un film
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingFilm ? 'Modifier le film' : 'Ajouter un film'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingFilm(null);
                    setFormData({
                      title: '',
                      description: '',
                      duration: '',
                      genre: '',
                      director: '',
                      releaseYear: '',
                      language: '',
                      trailer: '',
                      poster: null
                    });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="film-form" encType="multipart/form-data">
                <div className="form-group">
                  <label>Titre</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
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
                    <label>Durée (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Genre</label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Réalisateur</label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Année de sortie</label>
                    <input
                      type="number"
                      name="releaseYear"
                      value={formData.releaseYear}
                      onChange={handleChange}
                      required
                      min="1900"
                      max="2030"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Langue</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Bande-annonce (URL)</label>
                    <input
                      type="url"
                      name="trailer"
                      value={formData.trailer}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Affiche du film</label>
                  <input
                    type="file"
                    name="poster"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingFilm ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingFilm(null);
                      setFormData({
                        title: '',
                        description: '',
                        duration: '',
                        genre: '',
                        director: '',
                        releaseYear: '',
                        language: '',
                        trailer: '',
                        poster: null
                      });
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="films-grid">
          {films.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M7 12h2v2H7zm0-4h2v2H7zm4 4h2v2h-2zm0-4h2v2h-2zm4 4h2v2h-2zm0-4h2v2h-2z"/>
              </svg>
              <p>{searchQuery ? 'Aucun film trouvé' : 'Aucun film disponible'}</p>
            </div>
          ) : (
            films.map(film => (
              <div key={film._id} className="film-card">
                <div className="film-poster">
                  {film.posterUrl ? (
                    <img src={`http://localhost:5000${film.posterUrl}`} alt={film.title} />
                  ) : (
                    <div className="poster-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9ca3af">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm7.5 6.5l-2 2.5 5 6.5 5-6.5-2-2.5-3 3-3-3z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="film-info">
                  <h3>{film.title}</h3>
                  <p className="film-genre">{film.genre}</p>
                  <p className="film-duration">{film.duration} minutes</p>
                  <p className="film-director">Par {film.director}</p>
                  <p className="film-year">{film.releaseYear}</p>
                  
                  <div className="film-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(film)}
                    >
                      Modifier
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(film._id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .films-management {
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
        }
        
        .page-header h1 {
          font-size: 28px;
          color: #1a293b;
        }
        
        .header-controls {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 8px;
          padding: 0 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          height: 44px;
          width: 300px;
        }
        
        .search-bar svg {
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
        
        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
          height: 100%;
        }
        
        .clear-search {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .clear-search:hover {
          color: #374151;
        }
        
        .btn-primary {
          background: #1a56db;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s;
          height: 44px;
          display: flex;
          align-items: center;
        }
        
        .btn-primary:hover {
          background: #164ec9;
        }
        
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        
        .film-form {
          padding: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #374151;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .films-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .film-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .film-poster {
          height: 200px;
          overflow: hidden;
        }
        
        .film-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .poster-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
        }
        
        .poster-placeholder svg {
          width: 60px;
          height: 60px;
        }
        
        .film-info {
          padding: 15px;
        }
        
        .film-info h3 {
          margin: 0 0 10px;
          font-size: 18px;
          color: #1a293b;
        }
        
        .film-genre, .film-duration, .film-director, .film-year {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .film-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        
        .btn-edit {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-delete {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
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
            gap: 15px;
            align-items: flex-start;
          }
          
          .header-controls {
            width: 100%;
            flex-direction: column;
          }
          
          .search-bar {
            width: 100%;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .films-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FilmsManagement;