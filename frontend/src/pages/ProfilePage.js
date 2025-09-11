import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';
import FooterCompound from '../compounds/FooterCompound';

function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    civility: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Charger les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const response = await fetch('http://localhost:5000/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const userData = await response.json();
        setUser(userData);
        
        setFormData({
          civility: userData.civility || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          birthDate: userData.birthDate ? userData.birthDate.split('T')[0] : '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          postalCode: userData.postalCode || '',
          city: userData.city || '',
          country: userData.country || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error("Fetch error:", error);
        localStorage.removeItem('token');
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName) newErrors.lastName = 'Nom requis';
    if (!formData.email) newErrors.email = 'Email requis';
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Mot de passe actuel requis';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = '8 caractères minimum';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      
      // Préparer les données à envoyer
      const updateData = {
        civility: formData.civility,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country
      };

      // Ajouter les champs de mot de passe seulement s'ils sont remplis
      if (formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Gestion des erreurs spécifiques du backend
        if (result.errors) {
          setErrors(result.errors);
        }
        throw new Error(result.message || 'Erreur lors de la mise à jour');
      }

      // Mise à jour réussie
      alert(result.message || 'Profil mis à jour avec succès');
      
      // Si nouveau token (changement d'email)
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      // Recharger les données utilisateur
      const userResponse = await fetch('http://localhost:5000/api/user/me', {
        headers: { 'Authorization': `Bearer ${result.token || token}` }
      });
      
      if (userResponse.ok) {
        const updatedUser = await userResponse.json();
        setUser(updatedUser);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

    } catch (error) {
      console.error('Update error:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de votre profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>Erreur lors du chargement du profil</h2>
        <button onClick={() => navigate('/signin')}>Se connecter</button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <h1>Mon compte</h1>
          <div className="profile-tabs">
            <button 
              className={activeTab === 'personal' ? 'active' : ''}
              onClick={() => setActiveTab('personal')}
            >
              Informations personnelles
            </button>
            <button 
              className={activeTab === 'contact' ? 'active' : ''}
              onClick={() => setActiveTab('contact')}
            >
              Contactez-nous
            </button>
          </div>
        </div>

        <div className="profile-content">
          {activeTab === 'personal' ? (
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Mes informations</h2>
                
                <div className="form-group">
                  <label>Civilité *</label>
                  <div className="radio-group">
                    <label>
                      <input 
                        type="radio" 
                        name="civility" 
                        value="Madame"
                        checked={formData.civility === 'Madame'}
                        onChange={handleInputChange}
                      />
                      Madame
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="civility" 
                        value="Monsieur"
                        checked={formData.civility === 'Monsieur'}
                        onChange={handleInputChange}
                      />
                      Monsieur
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'error' : ''}
                      required
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'error' : ''}
                      required
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Mes coordonnées</h2>
                
                <div className="form-group">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    required
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Téléphone portable</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Code Postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pays</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionnez un pays</option>
                    <option value="France">France</option>
                    <option value="Maroc">Maroc</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h2>Modifier le mot de passe</h2>
                
                <div className="form-group">
                  <label>Mot de passe actuel</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={errors.currentPassword ? 'error' : ''}
                  />
                  {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                </div>

                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={errors.newPassword ? 'error' : ''}
                  />
                  {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                  <div className="password-requirements">
                    <p>Votre mot de passe doit contenir :</p>
                    <ul>
                      <li>Minimum 8 caractères</li>
                      <li>Au moins une majuscule et une minuscule</li>
                      <li>Au moins un chiffre</li>
                      <li>Caractères spéciaux autorisés : !@#$%^&*</li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="update-btn">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          ) : (
            <div className="contact-section">
              <h2>Contactez-nous</h2>
              <p>Pour toute question ou assistance, notre équipe est à votre disposition :</p>
              
              <div className="contact-info">
                <div className="contact-method">
                  <h3>Par email</h3>
                  <p>support@cinemamedina.com</p>
                  <p>Réponse sous 24 heures</p>
                </div>
                
                <div className="contact-method">
                  <h3>Par téléphone</h3>
                  <p>+212 522 123 456</p>
                  <p>Du lundi au vendredi, 9h-18h</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <FooterCompound />

      <style jsx>{`
        .profile-page {
          background: #f5f5f5;
          min-height: 100vh;
          padding-top: 80px;
        }
        
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .profile-header {
          margin-bottom: 30px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 20px;
        }
        
        .profile-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .profile-tabs {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .profile-tabs button {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1.1rem;
          cursor: pointer;
          color: #666;
          transition: all 0.3s;
        }
        
        .profile-tabs button.active {
          color: #e50914;
          border-bottom-color: #e50914;
          font-weight: bold;
        }
        
        .profile-content {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-section {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #eee;
        }
        
        .form-section h2 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 25px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #444;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border 0.3s;
        }
        
        .form-group input.error,
        .form-group select.error {
          border-color: #e50914;
        }
        
        .error-message {
          color: #e50914;
          font-size: 0.8rem;
          margin-top: 5px;
          display: block;
        }
        
        .form-row {
          display: flex;
          gap: 20px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .radio-group {
          display: flex;
          gap: 20px;
        }
        
        .radio-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .update-btn {
          background: #e50914;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: block;
          margin: 0 auto;
        }
        
        .update-btn:hover {
          background: #f40612;
          transform: translateY(-2px);
        }
        
        .password-requirements {
          margin-top: 10px;
          font-size: 0.9rem;
          color: #666;
          background: #f9f9f9;
          padding: 10px;
          border-radius: 4px;
        }
        
        .password-requirements ul {
          margin-top: 5px;
          padding-left: 20px;
        }
        
        .contact-section {
          padding: 20px;
        }
        
        .contact-section h2 {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .contact-section p {
          margin-bottom: 30px;
          color: #555;
          line-height: 1.6;
          text-align: center;
        }
        
        .contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
        
        .contact-method {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          transition: transform 0.3s;
        }
        
        .contact-method:hover {
          transform: translateY(-5px);
        }
        
        .contact-method h3 {
          color: #e50914;
          margin-bottom: 10px;
        }
        
        .contact-method p {
          margin-bottom: 5px;
          color: #555;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #e50914;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .error-container {
          text-align: center;
          padding: 50px;
        }
        
        .error-container button {
          background: #e50914;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .profile-container {
            padding: 10px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          
          .profile-content {
            padding: 20px;
          }
          
          .profile-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;