import { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import api from '../api/axiosInstance';
import PageShell from './PageShell';
import { useAuth } from '../context/AuthContext';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const typeColorMap = {
  Auditorium: '#800000',
  'Seminar Hall': '#1D4ED8',
  Lab: '#059669',
  'Open Ground': '#D97706',
  Classroom: '#6B7280'
};

const linksByRole = {
  Organiser: [
    { to: '/organiser', icon: '🏠', label: 'Dashboard' },
    { to: '/book/venues', icon: '📍', label: 'Book a Venue' },
    { to: '/calendar', icon: '📅', label: 'My Events' },
    { to: '/notifications', icon: '🔔', label: 'Notifications' }
  ],
  HOD: [
    { to: '/hod',            icon: '🏠', label: 'Dashboard' },
    { to: '/hod/requests',   icon: '📝', label: 'Pending Requests' },
    { to: '/hod/approved',   icon: '✅', label: 'Approved Events' },
    { to: '/hod/calendar',   icon: '📅', label: 'Calendar' },
    { to: '/notifications',  icon: '🔔', label: 'Notifications' },
  ]
};

const CalendarPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const endpoint = user?.role === 'HOD'
        ? '/bookings/hod/approved'
        : '/bookings/my';
    api.get(endpoint).then((res) => setRows(res.data.data)).catch(() => setRows([]));
  }, [user]);

  const events = useMemo(() => rows
    .filter((row) => row.Status === 'Approved' || row.Status === 'Upcoming' || row.EventStatus === 'Upcoming')
    .map((row) => {
      const date = row.EventDate || row.RequestedDate;
      const start = new Date(`${date}T${row.StartTime}`);
      const end = new Date(`${date}T${row.EndTime}`);
      return {
        title: row.EventName,
        start,
        end,
        resource: {
          type: row.VenueType,
          club: row.ClubName,
          status: row.Status
        }
      };
    }), [rows]);

  return (
    <PageShell links={linksByRole[user?.role] || []}>
      <h1 className="section-title">Calendar</h1>
      <div className="card" style={{ padding: 16 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ minHeight: 620 }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: typeColorMap[event.resource.type] || '#800000',
              borderColor: 'transparent'
            }
          })}
        />
      </div>
    </PageShell>
  );
};

export default CalendarPage;
