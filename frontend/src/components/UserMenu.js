import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiHeart, FiLogOut } from "react-icons/fi";

function UserMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    if (token && userName) {
      setUser({ name: userName });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="user-menu">
      {user ? (
        <>
          <div className="user-header">
            <div className="user-avatar">
              <FiUser size={20} />
            </div>
            <div className="user-info">
              <p className="welcome-text">Bienvenue</p>
              <p className="username">{user.name}</p>
            </div>
          </div>

          <div className="light-divider"></div>

          <div className="menu-option" onClick={() => navigate('/profile')}>
            <FiUser className="option-icon" />
            <span>Mon profil</span>
          </div>
          
         <div className="menu-option" onClick={() => navigate('/Mesreservation')}>
  <FiCalendar className="option-icon" />
  <span>Mes Réservations</span>
</div>
          
          <div className="menu-option" onClick={() => navigate('/favorites')}>
            <FiHeart className="option-icon" />
            <span>Favoris</span>
          </div>

          <div className="light-divider"></div>

          <div className="menu-option logout" onClick={handleLogout}>
            <FiLogOut className="option-icon" />
            <span>Déconnexion</span>
          </div>
        </>
      ) : (
        <>
          <h2 className="menu-title">Mon compte</h2>
          
          <button className="light-button primary" onClick={() => navigate('/signin')}>
            Se connecter
          </button>
          
          <button className="light-button secondary" onClick={() => navigate('/signup')}>
            S'inscrire
          </button>

          <div className="light-divider"></div>

          <div className="feature">
            <FiCalendar className="feature-icon" />
            <span>Vos réservations</span>
          </div>
          
          <div className="feature">
            <FiHeart className="feature-icon" />
            <span>Vos favoris</span>
          </div>
        </>
      )}

      <style jsx>{`
        .user-menu {
          position: absolute;
          right: 20px;
          top: 60px;
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          width: 280px;
          padding: 20px;
          z-index: 1000;
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0 16px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F0F5FF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4F86F7;
        }

        .user-info {
          flex: 1;
        }

        .welcome-text {
          color: #6B7280;
          font-size: 13px;
          margin: 0;
        }

        .username {
          color: #1A56DB;
          font-size: 16px;
          font-weight: 600;
          margin: 2px 0 0;
        }

        .menu-option {
          display: flex;
          align-items: center;
          padding: 12px 8px;
          border-radius: 8px;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s;
        }

        .menu-option:hover {
          background: #F9FAFB;
        }

        .menu-option .option-icon {
          margin-right: 12px;
          color: #6B7280;
          font-size: 18px;
        }

        .menu-option.logout {
          color: #EF4444;
        }

        .menu-option.logout .option-icon {
          color: #EF4444;
        }

        .light-button {
          width: 100%;
          padding: 12px;
          margin: 6px 0;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .light-button.primary {
          background: #4F86F7;
          color: white;
          border: none;
        }

        .light-button.primary:hover {
          background: #3B75E5;
        }

        .light-button.secondary {
          background: white;
          color: #4F86F7;
          border: 1px solid #D1D5DB;
        }

        .light-button.secondary:hover {
          background: #F9FAFB;
        }

        .light-divider {
          height: 1px;
          background: #E5E7EB;
          margin: 16px 0;
        }

        .menu-title {
          color: #111827;
          font-size: 18px;
          margin: 0 0 16px 0;
          font-weight: 600;
        }

        .feature {
          display: flex;
          align-items: center;
          padding: 12px 8px;
          color: #6B7280;
        }

        .feature .feature-icon {
          margin-right: 12px;
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
}

export default UserMenu;