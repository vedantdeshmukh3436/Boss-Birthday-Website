const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory database for hackfest demonstration
const db = {
  activities: [
    {
      id: 1,
      date: '2026-05-10',
      cropType: 'rice',
      landArea: 5,
      waterUsage: 12000,
      fertilizerUsage: 150,
      fuelUsage: 45,
      irrigationType: 'drip',
      ecoScore: 88,
      carbonSaved: 420,
      estimatedCredits: 4.2,
      verified: true,
      confidenceScore: 92
    },
    {
      id: 2,
      date: '2026-05-15',
      cropType: 'wheat',
      landArea: 8,
      waterUsage: 25000,
      fertilizerUsage: 350,
      fuelUsage: 120,
      irrigationType: 'flood',
      ecoScore: 54,
      carbonSaved: 110,
      estimatedCredits: 1.1,
      verified: true,
      confidenceScore: 85
    },
    {
      id: 3,
      date: '2026-05-18',
      cropType: 'sugarcane',
      landArea: 4,
      waterUsage: 8000,
      fertilizerUsage: 100,
      fuelUsage: 30,
      irrigationType: 'sprinkler',
      ecoScore: 79,
      carbonSaved: 310,
      estimatedCredits: 3.1,
      verified: true,
      confidenceScore: 89
    }
  ],
  leaderboard: [
    { rank: 1, name: 'Rajesh Patil', location: 'Maharashtra', score: 940, streak: 12, activities: 24, badges: ['Carbon Champion', 'Eco Pioneer'] },
    { rank: 2, name: 'Sanjay Sharma', location: 'Uttar Pradesh', score: 880, streak: 8, activities: 19, badges: ['Sustainable Farmer'] },
    { rank: 3, name: 'Amit Deshmukh', location: 'Maharashtra', score: 810, streak: 5, activities: 15, badges: ['Sustainable Farmer', 'Eco Beginner'] },
    { rank: 4, name: 'You (Farmer)', location: 'Active Region', score: 620, streak: 4, activities: 3, badges: ['Eco Beginner'] },
    { rank: 5, name: 'Vijay Kumar', location: 'Punjab', score: 590, streak: 3, activities: 11, badges: ['Eco Beginner'] }
  ],
  weatherSimulation: {
    temperature: 32,
    humidity: 65,
    rainfall: '5mm expected tomorrow',
    suggestion: 'Rain expected tomorrow. Avoid irrigation today. High humidity may attract aphids, monitor crops closely.'
  }
};

// Weather Endpoint (Proxy to OpenWeather or fallback simulator)
app.get('/api/weather', async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const lat = req.query.lat || '19.0760'; // Default Mumbai
  const lon = req.query.lon || '72.8777';

  if (apiKey) {
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const response = await axios.get(weatherUrl);
      const data = response.data;
      
      let suggestion = "Weather conditions are stable. Good day for organic soil enrichment.";
      if (data.weather[0].main.toLowerCase().includes('rain')) {
        suggestion = "Rain predicted. Suspend planned irrigation and cover loose harvests.";
      } else if (data.main.temp > 35) {
        suggestion = "Extreme heat warning. Irrigate during cooler early morning or late evening hours to minimize evaporation.";
      } else if (data.main.humidity > 80) {
        suggestion = "High humidity detected. Keep watch for fungal infections on leaves.";
      }

      return res.json({
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.weather[0].description,
        suggestion: suggestion,
        city: data.name
      });
    } catch (error) {
      console.warn("OpenWeather API Call failed, falling back to simulated weather.", error.message);
    }
  }

  // Fallback Simulator (Simulating variation based on hours)
  const hour = new Date().getHours();
  const simulatedTemp = 28 + Math.round(Math.sin(hour / 4) * 5);
  const simulatedHumidity = 60 + Math.round(Math.cos(hour / 4) * 15);
  const isRain = simulatedHumidity > 70;
  
  res.json({
    temperature: simulatedTemp,
    humidity: simulatedHumidity,
    rainfall: isRain ? 'Light drizzle' : 'Clear skies',
    suggestion: isRain 
      ? 'Rain expected tomorrow. Avoid irrigation today. Inspect crop drainage channels.' 
      : 'Sunlight levels optimal. Good day for applying natural fertilizers and weeding.',
    city: 'Simulated Agros Zone'
  });
});

// GET Activities
app.get('/api/activities', (req, res) => {
  res.json(db.activities);
});

// POST Activity
app.post('/api/activities', (req, res) => {
  const { cropType, landArea, waterUsage, fertilizerUsage, fuelUsage, irrigationType } = req.body;
  
  if (!cropType || !landArea) {
    return res.status(400).json({ error: 'Missing crop type or land area' });
  }

  // Sustainability Calculation Logic
  let baseEmissionFactor = 1.2; // default
  if (cropType === 'rice') baseEmissionFactor = 2.5;
  else if (cropType === 'sugarcane') baseEmissionFactor = 1.8;
  else if (cropType === 'wheat') baseEmissionFactor = 1.1;

  // Fuel & fertilizer emissions
  const fertilizerEmissions = (fertilizerUsage || 0) * 1.5;
  const fuelEmissions = (fuelUsage || 0) * 2.6;
  const totalEmissions = fertilizerEmissions + fuelEmissions + (landArea * baseEmissionFactor * 10);
  
  // Benchmark (flooded, chemical-heavy baseline)
  const baselineEmissions = landArea * baseEmissionFactor * 50; 
  let carbonSaved = Math.max(0, Math.round(baselineEmissions - totalEmissions));
  
  // Calculate Eco Score
  let ecoPoints = 100;
  if (irrigationType === 'flood') ecoPoints -= 25;
  if (irrigationType === 'sprinkler') ecoPoints -= 5;
  if (waterUsage / landArea > 4000) ecoPoints -= 15;
  if (fertilizerUsage / landArea > 50) ecoPoints -= 15;
  if (fuelUsage / landArea > 15) ecoPoints -= 10;
  
  const ecoScore = Math.max(30, Math.min(100, ecoPoints));
  
  // Carbon Credits: 1 Credit per 100 kg CO2 saved
  const estimatedCredits = parseFloat((carbonSaved / 100).toFixed(2));

  // AI Verification Checks simulation
  let confidenceScore = 80 + Math.floor(Math.random() * 19); // 80 - 98
  let verified = true;

  // Basic sanity check fail simulation
  if (waterUsage < 100 && irrigationType === 'flood') {
    verified = false;
    confidenceScore = 45;
  }

  const newActivity = {
    id: db.activities.length + 1,
    date: new Date().toISOString().split('T')[0],
    cropType,
    landArea: parseFloat(landArea),
    waterUsage: parseFloat(waterUsage || 0),
    fertilizerUsage: parseFloat(fertilizerUsage || 0),
    fuelUsage: parseFloat(fuelUsage || 0),
    irrigationType,
    ecoScore,
    carbonSaved,
    estimatedCredits,
    verified,
    confidenceScore
  };

  db.activities.unshift(newActivity);

  // Update Current User Score on Leaderboard
  const userRankIdx = db.leaderboard.findIndex(item => item.name.includes('You'));
  if (userRankIdx !== -1) {
    db.leaderboard[userRankIdx].activities += 1;
    db.leaderboard[userRankIdx].score += Math.round(ecoScore / 2);
    db.leaderboard[userRankIdx].streak = Math.min(15, db.leaderboard[userRankIdx].streak + 1);
    
    // Badge unlocking logic
    const currentScore = db.leaderboard[userRankIdx].score;
    if (currentScore > 700 && !db.leaderboard[userRankIdx].badges.includes('Sustainable Farmer')) {
      db.leaderboard[userRankIdx].badges.push('Sustainable Farmer');
    }
    if (currentScore > 900 && !db.leaderboard[userRankIdx].badges.includes('Carbon Champion')) {
      db.leaderboard[userRankIdx].badges.push('Carbon Champion');
    }

    // Re-sort leaderboard
    db.leaderboard.sort((a, b) => b.score - a.score);
    db.leaderboard.forEach((item, idx) => {
      item.rank = idx + 1;
    });
  }

  res.status(201).json(newActivity);
});

// GET Leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json(db.leaderboard);
});

// GET Reports summary
app.get('/api/reports/summary', (req, res) => {
  const count = db.activities.length;
  if (count === 0) {
    return res.json({
      averageEcoScore: 0,
      totalCarbonSaved: 0,
      totalCredits: 0,
      activityCount: 0
    });
  }

  const sumEco = db.activities.reduce((sum, act) => sum + act.ecoScore, 0);
  const sumCarbon = db.activities.reduce((sum, act) => sum + act.carbonSaved, 0);
  const sumCredits = db.activities.reduce((sum, act) => sum + act.estimatedCredits, 0);

  res.json({
    averageEcoScore: Math.round(sumEco / count),
    totalCarbonSaved: sumCarbon,
    totalCredits: parseFloat(sumCredits.toFixed(2)),
    activityCount: count,
    activities: db.activities
  });
});

app.listen(PORT, () => {
  console.log(`AgriCarbonAI backend running on port ${PORT}`);
});
