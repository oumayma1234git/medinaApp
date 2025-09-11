import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import FilmDetail from "./pages/FilmDetail";
import ReservationPage from './pages/ReservationPage';
import FavoritesPage from './pages/FavoritesPage';
import MesReservation from './pages/MesReservation';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './AdminPages/LoginPage';
import DashboardPage from './AdminPages/DashboardPage';
import FilmsPage from './AdminPages/FilmsPage';
import { AuthProvider } from './context/AuthContext';
import SeancesPage from './AdminPages/SeancesPage';
import UsersPage from './AdminPages/UsersPage';
import AdminReservationsPage from './AdminPages/AdminReservationsPage';
import SeanceHallPage from './AdminPages/SeanceHallPage';
// Import des nouvelles pages opérateur
import OperatorDashboard from './OperatorPages/OperatorDashboard';
import FilmsManagement from './OperatorPages/FilmsManagement';
import SeancesManagement from './OperatorPages/SeancesManagement';
import ReservationsManagement from './OperatorPages/ReservationsManagement';
import OperatorStats from './OperatorPages/OperatorStats';
import OperatorLogin from './OperatorPages/operatorLogin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/film/:filmId" element={<FilmDetail />} />
          <Route path="/Mesreservation" element={<MesReservation />} />
          <Route path="/reservation/:seanceId" element={<ReservationPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/Films" element={<FilmsPage />} />
          <Route path="/admin/seances" element={<SeancesPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/reservations" element={<AdminReservationsPage />} />
          <Route path="/admin/seance-hall/:id" element={<SeanceHallPage />} />
          
          
             {/* Routes opérateur */}
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/films" element={<FilmsManagement />} />
          <Route path="/operator/seances" element={<SeancesManagement />} />
          <Route path="/operator/reservations" element={<ReservationsManagement />} />
          <Route path="/operator/stats" element={<OperatorStats />} />
          <Route path="/operator/login" element={<OperatorLogin />} />
         
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;