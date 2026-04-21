import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganiserDashboard from './pages/organiser/OrganiserDashboard';
import VenueDirectoryPage from './pages/organiser/VenueDirectoryPage';
import BookingFormPage from './pages/organiser/BookingFormPage';
import HODDashboard from './pages/hod/HODDashboard';
import HodRequestsPage from './pages/hod/HodRequestsPage';
import HODApprovedEventsPage from './pages/hod/HODApprovedEventsPage';
import BlockedSlotsPage from './pages/hod/BlockedSlotsPage';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';
import PublishEventPage from './pages/organiser/PublishEventPage';

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Organiser') return <Navigate to="/organiser" replace />;
  if (user.role === 'HOD') return <Navigate to="/hod" replace />;
  return <Navigate to="/login" replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register/:roleType" element={<RegisterPage />} />
    <Route path="/organiser" element={<ProtectedRoute roles={['Organiser']}><OrganiserDashboard /></ProtectedRoute>} />
    <Route path="/book/venues" element={<ProtectedRoute roles={['Organiser']}><VenueDirectoryPage /></ProtectedRoute>} />
    <Route path="/organiser/publish/:id" element={<ProtectedRoute roles={['Organiser']}><PublishEventPage /></ProtectedRoute>} />
    <Route path="/book" element={<ProtectedRoute roles={['Organiser']}><BookingFormPage /></ProtectedRoute>} />
    <Route path="/hod" element={<ProtectedRoute roles={['HOD']}><HODDashboard /></ProtectedRoute>} />
    <Route path="/hod/requests" element={<ProtectedRoute roles={['HOD']}><HodRequestsPage /></ProtectedRoute>} />
    <Route path="/hod/approved" element={<ProtectedRoute roles={['HOD']}><HODApprovedEventsPage /></ProtectedRoute>} />
    <Route path="/hod/blocked-slots" element={<ProtectedRoute roles={['HOD']}><BlockedSlotsPage /></ProtectedRoute>} />
    <Route path="/hod/calendar" element={<ProtectedRoute roles={['HOD']}><CalendarPage /></ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
  </Routes>
);

export default App;
