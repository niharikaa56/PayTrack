import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleSubmitContact = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setContactData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Exact Custom Simple Navbar from Screenshot with active React-controlled collapse */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 border-bottom border-light sticky-top">
        <div className="container d-flex align-items-center justify-content-between">
          <Link className="navbar-brand d-flex align-items-center gap-2 no-underline" to="/">
            {/* Custom PayTrack Logo from screenshot - Black receipt/bill stack with lines, bold Pay in dark, Track in blue */}
            <div className="text-dark fs-3 d-flex align-items-center">
              <i className="fa-solid fa-receipt text-dark me-2 fs-3"></i>
              <span className="fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Pay</span>
              <span className="fw-bold text-primary" style={{ letterSpacing: '-0.5px' }}>Track</span>
            </div>
          </Link>
          
          {/* Action Buttons are ALWAYS visible on the right, even on mobile */}
          <div className="d-flex align-items-center gap-2 order-lg-3 ms-auto me-2 me-lg-0">
            <Link to="/register" className="btn btn-outline-primary px-3 py-2 fw-semibold" style={{ borderRadius: '6px' }}>
              Signup
            </Link>
            <Link to="/login" className="btn btn-primary px-3 py-2 fw-semibold text-white" style={{ borderRadius: '6px' }}>
              Login
            </Link>
          </div>

          <button 
            className="navbar-toggler border-0 order-lg-4" 
            type="button" 
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            aria-controls="landingNavbar" 
            aria-expanded={!isNavCollapsed} 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse order-lg-2 ${isNavCollapsed ? '' : 'show'}`} id="landingNavbar">
            <ul className="navbar-nav mx-auto gap-3">
              <li className="nav-item">
                <a className="nav-link text-secondary fw-semibold" href="#" onClick={() => setIsNavCollapsed(true)}>Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-secondary fw-semibold" href="#features" onClick={() => setIsNavCollapsed(true)}>Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-secondary fw-semibold" href="#pricing" onClick={() => setIsNavCollapsed(true)}>Pricing</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-secondary fw-semibold" href="#features" onClick={() => setIsNavCollapsed(true)}>About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-secondary fw-semibold" href="#contact" onClick={() => setIsNavCollapsed(true)}>Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section styled exactly like first screenshot */}
      <header className="hero-section py-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            {/* Left side text and action buttons */}
            <div className="col-lg-6">
              {/* Pill badge with solid blue color */}
              <div className="d-inline-block mb-4">
                <span className="badge bg-primary px-3 py-2 text-white fw-bold" style={{ borderRadius: '6px', fontSize: '0.85rem' }}>
                  Smart Subscriptions. Zero Stress.
                </span>
              </div>
              
              <h1 className="fw-bold text-dark lh-sm mb-4" style={{ fontSize: '3.6rem', letterSpacing: '-1.5px' }}>
                Manage All Your <br />
                <span className="text-primary">Subscriptions</span> in One Place
              </h1>
              
              <p className="text-secondary fs-5 mb-5" style={{ maxWidth: '490px', lineHeight: '1.6' }}>
                Track renewals, manage payments, and never miss a due date. PayTrack helps you stay in control of all your subscriptions.
              </p>
              
              <div className="d-flex align-items-center gap-3">
                <Link to="/register" className="btn btn-primary btn-lg px-4 py-2.5 fw-semibold text-white" style={{ borderRadius: '8px', fontSize: '1.1rem' }}>
                  Get Started
                </Link>
                <Link to={user ? "/dashboard" : "/login"} className="btn btn-outline-dark btn-lg px-4 py-2.5 fw-semibold text-dark" style={{ borderRadius: '8px', fontSize: '1.1rem', border: '1px solid #1a1a1a' }}>
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Right side Dashboard Preview Card */}
            <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end">
              <div className="bg-white p-4 p-md-5 border border-secondary-subtle shadow-lg" style={{ borderRadius: '18px', width: '100%', maxWidth: '520px' }}>
                <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>Dashboard Preview</h3>
                
                {/* Two side-by-side stats */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="border border-secondary-subtle p-3 text-center" style={{ borderRadius: '12px' }}>
                      <div className="display-6 fw-bold text-dark mb-1">12</div>
                      <div className="text-secondary small fw-semibold">Subscriptions</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border border-secondary-subtle p-3 text-center" style={{ borderRadius: '12px' }}>
                      <div className="display-6 fw-bold text-dark mb-1">₹5430</div>
                      <div className="text-secondary small fw-semibold">Monthly Cost</div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Renewals list block */}
                <div className="border border-secondary-subtle p-3 p-md-4" style={{ borderRadius: '12px' }}>
                  <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.05rem' }}>Upcoming Renewals</h5>
                  <hr className="my-2 text-secondary-subtle" />
                  
                  <div className="d-flex flex-column gap-3 pt-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-dark fw-medium fs-5">Netflix - 12 July</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-dark fw-medium fs-5">Spotify - 15 July</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-dark fw-medium fs-5">Amazon Prime - 20 July</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid from original dashboard structure */}
      <section id="features" className="py-5 border-top border-light">
        <div className="container py-5 text-center">
          <h2 className="fw-bold mb-3 text-dark fs-1" style={{ letterSpacing: '-1px' }}>Engineered for Transparency</h2>
          <p className="text-secondary col-md-8 mx-auto fs-5 mb-5">Get absolute control over your software costs, renewal timelines, and dynamic usage tracking in one automated cockpit.</p>
          
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="card h-100 border border-secondary-subtle p-4 rounded-4 text-center bg-light">
                <div className="rounded-circle bg-primary text-white mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fa-solid fa-bell fs-4"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Renewal Reminders</h4>
                <p className="text-secondary mb-0">
                  Stay updated on upcoming payment cycles and avoid accidental subscription lock-ins.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border border-secondary-subtle p-4 rounded-4 text-center bg-light">
                <div className="rounded-circle bg-success text-white mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fa-solid fa-chart-pie fs-4"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Expense Tracking</h4>
                <p className="text-secondary mb-0">
                  Track dynamic monthly costs and organize subscription portfolios cleanly by category.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border border-secondary-subtle p-4 rounded-4 text-center bg-light">
                <div className="rounded-circle bg-info text-white mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fa-solid fa-shield-halved fs-4"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Central Database</h4>
                <p className="text-secondary mb-0">
                  Keep a precise catalog of plans, licenses, and invoice trails inside one organized workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section from screenshot description */}
      <section id="pricing" className="py-5 bg-light border-top border-bottom border-light">
        <div className="container py-5 text-center">
          <h2 className="fw-bold mb-3 text-dark fs-1" style={{ letterSpacing: '-1px' }}>Simplicity in Pricing</h2>
          <p className="text-secondary col-md-8 mx-auto fs-5 mb-5">Choose a plan that fits your size. Upgrade, downgrade, or cancel at any time with transparent prorated billing credits.</p>
          
          <div className="row justify-content-center g-4 mt-2">
            <div className="col-md-5 col-lg-4">
              <div className="card border border-secondary-subtle rounded-4 h-100 p-4 bg-white text-start">
                <div className="card-body">
                  <h4 className="fw-bold text-muted small text-uppercase mb-2">Basic Starter</h4>
                  <div className="d-flex align-items-baseline mb-3">
                    <span className="display-5 fw-bold text-dark">₹199</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <p className="text-secondary small mb-4">Perfect for individuals and small teams seeking cost control.</p>
                  <hr className="my-4 text-secondary-subtle" />
                  <ul className="list-unstyled mb-5 d-flex flex-column gap-2.5">
                    <li className="d-flex align-items-center gap-2 small">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>1 Active Subscription Tracker</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 small">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>5 active projects allowed</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 small">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>1,000 monthly API calls</span>
                    </li>
                  </ul>
                  <Link to="/register" className="btn btn-outline-primary w-100 py-2.5 fw-bold" style={{ borderRadius: '6px' }}>
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-5 col-lg-4">
              <div className="card border-primary border shadow rounded-4 h-100 p-4 position-relative bg-white text-start">
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary px-3 py-2 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>MOST POPULAR</span>
                <div className="card-body">
                  <h4 className="fw-bold text-primary small text-uppercase mb-2 mt-2">Pro Growth</h4>
                  <div className="d-flex align-items-baseline mb-3">
                    <span className="display-5 fw-bold text-dark">₹1799</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <p className="text-secondary small mb-4">Ideal for professionals and scaling operations looking for efficiency.</p>
                  <hr className="my-4 text-secondary-subtle" />
                  <ul className="list-unstyled mb-5 d-flex flex-column gap-2.5">
                    <li className="d-flex align-items-center gap-2 small fw-semibold">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>5 Active Users / Trackers</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 small">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>25 active projects</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 small">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>10,000 monthly API calls</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 small">
                      <i className="fa-solid fa-check text-primary"></i>
                      <span>Priority support response</span>
                    </li>
                  </ul>
                  <Link to="/register" className="btn btn-primary w-100 py-2.5 fw-bold text-white shadow-sm" style={{ borderRadius: '6px' }}>
                    Choose Pro Plan
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect with us Form Section */}
      <section id="contact" className="py-5 bg-white mb-5">
        <div className="container py-5 col-lg-6">
          <div className="text-center mb-5">
            <h2 className="fw-bold fs-1 mb-2 text-dark" style={{ letterSpacing: '-1px' }}>Connect with Us</h2>
            <p className="text-secondary fs-5">Need a custom plan or enterprise-level SLA? Drop us a line.</p>
          </div>
          <div className="card border border-secondary-subtle shadow rounded-4 p-4 p-md-5 bg-light">
            {submitted ? (
              <div className="alert alert-success text-center py-4 mb-0" role="alert">
                <i className="fa-solid fa-circle-check fs-2 mb-2 d-block text-success"></i>
                <h4 className="fw-bold">Message Transmitted!</h4>
                <p className="mb-0 small text-muted">Thank you for connecting. We'll respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact}>
                <div className="mb-3">
                  <label htmlFor="contactName" className="form-label fw-bold small text-dark">Full Name</label>
                  <input 
                    type="text" 
                    id="contactName"
                    className="form-control px-3 py-2.5" 
                    required 
                    style={{ borderRadius: '6px' }}
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="contactEmail" className="form-label fw-bold small text-dark">Email Address</label>
                  <input 
                    type="email" 
                    id="contactEmail"
                    className="form-control px-3 py-2.5" 
                    required 
                    style={{ borderRadius: '6px' }}
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="contactMessage" className="form-label fw-bold small text-dark">Your Message</label>
                  <textarea 
                    id="contactMessage"
                    className="form-control px-3 py-2.5" 
                    rows="4" 
                    required
                    style={{ borderRadius: '6px' }}
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2.5 fw-bold text-white shadow-sm" style={{ borderRadius: '6px' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-4 border-top text-center text-secondary">
        <p className="mb-0 small fw-semibold">© 2026 PayTrack Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
