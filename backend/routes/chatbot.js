const express = require("express");
const OpenAI = require("openai");
const { db } = require("../firebase");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const { question, latestData } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ answer: "Question is required." });
    }

    const snapshot = await db
      .collection("sensorData")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const liveData = [];

    snapshot.forEach((doc) => {
      liveData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const dashboardData = {
      latestDashboardData: latestData || {},
      recentFirestoreRecords: liveData,
    };

    const prompt = `
You are an AI chatbot for a Smart Hostel Environmental Monitoring Dashboard.

Answer the user's question using ONLY the live dashboard data below.

Explain:
1. What is changing
2. Why it may be changing
3. What hostel staff or students should do

Use simple language.
Do not invent sensor values.
Do not say you cannot access live data.

User question:
${question}

Live dashboard data:
${JSON.stringify(dashboardData, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You explain IoT smart hostel dashboard data clearly, practically, and safely.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    return res.json({
      answer: completion.choices[0].message.content,
      liveData,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      answer: "Chatbot backend error. Check backend terminal and OpenAI API key.",
      error: error.message,
    });
  }
});

module.exports = router;