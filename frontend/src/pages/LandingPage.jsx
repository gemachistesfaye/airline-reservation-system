import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Plane, Users, Star, Feather, ShieldCheck, Clock } from 'lucide-react';

// ----- Top Navigation -----
function TopNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between bg-neutral-950 bg-opacity-90 backdrop-blur-md px-6 py-3 z-50">
      <ul className="flex space-x-6">
        <li><NavLink to="/" className="text-base text-neutral-300 hover:text-white transition-colors">Home</NavLink></li>
        <li><NavLink to="/login" className="text-base text-neutral-300 hover:text-white transition-colors">Sign In</NavLink></li>
      </ul>
      {/* Reserved for future brand/logo */}
      <div />
    </nav>
  );
}

// ----- Hero Section -----
function Hero() {
  return (
    <section className="px-4 text-center mt-20">
      <h1 className="text-xl font-display text-white mb-2">Travel Made Simple</h1>
      <h2 className="text-xl font-display text-neutral-400 mb-4">Fast • Safe • Seamless</h2>
      <p className="text-base text-neutral-400 max-w-2xl mx-auto mb-6">
        Book your flights in seconds, enjoy transparent pricing, and experience a premium journey from take‑off to landing.
      </p>
    </section>
  );
}

// ----- Compact Search Bar -----
function SearchBar() {
  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-5xl bg-neutral-900 rounded-xl p-6 flex flex-wrap items-center gap-4">
        <button className="text-base text-neutral-400 hover:text-white transition-colors">One Way</button>
        <button className="text-base text-neutral-400 hover:text-white transition-colors">Round Trip</button>
        <input type="text" placeholder="From" className="flex-1 min-w-[120px] bg-neutral-800 text-base text-white placeholder:text-sm placeholder:text-neutral-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        <input type="text" placeholder="To" className="flex-1 min-w-[120px] bg-neutral-800 text-base text-white placeholder:text-sm placeholder:text-neutral-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        <input type="date" className="flex-1 min-w-[150px] bg-neutral-800 text-base text-white placeholder:text-sm placeholder:text-neutral-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        <button type="submit" className="btn-primary text-base mt-2 md:mt-0 self-end">Search Flights</button>
      </div>
    </section>
  );
}

// ----- Stats Grid -----
const stats = [
  { label: '99.9% On‑time' },
  { label: '150+ Destinations' },
  { label: '3M+ Passengers' },
];
function StatsGrid() {
  return (
    <section className="mt-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-neutral-900 rounded-xl p-4 text-center">
            <p className="text-base text-neutral-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----- Featured Destinations -----
const destinations = [
  { city: 'New York', country: 'USA', tag: 'Popular' },
  { city: 'Paris', country: 'France', tag: 'Romantic' },
  { city: 'Dubai', country: 'UAE', tag: 'Luxury' },
  { city: 'Tokyo', country: 'Japan', tag: 'Tech' },
];
function Destinations() {
  return (
    <section className="mt-12 px-4">
      <h2 className="text-xl font-display text-white mb-6 text-center">Featured Destinations</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((d, i) => (
          <div key={i} className="bg-neutral-900 rounded-xl p-4 text-center">
            <Plane size={24} className="text-primary-600 mx-auto mb-2" />
            <p className="text-base font-medium text-neutral-100">{d.city}</p>
            <p className="text-sm text-neutral-400">{d.country}</p>
            <p className="text-sm text-neutral-400 mt-1">{d.tag}</p>
            <Link to="/flights" className="btn-primary text-base mt-3 inline-block">Explore</Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----- Minimal Footer -----
function Footer() {
  return (
    <footer className="mt-4 bg-neutral-900 py-2 text-neutral-400 text-xs">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p>+1 (800) 555‑FLY | support@flyapp.com</p>
        <p className="mt-1">© 2026 FlyApp. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ----- Main Landing Page -----
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-16">
      <TopNav />
      <Hero />
      <SearchBar />
      <StatsGrid />
      <Destinations />
      <Footer />
    </div>
  );
}
