const express = require('express');
const dotenv  = require('dotenv');
const cors    = require('cors');
const morgan  = require('morgan');

dotenv.config();

const connectDB             = require('./config/db');
const { runSimulation }     = require('./services/simulationService');
const { startExternalSync } = require('./services/externalApiService');

connectDB();

const app = express();

// Allow both local dev and Vercel production
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,       // set this in Render env vars
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));

app.get('/', (req, res) => res.send('Healthcare Monitoring API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  runSimulation();
  startExternalSync();
});