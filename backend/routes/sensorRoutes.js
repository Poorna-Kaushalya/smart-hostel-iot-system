const express = require("express");
const { getSensors } = require("../controllers/sensorController");

const router = express.Router();

router.get("/", getSensors);

module.exports = router;