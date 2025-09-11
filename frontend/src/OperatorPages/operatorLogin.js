import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OperatorLogin() {
  const [credentials, setCredentials] = useState({
    cin: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Validation des champs
      if (!credentials.cin || !credentials.password) {
        setError("Veuillez remplir tous les champs");
        setIsLoading(false);
        return;
      }

      const API_URL = "http://localhost:5000/api/auth/operator/signin";

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Vérification de la présence du token
      if (!data.token) {
        throw new Error("Token d'authentification manquant dans la réponse");
      }
      
      // Stockage du token
      localStorage.setItem('authToken', data.token);
      
      // Préparation des données utilisateur avec le rôle
      const userData = {
        ...data.user,
        role: 'operator'
      };
      
      // Mise à jour du contexte d'authentification
      login(userData);
      
      // Redirection vers le dashboard opérateur
      navigate('/operator/dashboard');
      
    } catch (err) {
      console.error('Erreur de connexion:', err);
      let errorMessage = "Erreur inconnue";
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = "Serveur indisponible - Vérifiez votre connexion";
      } else if (err.message.includes('404')) {
        errorMessage = "Endpoint introuvable - Vérifiez l'URL de l'API";
      } else if (err.message.includes('401')) {
        errorMessage = "CIN ou mot de passe incorrect";
      } else if (err.message.includes('Token')) {
        errorMessage = "Problème d'authentification - Veuillez réessayer";
      } else {
        errorMessage = err.message || "Erreur technique lors de la connexion";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-circle">
              <div className="logo-initials">CM</div>
            </div>
            <div className="logo-text">
              <span className="logo-title">Cinema Medina</span>
              <span className="logo-subtitle">Connexion Opérateur</span>
            </div>
          </div>
        </div>
        
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">Connexion Opérateur</h2>
            
            {error && (
              <div className="login-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="input-group">
              <label htmlFor="cin" className="input-label">CIN Opérateur</label>
              <div className="input-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <input
                  id="cin"
                  name="cin"
                  type="text"
                  required
                  className="login-input"
                  placeholder="Votre CIN"
                  value={credentials.cin}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="password" className="input-label">Mot de passe</label>
              <div className="input-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="login-input"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`login-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Accès administrateur? <Link to="/admin-login">Cliquez ici</Link></p>
            <p>© {new Date().getFullYear()} Cinema Medina. Tous droits réservés.</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
        }
        
        .login-container {
          display: flex;
          width: 900px;
          height: 600px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
        }
        
        .login-header {
          flex: 1;
          background: linear-gradient(135deg, #1a56db 0%, #0d47a1 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          position: relative;
        }
        
        .logo-container {
          text-align: center;
          z-index: 2;
        }
        
        .logo-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .logo-initials {
          font-size: 48px;
          font-weight: 700;
          color: white;
          letter-spacing: 1px;
        }
        
        .logo-text {
          color: white;
        }
        
        .logo-title {
          display: block;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .logo-subtitle {
          display: block;
          font-size: 18px;
          opacity: 0.9;
        }
        
        .login-form-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 40px;
          background: white;
        }
        
        .login-form {
          flex: 1;
        }
        
        .login-title {
          font-size: 28px;
          color: #1a293b;
          margin-bottom: 30px;
          font-weight: 700;
          text-align: center;
        }
        
        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fee2e2;
          color: #b91c1c;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          font-weight: 500;
        }
        
        .login-error svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        
        .input-group {
          margin-bottom: 25px;
        }
        
        .input-label {
          display: block;
          margin-bottom: 8px;
          color: #4b5563;
          font-weight: 500;
          font-size: 15px;
        }
        
        .input-container {
          position: relative;
        }
        
        .input-container svg {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 20px;
          height: 20px;
        }
        
        .login-input {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s;
          background: #f9fafb;
        }
        
        .login-input:focus {
          outline: none;
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.15);
          background: white;
        }
        
        .login-button {
          width: 100%;
          padding: 16px;
          background: #1a56db;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 30px;
        }
        
        .login-button:hover {
          background: #164ec9;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(26, 86, 219, 0.3);
        }
        
        .login-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .login-button svg {
          width: 20px;
          height: 20px;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .login-footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          padding-top: 30px;
          border-top: 1px solid #f3f4f6;
          margin-top: 30px;
        }
        
        .login-footer p {
          margin: 5px 0;
        }
        
        .login-footer a {
          color: #1a56db;
          text-decoration: none;
          font-weight: 500;
        }
        
        .login-footer a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column;
            height: auto;
            width: 100%;
          }
          
          .login-header {
            padding: 30px 20px;
          }
          
          .login-form-container {
            padding: 30px;
          }
          
          .logo-circle {
            width: 80px;
            height: 80px;
          }
          
          .logo-initials {
            font-size: 32px;
          }
          
          .logo-title {
            font-size: 22px;
          }
          
          .logo-subtitle {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default OperatorLogin;