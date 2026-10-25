import React, { useEffect, useMemo, useState } from "react";
import { HeartHandshake, Users, CalendarDays, HandHeart, MapPin, ArrowRight, Leaf, BookOpen, Utensils, Menu, X, CheckCircle2, Clock3 } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const initialEvents = [
  { _id: "preview1", title: "Community Tree Plantation", date: "2026-11-08", location: "City Park", description: "Plant native trees and help care for greener public spaces." },
  { _id: "preview2", title: "Weekend Food Distribution", date: "2026-11-15", location: "Community Centre", description: "Pack essential food supplies and share them with local families." },
  { _id: "preview3", title: "Youth Learning Support", date: "2026-11-22", location: "Public Library", description: "Help school students with reading, homework, and confidence." }
];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed. Is the backend running?");
  return body;
}

function App() {
  const [page, setPage] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState(initialEvents);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteerForm, setVolunteerForm] = useState({ name: "", email: "", phone: "", interests: "Community service" });
  const [eventForm, setEventForm] = useState({ title: "", date: "", location: "", description: "" });
  const [selectedVolunteer, setSelectedVolunteer] = useState("");

  async function refresh() {
    try {
      const [v, e] = await Promise.all([request("/volunteers"), request("/events")]);
      setVolunteers(v);
      setEvents(e);
      if (!selectedVolunteer && v.length) setSelectedVolunteer(v[0]._id);
    } catch (error) {
      setNotice({ type: "error", text: `${error.message} Showing sample events until the API is available.` });
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => [
    { label: "Volunteers", value: volunteers.length, icon: Users },
    { label: "Upcoming events", value: events.length, icon: CalendarDays },
    { label: "Event sign-ups", value: events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0), icon: HandHeart }
  ], [volunteers, events]);

  function go(next) {
    setPage(next);
    setMobileOpen(false);
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  }
  function updateVolunteer(e) { setVolunteerForm({ ...volunteerForm, [e.target.name]: e.target.value }); }
  function updateEvent(e) { setEventForm({ ...eventForm, [e.target.name]: e.target.value }); }

  async function submitVolunteer(e) {
    e.preventDefault();
    try {
      await request("/volunteers", { method: "POST", body: JSON.stringify(volunteerForm) });
      setNotice({ type: "success", text: "Thank you! Volunteer registration was successful." });
      setVolunteerForm({ name: "", email: "", phone: "", interests: "Community service" });
      await refresh();
    } catch (error) { setNotice({ type: "error", text: error.message }); }
  }
  async function submitEvent(e) {
    e.preventDefault();
    try {
      await request("/events", { method: "POST", body: JSON.stringify(eventForm) });
      setNotice({ type: "success", text: "Your event has been added." });
      setEventForm({ title: "", date: "", location: "", description: "" });
      await refresh();
    } catch (error) { setNotice({ type: "error", text: error.message }); }
  }
  async function registerEvent(eventId) {
    if (!selectedVolunteer) {
      setNotice({ type: "error", text: "Please register a volunteer first, then select them from the dropdown." });
      go("Join us");
      return;
    }
    try {
      const result = await request(`/events/${eventId}/register`, {
        method: "POST", body: JSON.stringify({ volunteerId: selectedVolunteer })
      });
      setNotice({ type: "success", text: result.message });
      await refresh();
    } catch (error) { setNotice({ type: "error", text: error.message }); }
  }

  const navItems = ["Home", "Events", "Volunteers", "Join us", "Admin"];
  return <div id="top">
    <header className="topbar">
      <button className="brand" onClick={() => go("Home")} aria-label="GoodHands home">
        <span className="brand-icon"><HeartHandshake size={24}/></span>
        <span>good<span className="brand-accent">hands</span><small>NGO VOLUNTEER PORTAL</small></span>
      </button>
      <nav className={mobileOpen ? "nav nav-open" : "nav"}>
        {navItems.map(item => <button key={item} className={page === item ? "nav-link active" : "nav-link"} onClick={() => go(item)}>{item}</button>)}
        <button className="button button-small" onClick={() => go("Join us")}>Become a volunteer <ArrowRight size={15}/></button>
      </nav>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X/> : <Menu/>}</button>
    </header>

    {notice && <div className={`notice ${notice.type}`} role="status"><span>{notice.type === "success" ? <CheckCircle2 size={18}/> : <Clock3 size={18}/>}</span>{notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16}/></button></div>}

    {page === "Home" && <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"></span> SMALL ACTS. BIG CHANGE.</div>
          <h1>Your time can<br/>change <em>lives.</em></h1>
          <p className="hero-text">A kinder world starts with people like you. Find meaningful ways to give back, meet your community, and make every hour count.</p>
          <div className="hero-actions"><button className="button" onClick={() => go("Events")}>Explore opportunities <ArrowRight size={17}/></button><button className="text-button" onClick={() => go("Join us")}>How it works <span>↗</span></button></div>
          <div className="hero-proof"><div className="avatar-stack"><span>AN</span><span>RK</span><span>SP</span><span>+</span></div><div><strong>Every helping hand matters</strong><small>Join a growing community of changemakers</small></div></div>
        </div>
        <div className="hero-art">
          <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
          <div className="sun"></div><div className="art-hill hill-back"></div><div className="art-hill hill-front"></div>
          <div className="person person-one"><span className="head"></span><span className="body"></span><span className="arm"></span></div>
          <div className="person person-two"><span className="head"></span><span className="body"></span><span className="arm"></span></div>
          <div className="plant plant-one"><span></span><span></span><i></i></div><div className="plant plant-two"><span></span><span></span><i></i></div>
          <div className="floating-card"><span className="floating-icon"><HeartHandshake size={20}/></span><div><strong>Make a difference</strong><small>One action at a time</small></div><span className="floating-check">✓</span></div>
          <span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✦</span>
        </div>
      </section>

      <section className="impact-strip">
        <div className="impact-intro"><span className="section-kicker">OUR COMMUNITY</span><h2>Good things happen<br/>when we show up.</h2></div>
        {stats.map((s, i) => <div className="impact-stat" key={s.label}><span className="stat-icon"><s.icon size={20}/></span><strong>{s.value.toString().padStart(2,"0")}<span>+</span></strong><small>{s.label}</small></div>)}
      </section>

      <section className="section section-events">
        <div className="section-heading"><div><span className="section-kicker">FIND YOUR PURPOSE</span><h2>Ways to make an impact</h2></div><button className="text-button" onClick={() => go("Events")}>View all events <ArrowRight size={16}/></button></div>
        <EventCards events={events.slice(0,3)} onRegister={registerEvent} />
      </section>

      <section className="join-banner"><div className="banner-mark"><HeartHandshake size={36}/></div><div><span className="section-kicker">YOUR COMMUNITY NEEDS YOU</span><h2>Bring your heart. We'll find the way.</h2><p>Whether you have an hour or a whole weekend, there's a place for you here.</p></div><button className="button button-light" onClick={() => go("Join us")}>Join our community <ArrowRight size={16}/></button></section>
    </main>}

    {page === "Events" && <main className="page-main">
      <PageIntro kicker="MAKE TIME FOR GOOD" title="Upcoming opportunities" text="Find a cause that matters to you and turn a little time into a lasting impact."/>
      <EventCards events={events} onRegister={registerEvent}/>
      <div className="register-picker"><label htmlFor="volunteer-picker">Register as</label><select id="volunteer-picker" value={selectedVolunteer} onChange={e => setSelectedVolunteer(e.target.value)}><option value="">Choose a volunteer</option>{volunteers.map(v => <option key={v._id} value={v._id}>{v.name} — {v.email}</option>)}</select><span>Choose a volunteer before clicking “Sign me up”.</span></div>
    </main>}

    {page === "Volunteers" && <main className="page-main"><PageIntro kicker="THE PEOPLE BEHIND THE GOOD" title="Our volunteers" text="Every person brings a different skill, story, and reason to help."/>
      <div className="table-card"><div className="table-title"><h3>Volunteer directory</h3><span>{volunteers.length} registered</span></div>
      {volunteers.length ? <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Interests</th></tr></thead><tbody>{volunteers.map(v => <tr key={v._id}><td><span className="person-cell">{v.name?.slice(0,1).toUpperCase()}</span>{v.name}</td><td>{v.email}</td><td>{v.phone || "—"}</td><td>{v.interests || "Community service"}</td></tr>)}</tbody></table></div> : <EmptyState text="No volunteers yet. Be the first to join!" onClick={() => go("Join us")}/>}</div>
    </main>}

    {page === "Join us" && <main className="page-main join-page"><div className="join-copy"><span className="section-kicker">TAKE THE FIRST STEP</span><h1>Be the reason<br/>someone <em>smiles.</em></h1><p>Sign up to hear about upcoming activities and find the right opportunity for your interests.</p><div className="benefit"><span><Leaf size={20}/></span><div><strong>Give back to your community</strong><small>Support causes that matter locally.</small></div></div><div className="benefit"><span><BookOpen size={20}/></span><div><strong>Learn as you contribute</strong><small>Build skills and meet like-minded people.</small></div></div><div className="benefit"><span><Users size={20}/></span><div><strong>Be part of something bigger</strong><small>Small actions create lasting change.</small></div></div></div>
      <form className="form-card" onSubmit={submitVolunteer}><span className="section-kicker">VOLUNTEER SIGN-UP</span><h2>Let's get to know you</h2><p>Fields marked with * are required.</p><label>Full name *<input name="name" value={volunteerForm.name} onChange={updateVolunteer} placeholder="e.g. Priya Sharma" required maxLength="80"/></label><label>Email address *<input name="email" type="email" value={volunteerForm.email} onChange={updateVolunteer} placeholder="you@example.com" required/></label><label>Phone number<input name="phone" type="tel" value={volunteerForm.phone} onChange={updateVolunteer} placeholder="+91 98765 43210" maxLength="30"/></label><label>Area of interest<select name="interests" value={volunteerForm.interests} onChange={updateVolunteer}><option>Community service</option><option>Education & teaching</option><option>Environment</option><option>Food distribution</option><option>Health & wellbeing</option><option>Fundraising</option></select></label><button className="button form-submit" type="submit">Submit registration <ArrowRight size={16}/></button><small className="privacy-note">For this student demo, use test details only.</small></form>
    </main>}

    {page === "Admin" && <main className="page-main"><PageIntro kicker="PORTAL OVERVIEW" title="Admin dashboard" text="A quick look at your volunteers, events, and community activity."/>
      <div className="admin-stats">{stats.map(s => <div className="admin-stat" key={s.label}><span><s.icon size={21}/></span><small>{s.label}</small><strong>{s.value}</strong></div>)}</div>
      <div className="admin-grid"><form className="form-card compact-form" onSubmit={submitEvent}><span className="section-kicker">EVENT MANAGEMENT</span><h2>Add a new event</h2><label>Event title *<input name="title" value={eventForm.title} onChange={updateEvent} required maxLength="100" placeholder="e.g. Beach clean-up"/></label><label>Date *<input name="date" type="date" value={eventForm.date} onChange={updateEvent} required/></label><label>Location *<input name="location" value={eventForm.location} onChange={updateEvent} required placeholder="Event venue"/></label><label>Description<textarea name="description" value={eventForm.description} onChange={updateEvent} rows="3" maxLength="500" placeholder="What will volunteers do?"/></label><button className="button form-submit" type="submit">Create event <ArrowRight size={16}/></button></form>
      <div className="table-card"><div className="table-title"><h3>Current events</h3><span>{events.length} total</span></div>{events.map(e => <div className="admin-event" key={e._id}><span className="event-mini-icon"><CalendarDays size={18}/></span><div><strong>{e.title}</strong><small>{formatDate(e.date)} · {e.location}</small></div><span className="count-pill">{e.registrations?.length || 0} joined</span></div>)}</div></div>
      <p className="demo-warning">Student demo: this dashboard does not have administrator login protection. Do not publish real private volunteer data.</p>
    </main>}

    <footer className="footer"><div className="footer-brand"><span className="brand-icon"><HeartHandshake size={21}/></span><strong>good<span className="brand-accent">hands</span></strong></div><p>Making room for good, one volunteer at a time.</p><span>© 2026 GoodHands NGO Volunteer Portal · Student mini project</span></footer>
  </div>;
}

function PageIntro({ kicker, title, text }) {
  return <div className="page-intro"><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{text}</p></div>;
}
function EventCards({ events, onRegister }) {
  const icons = [Leaf, Utensils, BookOpen];
  const colors = ["sage", "peach", "lavender"];
  if (!events.length) return <div className="empty-card">No events available yet. Please check back soon.</div>;
  return <div className="event-grid">{events.map((event, i) => {
    const Icon = icons[i % icons.length];
    return <article className="event-card" key={event._id}><div className={`event-art ${colors[i % colors.length]}`}><span className="event-art-icon"><Icon size={28}/></span><span className="event-tag">COMMUNITY</span><div className="art-decoration">✳</div></div><div className="event-content"><div className="event-meta"><span><CalendarDays size={14}/>{formatDate(event.date)}</span><span><MapPin size={14}/>{event.location}</span></div><h3>{event.title}</h3><p>{event.description || "Join our volunteers and make a positive difference in the community."}</p><div className="event-bottom"><span className="joined-count"><Users size={15}/>{event.registrations?.length || 0} joined</span><button onClick={() => onRegister(event._id)} className="event-link">Sign me up <ArrowRight size={15}/></button></div></div></article>;
  })}</div>;
}
function EmptyState({ text, onClick }) {
  return <div className="empty-card"><p>{text}</p><button className="button" onClick={onClick}>Register now <ArrowRight size={16}/></button></div>;
}
function formatDate(date) {
  if (!date) return "Date to be announced";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default App;
