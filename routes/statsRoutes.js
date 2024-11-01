// routes/statsRoutes.js
const express = require("express");
const { getCountStats } = require("../controller/statsController");
const statsRoutes = express.Router();
// const { getCountStats } = require("../controllers/statsController");

// Define the route and attach the controller function
statsRoutes.get("/count-stats", getCountStats);

module.exports = statsRoutes;
