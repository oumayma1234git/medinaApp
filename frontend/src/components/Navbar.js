
// Navbar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FiHome, FiSearch, FiUser, FiGlobe } from "react-icons/fi";
import Logo from "./Header/Logo";
import UserMenu from "./UserMenu"; 

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [language, setLanguage] = useState("fr");

  // Vérifier si l'utilisateur est connecté au montage du composant
  useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Erreur de décodage du token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const goToReservations = () => {
    navigate('/reservations');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowLanguageMenu(false);
  };

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
    setShowUserMenu(false);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  return (
    <nav className="fixed-navbar">
      <div className="navbar-content">
         {/* Icône Home avec redirection fonctionnelle */}
        <div className="nav-icon" onClick={() => navigate('/')}> 
          <FiHome />
          <span className="tooltip">Accueil</span>
        </div> 

        
        <Logo />
        
       
        <div className="search-bar">
          <input type="text" placeholder="Rechercher un film..." />
          <FiSearch className="search-icon" />
        </div>
        
        <div className="nav-actions">
          <div className="language-selector">
            <FiGlobe onClick={toggleLanguageMenu} />
            {showLanguageMenu && (
              <div className="language-menu">
                <div 
                  className={language === 'fr' ? 'active' : ''}
                  onClick={() => changeLanguage('fr')}
                >
                  Français
                </div>
                <div 
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => changeLanguage('en')}
                >
                  English
                </div>
              </div>
            )}
          </div>
          
          <div className="user-menu-container">
            <FiUser onClick={toggleUserMenu} />
            {showUserMenu && <UserMenu />}
          </div>
        </div>
      </div>

      <style jsx>{`
        .fixed-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7));
          padding: 15px 40px;
          z-index: 1000;
          display: flex;
          justify-content: center;
          backdrop-filter: blur(5px);
          border-bottom: 1px solid #333;
        }
        
        .navbar-content {
          width: 100%;
          max-width: 1400px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .search-bar {
          position: relative;
          width: 40%;
        }
        
        .search-bar input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border-radius: 20px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 1rem;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 25px;
        }
        
        .language-selector, .user-menu-container {
          position: relative;
          cursor: pointer;
        }
        
        .language-selector svg, .user-menu-container svg {
          font-size: 1.5rem;
          color: white;
          transition: all 0.3s;
        }
        
        .language-selector svg:hover, .user-menu-container svg:hover {
          color: #e50914;
        }
        
        .user-menu, .language-menu {
          position: absolute;
          right: 0;
          top: 40px;
          background: #141414;
          border: 1px solid #333;
          border-radius: 5px;
          min-width: 200px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          overflow: hidden;
          z-index: 1001;
        }
        
        .language-menu {
          min-width: 120px;
        }
        
        .user-info {
          padding: 15px;
          border-bottom: 1px solid #333;
        }
        
        .username {
          font-weight: bold;
          display: block;
          color: white;
        }
        
        .email {
          font-size: 0.8rem;
          color: #aaa;
          display: block;
          margin-top: 5px;
        }
        
        .menu-item {
          padding: 12px 20px;
          color: #ddd;
          transition: all 0.3s;
        }
        
        .menu-item:hover {
          background: #222;
          color: white;
        }
        
        .language-menu div {
          padding: 10px 15px;
          color: #ddd;
        }
        
        .language-menu div:hover, .language-menu .active {
          background: #222;
          color: white;
        }
        
        @media (max-width: 768px) {
          .navbar-content {
            flex-direction: column;
            gap: 15px;
          }
            .home-icon {
  cursor: pointer;
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s;
  padding: 5px;
}

.home-icon:hover {
  color: #e50914;
  transform: scale(1.1);
}

.navbar-content {
  gap: 20px; /* Espacement entre les éléments */
}
          
          .search-bar {
            width: 100%;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;