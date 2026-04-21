import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganiserDashboard from './pages/organiser/OrganiserDashboard';
import VenueDirectoryPage from './pages/organiser/VenueDirectoryPage';
import BookingFormPage from './pages/organiser/BookingFormPage';
import HODDashboard from './pages/hod/HODDashboard';
import BlockedSlotsPage from './pages/hod/BlockedSlotsPage';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Organiser') return <Navigate to="/organiser" replace />;
  if (user.role === 'HOD') return <Navigate to="/hod" replace />;
  return <Navigate to="/principal" replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register/:roleType" element={<RegisterPage />} />
    <Route path="/organiser" element={<ProtectedRoute roles={['Organiser']}><OrganiserDashboard /></ProtectedRoute>} />
    <Route path="/organiser/venues" element={<ProtectedRoute roles={['Organiser']}><VenueDirectoryPage /></ProtectedRoute>} />
    <Route path="/organiser/book" element={<ProtectedRoute roles={['Organiser']}><BookingFormPage /></ProtectedRoute>} />
    <Route path="/hod" element={<ProtectedRoute roles={['HOD']}><HODDashboard /></ProtectedRoute>} />
    <Route path="/hod/blocked-slots" element={<ProtectedRoute roles={['HOD']}><BlockedSlotsPage /></ProtectedRoute>} />
    <Route path="/principal" element={<ProtectedRoute roles={['Principal']}><PrincipalDashboard /></ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
  </Routes>
);

export default App;
