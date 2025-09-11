import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorNavbar from './OperatorNavbar';

const SeancesManagement = () => {
  const { user } = useAuth();
  const [seances, setSeances] = useState([]);
  const [allSeances, setAllSeances] = useState([]);
  const [films, setFilms] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSeance, setEditingSeance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    filmId: '',
    date: '',
    time: '',
    prix: ''
  });

  useEffect(() => {
    fetchSeances();
    fetchFilms();
  }, []);

  const fetchSeances = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/seances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des séances');
      }
      
      const data = await response.json();
      setSeances(data);
      setAllSeances(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
      setError('Impossible de charger les séances');
      setLoading(false);
    }
  };

  const fetchFilms = async () => {
    try {
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
    } catch (error) {
      console.error('Erreur lors du chargement des films:', error);
      setError('Impossible de charger les films');
    }
  };



useEffect(() => {
  if (searchQuery) {
    const filtered = allSeances.filter(seance => 
      seance.film && seance.film.title && 
      seance.film.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSeances(filtered);
  } else {
    setSeances(allSeances);
  }
}, [searchQuery, allSeances]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const url = editingSeance 
        ? `http://localhost:5000/api/seances/update/${editingSeance._id}`
        : 'http://localhost:5000/api/seances/add';
      
      const method = editingSeance ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }
      
      setShowAddForm(false);
      setEditingSeance(null);
      setFormData({
        filmId: '',
        date: '',
        time: '',
        prix: ''
      });
      
      fetchSeances();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la séance:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (seance) => {
    setEditingSeance(seance);
    setFormData({
      filmId: seance.film._id,
      date: seance.date.split('T')[0],
      time: seance.time,
      prix: seance.prix
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/seances/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }
        
        fetchSeances();
        
      } catch (error) {
        console.error('Erreur lors de la suppression de la séance:', error);
        setError('Erreur lors de la suppression');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="seances-management">
        <OperatorNavbar />
        <div className="operator-content">
          <div className="page-header">
            <h1>Gestion des Séances</h1>
          </div>
          <div className="loading">Chargement des séances...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="seances-management">
      <OperatorNavbar />
      
      <div className="operator-content">
        <div className="page-header">
          <h1>Gestion des Séances</h1>
          
          <div className="header-controls">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher par titre de film..."
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
              Ajouter une séance
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
                <h2>{editingSeance ? 'Modifier la séance' : 'Ajouter une séance'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSeance(null);
                    setFormData({
                      filmId: '',
                      date: '',
                      time: '',
                      prix: ''
                    });
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="seance-form">
                <div className="form-group">
                  <label>Film</label>
                  <select
                    name="filmId"
                    value={formData.filmId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner un film</option>
                    {films.map(film => (
                      <option key={film._id} value={film._id}>
                        {film.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Heure</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Prix (DT)</label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingSeance ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSeance(null);
                      setFormData({
                        filmId: '',
                        date: '',
                        time: '',
                        prix: ''
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

        <div className="seances-list">
          {seances.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M7 12h2v2H7zm0-4h2v2H7zm4 4h2v2h-2zm0-4h2v2h-2zm4 4h2v2h-2zm0-4h2v2h-2z"/>
              </svg>
              <p>{searchQuery ? 'Aucune séance trouvée' : 'Aucune séance programmée'}</p>
            </div>
          ) : (
            seances.map(seance => (
              <div key={seance._id} className="seance-card">
                <div className="seance-poster">
  {seance.film && seance.film.poster ? (
    <img src={seance.film.poster} alt={seance.film.title} />
  ) : (
    <div className="poster-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9ca3af">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm7.5 6.5l-2 2.5 5 6.5 5-6.5-2-2.5-3 3-3-3z"/>
      </svg>
    </div>
  )}
</div>

                <div className="seance-info">
  <h3>{seance.film ? seance.film.title : "Film supprimé"}</h3>
  <p className="seance-duration">
    {seance.film ? `${seance.film.duration} minutes` : "-"}
  </p>

  <div className="seance-details">
    <div className="detail-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280">
        <path d="M19 4h-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
      </svg>
      <span>{formatDate(seance.date)}</span>
    </div>

    <div className="detail-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
      </svg>
      <span>{seance.time}</span>
    </div>

    <div className="detail-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
      </svg>
      <span>{seance.prix} DT</span>
    </div>

    <div className="detail-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280">
        <path d="M4 9v10h16V9H4zm16-2V4c0-1.1-.9-2-2-2h-3c0-1.1-.9-2-2-2H9C7.9 0 7 .9 7 2H4c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2z"/>
        <path d="M8 4h8v2H8z"/>
      </svg>
      <span>{seance.availableSeats} places disponibles</span>
    </div>
  </div>

  <div className="seance-actions">
    <button 
      className="btn-edit"
      onClick={() => handleEdit(seance)}
    >
      Modifier
    </button>
    <button 
      className="btn-delete"
      onClick={() => handleDelete(seance._id)}
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
        .seances-management {
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
          margin-right: auto;
        }
        
        .header-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
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
          white-space: nowrap;
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
          max-width: 500px;
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
        
        .seance-form {
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
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
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
        
        .seances-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .seance-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
        }
        
        .seance-poster {
          width: 120px;
          flex-shrink: 0;
        }
        
        .seance-poster img {
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
          width: 40px;
          height: 40px;
        }
        
        .seance-info {
          padding: 15px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .seance-info h3 {
          margin: 0 0 5px;
          font-size: 16px;
          color: #1a293b;
        }
        
        .seance-duration {
          margin: 0 0 15px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .seance-details {
          margin-bottom: 15px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .detail-item svg {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }
        
        .detail-item span {
          font-size: 14px;
          color: #6b7280;
        }
        
        .seance-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
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
            align-items: stretch;
          }
          
          .page-header h1 {
            margin-right: 0;
          }
          
          .header-controls {
            flex-direction: column;
            width: 100%;
          }
          
          .search-bar {
            min-width: unset;
            width: 100%;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .seances-list {
            grid-template-columns: 1fr;
          }
          
          .seance-card {
            flex-direction: column;
          }
          
          .seance-poster {
            width: 100%;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default SeancesManagement;