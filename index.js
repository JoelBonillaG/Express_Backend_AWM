const express = require("express");
const cors = require("cors");
const config = require("./config");

// IMPORTANTE: Cargar passport.js ANTES de las rutas para que las estrategias se registren
require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para la página de login
app.get("/", (req, res, next) => {
  try {
    res.render("login", {
      title: "Iniciar Sesión",
      googleAuthUrl: "/auth/google",
    });
  } catch (error) {
    next(error);
  }
});

// Rutas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores (debe estar antes del 404)
app.use(errorHandler);

// Manejo de rutas no encontradas (debe ser el último)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.path,
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`\n🌐 Páginas:`);
  console.log(`   Login: http://localhost:${PORT}/`);
  console.log(`\n🔐 API Endpoints:`);
  console.log(`   Login: http://localhost:${PORT}/auth/login`);
  console.log(`   Users: http://localhost:${PORT}/users`);
  console.log(`\n🔵 OAuth Endpoints:`);
  console.log(`   Google: http://localhost:${PORT}/auth/google`);
  console.log("");
});

module.exports = app;
