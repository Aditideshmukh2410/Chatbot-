// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

require("dotenv").config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, "../public")));

// ===============================
// MongoDB Atlas Connection
// ===============================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas connected successfully!"))
.catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Enable debugging to see 'Insert' commands in your terminal
mongoose.set('debug', true);

// ===============================
// Mongoose Schema & Model
// ===============================
const messageSchema = new mongoose.Schema({
  user_message: String,
  bot_reply: String,
  timestamp: { type: Date, default: Date.now }
}, { collection: 'messages' }); 

const Message = mongoose.model("Message", messageSchema);

// ===============================
// Advanced Bot Logic (Accuracy Fix)
// ===============================
function getBotResponse(userInput) {
    if (!userInput) return "I didn't catch that. Could you repeat?";
    const msg = userInput.toLowerCase();

    // 1. Core Keywords & HOD Data
    if (msg.includes("admission")) return "Admissions for <b>Shivaji Polytechnic Atpadi</b> start in June. Please bring your LC, Marksheet, and Caste Certificate to the college office.";
    
    if (msg.includes("fees") || msg.includes("fee")) return "Fee details vary by category (Open/OBC/SC/ST). Please contact our accounts department for your specific fee structure.";

    if (msg.includes("computer")) {
        return "The HOD of <b>Computer Dept</b> is <b>Mr. Landage M.N</b> (B.E. Comp). 💻 <br><br> <img src='https://media.giphy.com' width='100%' style='border-radius:10px;'>";
    }

    if (msg.includes("mechanical")) {
        return "The HOD of <b>Mechanical Dept</b> is <b>Mr. Gonjari P.S</b> (B.E. Mech). ⚙️ <br><br> <img src='https://media.giphy.com' width='100%' style='border-radius:10px;'>";
    }

    if (msg.includes("civil")) {
        return "The HOD of <b>Civil Dept</b> is <b>Mr. Raychure V.R</b> (B.E. Civil). 🏗️ <br><br> <img src='https://media.giphy.com' width='100%' style='border-radius:10px;'>";
    }

    if (msg.includes("electrical")) return "The HOD of <b>Electrical Dept</b> is <b>Miss. Sankpal A.V</b> (B.E. Elect). ⚡";
    
    if (msg.includes("principal")) return "The Principal of Shivaji Polytechnic Atpadi is <b>Prof. Onkar Kulkarni</b> (M.E. Mech).";

    if (msg.includes("president") || msg.includes("tanajirao")) return "The President of the institute is <b>Hon. Tanajirao Patil</b>.";

    if (msg.includes("contact") || msg.includes("address") || msg.includes("phone")) {
        return "<b>📍 Location:</b> Atpadi, Sangli. <br><b>📞 Contact:</b> 02343-220111 <br><b>📧 Email:</b> shivajipolytechnic@gmail.com";
    }

    if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
        return "Welcome to Shivaji Polytechnic Atpadi! I can help you with admissions, branches, and contact info. What would you like to know?";
    }

    if (!process.env.MONGO_URI) {
  console.log("MONGO_URI missing");
    }
    // Default Fallback
    return "I'm sorry, I don't have that information yet. Please visit the Shivaji Polytechnic office or website.";
}

// ===============================
// Routes
// ===============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ STABLE CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log("----------------------------");
    console.log("📩 User Message:", message);

    if (!message) {
        return res.status(400).json({ reply: "Message is required." });
    }

    // Generate accurate reply from backend logic
    const bot_reply = getBotResponse(message);

    // SAVE TO MONGODB ATLAS
    const msg = new Message({ user_message: message, bot_reply: bot_reply });
    const savedDoc = await msg.save();
    
    console.log("💾 Saved to History Collection (ID:", savedDoc._id + ")");
    console.log("----------------------------");

    res.json({ reply: bot_reply });

  } catch (err) {
    console.error("❌ DATABASE SAVE FAILED:", err.message);
    res.status(500).json({ reply: "Database connection failed. Please check your internet or Atlas IP whitelist." });
  }
});

// Test DB Connection Route
app.get("/test-db", async (req, res) => {
  try {
    const count = await Message.countDocuments();
    res.send(`✅ Database Status: Connected. <br> 📊 History Stored: ${count} messages.`);
  } catch (err) {
    res.send(`❌ Database Error: ${err.message}`);
  }
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Shivaji Polytechnic Bot is live!`);
    console.log(`🔗 Access: http://localhost:${PORT}`);
});
