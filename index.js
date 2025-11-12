const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Login endpoint: http://localhost:${PORT}/auth/login`);
  console.log(`Users endpoint: http://localhost:${PORT}/users`);
});

module.exports = app;

