import React from 'react';
import './Hero.css';

const Hero = ({ navigateTo }) => {
  return (
    <div className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          Decentralized Compute Marketplace
        </h1>
        <p className="hero-subtitle">
          Connect your Docker containers with distributed computing resources. 
          Find the best price, power, and performance for your workloads.
        </p>
        <div className="hero-buttons">
          <button 
            className="btn btn-primary hero-btn"
            onClick={() => navigateTo('submit-job')}
          >
            Submit Job
          </button>
          <button 
            className="btn btn-secondary hero-btn"
            onClick={() => navigateTo('dashboard')}
          >
            View Jobs
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">2,500+</span>
            <span className="stat-label">Active Providers</span>
          </div>
          <div className="stat">
            <span className="stat-value">10,000+</span>
            <span className="stat-label">Jobs Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">$0.02/hr</span>
            <span className="stat-label">Starting Price</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 