require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(s => s.trim()) : true
}));

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, maxlength: 30 },
  interests: { type: String, trim: true, maxlength: 200 },
  createdAt: { type: Date, default: Date.now }
});
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  date: { type: String, required: true },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500 },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }]
});
const Volunteer = mongoose.model("Volunteer", volunteerSchema);
const Event = mongoose.model("Event", eventSchema);

// In-memory fallback keeps the project runnable before MongoDB is configured.
let demoVolunteers = [
  { _id: "demo-v1", name: "Ananya Rao", email: "ananya@example.com", phone: "9000000001", interests: "Education, Teaching" },
  { _id: "demo-v2", name: "Rahul Kumar", email: "rahul@example.com", phone: "9000000002", interests: "Environment" }
];
let demoEvents = [
  { _id: "demo-e1", title: "Community Tree Plantation", date: "2026-11-08", location: "City Park", description: "Plant native trees and help care for green spaces.", registrations: [] },
  { _id: "demo-e2", title: "Weekend Food Distribution", date: "2026-11-15", location: "Community Centre", description: "Pack and distribute food supplies to local families.", registrations: [] },
  { _id: "demo-e3", title: "Youth Learning Support", date: "2026-11-22", location: "Public Library", description: "Help school students with reading and homework.", registrations: [] }
];
const dbReady = () => mongoose.connection.readyState === 1;

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  database: dbReady() ? "connected" : "demo mode",
  project: "NGO Volunteer Management Portal"
}));

app.get("/api/volunteers", async (_req, res, next) => {
  try {
    const data = dbReady() ? await Volunteer.find().sort({ createdAt: -1 }) : demoVolunteers;
    res.json(data);
  } catch (err) { next(err); }
});

app.post("/api/volunteers", async (req, res, next) => {
  try {
    const { name, email, phone = "", interests = "" } = req.body;
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: "Name and email are required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });
    if (dbReady()) {
      const existing = await Volunteer.findOne({ email: email.trim().toLowerCase() });
      if (existing) return res.status(409).json({ message: "This email is already registered." });
      const volunteer = await Volunteer.create({ name, email, phone, interests });
      return res.status(201).json(volunteer);
    }
    if (demoVolunteers.some(v => v.email.toLowerCase() === email.trim().toLowerCase())) {
      return res.status(409).json({ message: "This email is already registered." });
    }
    const volunteer = { _id: `demo-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), phone, interests };
    demoVolunteers.unshift(volunteer);
    res.status(201).json(volunteer);
  } catch (err) { next(err); }
});

app.get("/api/events", async (_req, res, next) => {
  try {
    const data = dbReady()
      ? await Event.find().populate("registrations", "name email").sort({ date: 1 })
      : demoEvents;
    res.json(data);
  } catch (err) { next(err); }
});

app.post("/api/events", async (req, res, next) => {
  try {
    const { title, date, location, description = "" } = req.body;
    if (!title?.trim() || !date || !location?.trim()) {
      return res.status(400).json({ message: "Event title, date, and location are required." });
    }
    if (dbReady()) return res.status(201).json(await Event.create({ title, date, location, description }));
    const event = { _id: `demo-${Date.now()}`, title: title.trim(), date, location: location.trim(), description, registrations: [] };
    demoEvents.push(event);
    res.status(201).json(event);
  } catch (err) { next(err); }
});

app.post("/api/events/:id/register", async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) return res.status(400).json({ message: "Choose a volunteer first." });
    if (dbReady()) {
      const volunteer = await Volunteer.findById(volunteerId);
      const event = await Event.findById(req.params.id);
      if (!volunteer || !event) return res.status(404).json({ message: "Volunteer or event not found." });
      if (event.registrations.some(id => id.toString() === volunteerId)) {
        return res.status(409).json({ message: "This volunteer is already registered for this event." });
      }
      event.registrations.push(volunteer._id);
      await event.save();
      return res.json({ message: "Volunteer registered for the event." });
    }
    const volunteer = demoVolunteers.find(v => v._id === volunteerId);
    const event = demoEvents.find(e => e._id === req.params.id);
    if (!volunteer || !event) return res.status(404).json({ message: "Volunteer or event not found." });
    event.registrations ||= [];
    if (event.registrations.includes(volunteerId)) return res.status(409).json({ message: "Already registered for this event." });
    event.registrations.push(volunteerId);
    res.json({ message: "Volunteer registered for the event." });
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Check the server logs." });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    }
  } else {
    console.log("MONGODB_URI not set; running in demo mode. Data will reset when server restarts.");
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`API listening on port ${PORT}`));
}
start();
