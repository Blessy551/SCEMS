const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server calls and direct file-opened portals (null origin).
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy blocked this origin.'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SCEMS backend is running.' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/venues', require('./routes/venue.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/queue', require('./routes/queue.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/events', require('./routes/events.routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SCEMS backend running on http://localhost:${PORT}`));
