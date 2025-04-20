import React from 'react';
import Hero from '../../components/Hero/Hero';
import './LandingPage.css';

const LandingPage = ({ navigateTo }) => {
  return (
    <div className="landing-page">
      <Hero navigateTo={navigateTo} />
      
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 16L12 21L4 16M20 12L12 17L4 12M20 8L12 13L4 8L12 3L20 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Submit Your Docker Job</h3>
              <p className="feature-description">
                Provide your Docker Hub image URL, specify requirements,
                and set your maximum price. Our platform handles the rest.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Receive Provider Bids</h3>
              <p className="feature-description">
                Providers compete to offer you the best price and timeframe.
                Review bids and select the one that fits your needs.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12H2M16 6L22 12L16 18M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Execute Your Workload</h3>
              <p className="feature-description">
                Once accepted, your job runs on the provider's infrastructure.
                Track progress and receive results in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to try distributed computing?</h2>
            <p className="cta-description">
              Submit your first job in just a few clicks and join thousands of users
              benefiting from decentralized compute power.
            </p>
            <button 
              className="btn btn-primary cta-button"
              onClick={() => navigateTo('submit-job')}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
      
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-text">Compute</span>
              <span className="logo-text accent">Market</span>
            </div>
            <p className="footer-copyright">
              © 2025 Decentralized Compute Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 