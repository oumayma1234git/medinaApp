import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clients');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        
        let endpoint = '';
        if (activeTab === 'clients') {
          endpoint = 'http://localhost:5000/api/admin/users/clients';
        } else if (activeTab === 'operateurs') {
          endpoint = 'http://localhost:5000/api/admin/users/operators';
        } else {
          endpoint = 'http://localhost:5000/api/users';
        }
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const usersList = data.users || data.clients || data.operators || [];
        setUsers(usersList);
        setFilteredUsers(usersList);
        
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des utilisateurs');
        console.error('Erreur fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user._id !== id));
        setFilteredUsers(filteredUsers.filter(user => user._id !== id));
      } else {
        const data = await response.json();
        setError(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleContactUser = (user) => {
    alert(`Contacter l'utilisateur: ${user.username} (${user.email || 'pas d\'email'})`);
  };

  const handleSubmit = async (formData) => {
    try {
      let url, method, body;
      
      if (currentUser) {
        url = `http://localhost:5000/api/admin/users/${currentUser._id}`;
        method = 'PUT';
        body = JSON.stringify(formData);
      } else if (formData.role === 'operateur') {
        url = 'http://localhost:5000/api/admin/operator/add';
        method = 'POST';
        body = JSON.stringify({
          cin: formData.cin,
          username: formData.username,
          password: formData.password
        });
      } else {
        url = 'http://localhost:5000/api/users';
        method = 'POST';
        body = JSON.stringify(formData);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }

      let endpoint = '';
      if (activeTab === 'clients') {
        endpoint = 'http://localhost:5000/api/users/clients';
      } else if (activeTab === 'operateurs') {
        endpoint = 'http://localhost:5000/api/users/operators';
      } else {
        endpoint = 'http://localhost:5000/api/users';
      }
      
      const usersResponse = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const usersList = usersData.users || usersData.clients || usersData.operators || [];
        setUsers(usersList);
        setFilteredUsers(usersList);
      }
      
      setIsModalOpen(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
    }
  };

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

  const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      username: '',
      cin: '',
      role: 'client',
      password: ''
    });

    const [isOperator, setIsOperator] = useState(false);

    useEffect(() => {
      if (user) {
        setFormData({
          username: user.username || '',
          cin: user.cin || '',
          role: user.role || 'client',
          password: ''
        });
        setIsOperator(user.role === 'operateur');
      } else {
        setFormData({
          username: '',
          cin: '',
          role: 'client',
          password: ''
        });
        setIsOperator(false);
      }
    }, [user]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (name === 'role') {
        setIsOperator(value === 'operateur');
      }
    };

    const handleSubmitForm = (e) => {
      e.preventDefault();
      
      const dataToSubmit = isOperator 
        ? { ...formData, email: undefined } 
        : formData;
        
      onSubmit(dataToSubmit);
    };

    return (
      <div className="user-form-container">
        <h3>{user ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}</h3>
        
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label>Nom d'utilisateur*</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>CIN*</label>
            <input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isOperator && (
            <div className="form-group">
              {/* Email field removed for operators */}
            </div>
          )}
          
          <div className="form-group">
            <label>Rôle*</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={!!user}
            >
              <option value="client">Opérateur</option>
              <option value="operateur">Opérateur</option>
              {admin.role === 'admin' && <option value="admin">Administrateur</option>}
            </select>
          </div>
          
          <div className="form-group">
            <label>Mot de passe{!user ? '*' : ''}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              minLength="6"
              placeholder={user ? "Laisser vide pour ne pas modifier" : ""}
            />
          </div>
          
          {isOperator && (
            <div className="form-help">
              <p>Pour les opérateurs, l'email est généré automatiquement par le système.</p>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              {user ? 'Mettre à jour' : 'Ajouter'}
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
            
            <li className="active">
              <button onClick={() => handleNavigation('users')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span>Utilisateurs</span>
              </button>
            </li>
            
            <li>
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
            <h1 className="page-title">Gestion des Utilisateurs</h1>
          </div>
          
          <div className="header-right">
            <div className="user-profile">
              <div className="avatar">
                {admin?.username?.charAt(0) || 'A'}
              </div>
              <div className="user-info">
                <span className="user-name">{admin?.username || 'Admin'}</span>
                <span className="user-role">Administrateur</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <div className="users-container">
            <div className="tabs-container">
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clients')}
                >
                  Clients
                </div>
                <div 
                  className={`tab ${activeTab === 'operateurs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('operateurs')}
                >
                  Opérateurs
                </div>
                {admin.role === 'admin' && (
                  <div 
                  className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admins')}
                >
                  Administrateurs
                </div>
                )}
              </div>
            </div>

            <div className="users-header">
              <h2 className="users-title">
                {activeTab === 'clients' && 'Liste des Clients'}
                {activeTab === 'operateurs' && 'Liste des Opérateurs'}
                {activeTab === 'admins' && 'Liste des Administrateurs'}
              </h2>
              
              <div className="users-actions">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* 1. Afficher le bouton d'ajout uniquement pour les opérateurs */}
                {activeTab === 'operateurs' && (
                  <button className="add-user-btn" onClick={handleAddUser}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter un opérateur
                  </button>
                )}
              </div>
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
                <p>Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>Aucun utilisateur trouvé</p>
                {activeTab === 'operateurs' && (
                  <button onClick={handleAddUser} className="primary-btn">
                    Ajouter un opérateur
                  </button>
                )}
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>CIN</th>
                      {/* 2. Masquer la colonne email pour les opérateurs */}
                      {activeTab !== 'operateurs' && <th>Email</th>}
                      <th>Rôle</th>
                      <th>Date de création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {user.username?.charAt(0) || 'U'}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{user.username || 'Utilisateur sans nom'}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.cin || 'N/A'}</td>
                        {/* 2. Masquer l'email pour les opérateurs */}
                        {activeTab !== 'operateurs' && <td>{user.email || 'N/A'}</td>}
                        <td>
                          <span className={`role-badge ${user.role === 'client' ? 'role-client' : user.role === 'operateur' ? 'role-operateur' : 'role-admin'}`}>
                            {user.role || 'N/A'}
                          </span>
                        </td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            {user.role === 'operateur' ? (
                              <>
                                <button 
                                  onClick={() => handleEditUser(user)}
                                  className="edit-btn"
                                >
                                  Modifier
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="delete-btn"
                                >
                                  Supprimer
                                </button>
                              </>
                            ) : user.role === 'client' ? (
                              <>
                                <button 
                                  onClick={() => handleContactUser(user)}
                                  className="contact-btn"
                                >
                                  Contacter
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="delete-btn"
                                >
                                  Supprimer
                                </button>
                              </>
                            ) : (
                              (admin.role === 'admin' && user._id !== admin._id) && (
                                <button 
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="delete-btn"
                                >
                                  Supprimer
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div className="pagination">
                <button>&laquo;</button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>&raquo;</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <UserForm 
          user={currentUser} 
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

        .users-container {
          width: 100%;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .tabs-container {
          border-bottom: 1px solid #e5e7eb;
        }

        .tabs {
          display: flex;
        }

        .tab {
          padding: 15px 25px;
          font-size: 15px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .tab.active {
          color: #1a56db;
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #1a56db;
        }

        .tab:hover {
          background-color: #f9fafb;
        }

        .users-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .users-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .users-actions {
          display: flex;
          gap: 15px;
        }

        .search-bar {
          position: relative;
        }

        .search-bar input {
          padding: 10px 15px 10px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          width: 250px;
          transition: all 0.3s;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
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

        .add-user-btn {
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

        .add-user-btn:hover {
          background-color: #164ec9;
        }

        .add-user-btn svg {
          width: 16px;
          height: 16px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 8px;
          margin: 20px;
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

        .users-table-container {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background-color: #f9fafb;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .users-table td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }

        .users-table tr:last-child td {
          border-bottom: none;
        }

        .users-table tr:hover {
          background-color: #f9fafb;
        }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
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

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: #111827;
        }

        .role-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .role-client {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        .role-operateur {
          background-color: #fef3c7;
          color: #92400e;
        }

        .role-admin {
          background-color: #ede9fe;
          color: #5b21b6;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .edit-btn, .delete-btn, .contact-btn {
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
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

        .contact-btn {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .contact-btn:hover {
          background-color: #bfdbfe;
        }

        .pagination {
          display: flex;
          justify-content: center;
          padding: 20px;
          gap: 8px;
        }

        .pagination button {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          background-color: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination button:hover {
          background-color: #f3f4f6;
        }

        .pagination button.active {
          background-color: #1a56db;
          color: white;
          border-color: #1a56db;
        }

        /* 3. Styles pour le formulaire */
        .user-form-container {
          padding: 50px;
          max-width: 500px;
          margin: 0 auto;
        }

        .user-form-container h3 {
          margin-bottom: 20px;
          font-size: 1.5rem;
          color: #1f2937;
          text-align: center;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
        }

        .form-help {
          background-color: #f3f4f6;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #6b7280;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
        }

        .cancel-btn {
          padding: 10px 20px;
          background-color: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background-color: #e5e7eb;
        }

        .submit-btn {
          padding: 10px 20px;
          background-color: #1a56db;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:hover {
          background-color: #164ec9;
        }

        /* Styles pour le modal */
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
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          position: relative;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          color: #6b7280;
        }

        .modal-close:hover {
          color: #374151;
        }

        .modal-close svg {
          width: 20px;
          height: 20px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -280px;
            height: 100vh;
            z-index: 1000;
          }
          
          .sidebar.mobile-open {
            left: 0;
          }
          
          .mobile-menu-btn {
            display: block;
          }
          
          .users-actions {
            flex-direction: column;
          }
          
          .search-bar input {
            width: 100%;
          }
          
          .user-form-container {
            padding: 15px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}