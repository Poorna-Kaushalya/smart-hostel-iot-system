const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

router.post("/predict-health", (req, res) => {
  try {
    const inputData = JSON.stringify(req.body);

    const pythonScript = path.join(__dirname, "../ml/predict_health.py");

    const pythonProcess = spawn("python", [pythonScript, inputData]);

    let result = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("ML Python error:", error);
        return res.status(500).json({
          error: "ML prediction failed",
          details: error
        });
      }

      const prediction = JSON.parse(result);
      res.json(prediction);
    });
  } catch (err) {
    res.status(500).json({
      error: "ML route failed",
      details: err.message
    });
  }
});

module.exports = router;