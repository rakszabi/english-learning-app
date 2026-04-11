const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

// Alkalmazás inicializálása
const app = express();

// Proxy mögött (pl. nginx): hogy req.protocol és req.secure helyes legyen (HTTPS)
app.set("trust proxy", 1);

// Köztes rétegek (Middleware-ek)
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session konfiguráció Passport-hoz
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // HTTPS esetén true
}));

// Passport inicializálása
const { passport } = require("./shared/oauth-config");
app.use(passport.initialize());
app.use(passport.session());

// Nézetmotor és statikus fájlok beállítása
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Logger middleware
const logger = require("./shared/logger");
app.use((req, res, next) => {
  logger.info(
    `HTTP ${req.method} ${req.url} REQ.BODY: ${JSON.stringify(req.body)}`
  );
  next();
});

// Route-ok betöltése
const routes = require("./routes");
app.use(routes);

// Adatbázis kapcsolat és szerver indítása
const sequelize = require("./shared/database-helpers/database");
const {
  fixUserLearningInterestsColumn,
} = require("./shared/database-helpers/fix-user-learning-interests-column");

sequelize
  .authenticate()
  .then(() => fixUserLearningInterestsColumn(sequelize))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    logger.info("✅ Database synced");
    app.listen(process.env.PORT, () => {
      logger.info(`🚀 Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Database startup failed:", err);
    process.exit(1);
  });
