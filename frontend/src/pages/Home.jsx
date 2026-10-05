import { useState } from "react";
import { Link } from "react-router-dom";
import CivicAIChat from "../components/CivicAIChat";
import civicBird from "../assets/CivicAI.png";

function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">

          <p className="tagline">
            SMART CITIZEN GRIEVANCE PORTAL
          </p>

          <h1>
            Your Complaint.
            <br />
            <span>Our Responsibility.</span>
          </h1>

          <p className="hero-description">
            Report civic problems, let CivicAI intelligently classify your
            grievance, and track it until resolution.
          </p>

          <div className="hero-buttons">
            <Link to="/submit" className="primary-btn">
              Submit a Grievance
            </Link>

            <Link to="/track" className="secondary-btn">
              Track Grievance
            </Link>
          </div>

          {/* HERO FEATURES */}
          <div className="hero-features">

            <div className="hero-feature">
              <div>
                <strong>AI Classification</strong>
                <small>Smart grievance analysis</small>
              </div>
            </div>

            <div className="hero-feature">
              <div>
                <strong>Priority Detection</strong>
                <small>Identify urgent issues</small>
              </div>
            </div>

            <div className="hero-feature">
              <div>
                <strong>Department Routing</strong>
                <small>Connect to the right department</small>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* CATEGORIES */}
      <section className="categories">

        <div className="section-heading">
          <p className="section-tag">REPORT AN ISSUE</p>

          <h2>What can you report?</h2>

          <p className="section-description">
            Report common civic issues in your area and help improve
            your community.
          </p>
        </div>

        <div className="category-grid">

          <div className="category-card">
            <div className="icon">🛣️</div>
            <h3>Roads & Potholes</h3>
            <p>
              Report potholes, damaged roads and other road-related problems.
            </p>
          </div>

          <div className="category-card">
            <div className="icon">💧</div>
            <h3>Water Supply</h3>
            <p>
              Report water supply interruptions, leakage and pipeline issues.
            </p>
          </div>

          <div className="category-card">
            <div className="icon">🗑️</div>
            <h3>Waste Management</h3>
            <p>
              Report garbage accumulation, collection and cleanliness issues.
            </p>
          </div>

          <div className="category-card">
            <div className="icon">⚡</div>
            <h3>Electricity</h3>
            <p>
              Report power supply problems and electrical infrastructure issues.
            </p>
          </div>

          <div className="category-card">
            <div className="icon">🚰</div>
            <h3>Drainage</h3>
            <p>
              Report overflowing drains, sewage and drainage problems.
            </p>
          </div>

          <div className="category-card">
            <div className="icon">🚔</div>
            <h3>Public Safety</h3>
            <p>
              Report unsafe conditions and other public safety concerns.
            </p>
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="how-it-works">

        <div className="section-heading">
          <p className="section-tag">SIMPLE PROCESS</p>

          <h2>How CivicAI Works</h2>

          <p className="section-description">
            From submitting a complaint to receiving a resolution,
            CivicAI provides a structured grievance management process.
          </p>
        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>
            <h3>Submit</h3>
            <p>
              Describe your civic problem and provide its location.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Classify</h3>
            <p>
              CivicAI analyzes the grievance and identifies its category
              and priority.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Assign</h3>
            <p>
              The grievance is routed to the appropriate department.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Resolve</h3>
            <p>
              Track the grievance status until the resolution is provided.
            </p>
          </div>

        </div>

      </section>


      {/* CALL TO ACTION */}
      <section className="cta-section">

        <div className="cta-content">

          <p className="section-tag">MAKE A DIFFERENCE</p>

          <h2>
            Have a civic issue?
            <br />
            <span>Report it today.</span>
          </h2>

          <p>
            Submit your grievance and help make your community
            cleaner, safer and better.
          </p>

          <Link to="/submit" className="primary-btn">
            Submit Your Grievance
          </Link>

        </div>

      </section>


      {/* FOOTER */}
      <footer>

        <div className="footer-content">

          <div className="footer-brand">
            <h3>
              Civic<span>AI</span>
            </h3>

            <p>
              AI-Based Citizen Grievance Classification
              and Resolution Support System.
            </p>
          </div>


        </div>

        <div className="footer-bottom">
          <p>
            © 2026 CivicAI — Citizen Grievance Portal
          </p>
        </div>

      </footer>


      {/* CIVICAI CHAT */}
      <CivicAIChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />


      {/* FLOATING CIVICAI BIRD */}
      <div className="civic-bird">

        <div className="civic-bird-message">
          Hi! I'm CivicAI 👋
          <span>Need help with a grievance?</span>
        </div>

        <button
          className="civic-bird-button"
          aria-label="Open CivicAI Assistant"
          onClick={() => setChatOpen(true)}
        >
          <img
            src={civicBird}
            alt="CivicAI Assistant"
          />
        </button>

      </div>

    </>
  );
}

export default Home;