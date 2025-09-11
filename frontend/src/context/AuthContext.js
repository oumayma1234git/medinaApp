import { createContext, useContext, useState, useEffect } from 'react';

// Créez le contexte
const AuthContext = createContext();

// Hook personnalisé pour accéder au contexte
export function useAuth() {
  return useContext(AuthContext);
}

// Provider qui englobera l'application
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');

  if (token && user) {
    setCurrentUser(JSON.parse(user));
  }

  setLoading(false);
}, []);


  /**
   * Fonction de connexion
   * @param {Object} credentials - { email, password }
   * @returns {Promise<boolean>} - true si la connexion réussit
   */
  // src/context/AuthContext.jsx
// Dans src/context/AuthContext.jsx
// src/context/AuthContext.jsx
const login = async (credentials) => {
  try {
    
   const response = await fetch('http://localhost:5000/api/auth/admin/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
});


    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Réponse non-JSON: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('adminToken', data.token);
      setCurrentUser(data.user);
      return true;
    } else {
      throw new Error(data.message || 'Échec de la connexion');
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return false;
  }
};
  /**
   * Fonction de déconnexion
   */
  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('adminToken');
    
    // Réinitialiser l'utilisateur courant
    setCurrentUser(null);
  };

  // Valeur fournie par le contexte
  const value = {
  currentUser,
  login,
  logout,
  isAuthenticated: !!currentUser,
  admin: currentUser?.role === 'admin' // Changé de isAdmin à admin pour cohérence
};

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Exporter le contexte lui-même pour un usage avec useContext direct
export default AuthContext;